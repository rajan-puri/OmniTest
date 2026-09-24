import fs from "fs";
import path from "path";
import { PNG } from "pngjs";
import { db } from "../db";

export interface VisualBaselineInfo {
  testId: string;
  exists: boolean;
  filePath?: string;
  url?: string;
  width?: number;
  height?: number;
  sizeBytes?: number;
  createdAt?: string;
  updatedAt?: string;
  updatedBy?: string;
  artifactId?: string;
}

function getWebDir(): string {
  let webDir = process.cwd();
  try {
    const pkgPath = path.join(webDir, "package.json");
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
      if (pkg.name !== "@omnitest/web" && fs.existsSync(path.join(webDir, "apps", "web"))) {
        webDir = path.join(webDir, "apps", "web");
      }
    }
  } catch {}
  return webDir;
}

export function getBaselinePath(testId: string): { dir: string; filePath: string; url: string } {
  const webDir = getWebDir();
  const dir = path.join(webDir, "public", "artifacts", "baselines", testId);
  const filePath = path.join(dir, "baseline.png");
  const url = `/artifacts/baselines/${testId}/baseline.png`;
  return { dir, filePath, url };
}

/**
 * Retrieves the active visual baseline for a given test.
 */
export async function getTestBaseline(testId: string): Promise<VisualBaselineInfo> {
  const { filePath, url } = getBaselinePath(testId);

  // Check file system existence
  if (!fs.existsSync(filePath)) {
    return {
      testId,
      exists: false,
    };
  }

  try {
    const stats = fs.statSync(filePath);
    const buffer = fs.readFileSync(filePath);
    const png = PNG.sync.read(buffer);

    // Look up test config for metadata
    const test = await db.test.findUnique({
      where: { id: testId },
      select: { config: true },
    });

    let configMeta: any = {};
    if (test?.config) {
      try {
        const parsed = typeof test.config === "string" ? JSON.parse(test.config) : test.config;
        configMeta = parsed.visualBaseline || {};
      } catch {}
    }

    return {
      testId,
      exists: true,
      filePath,
      url,
      width: png.width,
      height: png.height,
      sizeBytes: stats.size,
      createdAt: configMeta.createdAt || stats.birthtime.toISOString(),
      updatedAt: configMeta.updatedAt || stats.mtime.toISOString(),
      updatedBy: configMeta.updatedBy,
      artifactId: configMeta.artifactId,
    };
  } catch (err) {
    console.error(`Error reading visual baseline for test ${testId}:`, err);
    return {
      testId,
      exists: false,
    };
  }
}

/**
 * Creates or updates a test baseline from a raw PNG image buffer.
 */
export async function saveBaselineFromBuffer(
  testId: string,
  buffer: Buffer,
  meta?: {
    userEmail?: string;
    testRunId?: string;
    testResultId?: string;
  }
): Promise<VisualBaselineInfo> {
  const { dir, filePath, url } = getBaselinePath(testId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, buffer);

  const png = PNG.sync.read(buffer);
  const stats = fs.statSync(filePath);
  const nowIso = new Date().toISOString();

  // Create an Artifact entry if testRunId is provided
  let artifactId: string | undefined;
  if (meta?.testRunId) {
    try {
      const art = await db.artifact.create({
        data: {
          testRunId: meta.testRunId,
          testResultId: meta.testResultId || null,
          type: "VISUAL_BASELINE",
          fileName: `baseline_${testId.slice(0, 8)}.png`,
          s3Key: filePath,
          s3Bucket: "local-storage",
          contentType: "image/png",
          sizeBytes: BigInt(stats.size),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), // 1 year
        },
      });
      artifactId = art.id;
    } catch (err) {
      console.warn("Failed to create baseline artifact record:", err);
    }
  }

  // Update test.config to store visualBaseline metadata
  const test = await db.test.findUnique({
    where: { id: testId },
    select: { config: true },
  });

  if (test) {
    let parsedConfig: any = {};
    try {
      parsedConfig = typeof test.config === "string" ? JSON.parse(test.config) : test.config;
    } catch {}

    parsedConfig.visualBaseline = {
      artifactId,
      url,
      width: png.width,
      height: png.height,
      sizeBytes: stats.size,
      updatedAt: nowIso,
      updatedBy: meta?.userEmail || "system",
      createdAt: parsedConfig.visualBaseline?.createdAt || nowIso,
    };

    await db.test.update({
      where: { id: testId },
      data: {
        config: JSON.stringify(parsedConfig),
      },
    });
  }

  return {
    testId,
    exists: true,
    filePath,
    url,
    width: png.width,
    height: png.height,
    sizeBytes: stats.size,
    createdAt: nowIso,
    updatedAt: nowIso,
    updatedBy: meta?.userEmail,
    artifactId,
  };
}

/**
 * Creates or updates a test baseline by adopting an existing artifact (e.g. VISUAL_CURRENT or SCREENSHOT).
 */
export async function setBaselineFromArtifact(
  testId: string,
  artifactId: string,
  userEmail?: string
): Promise<VisualBaselineInfo> {
  const artifact = await db.artifact.findUnique({
    where: { id: artifactId },
  });

  if (!artifact) {
    throw new Error(`Artifact ${artifactId} not found.`);
  }

  let sourcePath = artifact.s3Key;
  if (!fs.existsSync(sourcePath)) {
    // Try resolving relative to public folder if s3Key was stored relative
    const webDir = getWebDir();
    const candidate = path.join(webDir, "public", sourcePath.replace(/^\/+/, ""));
    if (fs.existsSync(candidate)) {
      sourcePath = candidate;
    } else {
      throw new Error(`Artifact file ${artifact.s3Key} does not exist on disk.`);
    }
  }

  const buffer = fs.readFileSync(sourcePath);
  return saveBaselineFromBuffer(testId, buffer, {
    userEmail,
    testRunId: artifact.testRunId,
    testResultId: artifact.testResultId || undefined,
  });
}

/**
 * Deletes the baseline for a test.
 */
export async function deleteBaseline(testId: string): Promise<boolean> {
  const { filePath } = getBaselinePath(testId);

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.warn(`Failed to unlink baseline file for test ${testId}:`, err);
    }
  }

  const test = await db.test.findUnique({
    where: { id: testId },
    select: { config: true },
  });

  if (test) {
    try {
      const parsedConfig = typeof test.config === "string" ? JSON.parse(test.config) : test.config;
      delete parsedConfig.visualBaseline;
      await db.test.update({
        where: { id: testId },
        data: {
          config: JSON.stringify(parsedConfig),
        },
      });
    } catch {}
  }

  return true;
}
