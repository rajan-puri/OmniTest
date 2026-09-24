import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { compileResultArtifacts } from "@/lib/artifacts/artifact-helper";

export async function GET(
  request: Request,
  {
    params,
  }: {
    params: {
      projectId: string;
      runId: string;
      resultId: string;
      artifactId: string;
    };
  }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { projectId, runId, resultId, artifactId } = params;

  // Retrieve project and verify user organization authorization
  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId: user.id },
          },
        },
      },
    },
  });

  if (!project || project.organization.members.length === 0) {
    return NextResponse.json({ error: "Project not found or access denied." }, { status: 404 });
  }

  // Retrieve test result
  const testResult = await db.testResult.findUnique({
    where: { id: resultId },
    include: {
      artifacts: true,
    },
  });

  if (!testResult || testResult.testRunId !== runId) {
    return NextResponse.json({ error: "Test result not found in this run." }, { status: 404 });
  }

  const url = new URL(request.url);
  const isDownload = url.searchParams.get("download") === "true";

  // Case A: Virtual Diagnostic Artifact
  if (artifactId.startsWith("virt-")) {
    const allArtifacts = compileResultArtifacts(projectId, runId, testResult);
    const targetArt = allArtifacts.find((a) => a.id === artifactId);

    if (!targetArt) {
      return NextResponse.json({ error: "Artifact not found." }, { status: 404 });
    }

    const metrics =
      typeof testResult.metrics === "string"
        ? (() => {
            try {
              return JSON.parse(testResult.metrics);
            } catch {
              return {};
            }
          })()
        : testResult.metrics || {};

    let content = "";
    if (artifactId.startsWith("virt-log-")) {
      content = (metrics.consoleErrors || [])
        .map((err: any, idx: number) => `[${idx + 1}] [ERROR] ${err.text || JSON.stringify(err)}`)
        .join("\n");
    } else if (artifactId.startsWith("virt-net-")) {
      content = JSON.stringify(metrics.networkFailures || [], null, 2);
    } else if (artifactId.startsWith("virt-api-")) {
      content = JSON.stringify(metrics, null, 2);
    } else if (artifactId.startsWith("virt-a11y-")) {
      content = JSON.stringify(metrics, null, 2);
    } else if (artifactId.startsWith("virt-perf-")) {
      content = JSON.stringify(metrics, null, 2);
    } else if (artifactId.startsWith("virt-seo-")) {
      content = JSON.stringify(metrics, null, 2);
    } else if (artifactId.startsWith("virt-steps-")) {
      const steps =
        typeof testResult.stepResults === "string"
          ? JSON.parse(testResult.stepResults)
          : testResult.stepResults || [];
      content = JSON.stringify(steps, null, 2);
    }

    const headers: Record<string, string> = {
      "Content-Type": `${targetArt.contentType}; charset=utf-8`,
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="${targetArt.fileName}"`;
    }

    return new NextResponse(content, {
      status: 200,
      headers,
    });
  }

  // Case B: Physical Stored Artifact
  const physicalArtifact = await db.artifact.findUnique({
    where: { id: artifactId },
  });

  if (!physicalArtifact || physicalArtifact.testRunId !== runId) {
    return NextResponse.json({ error: "Artifact file record not found." }, { status: 404 });
  }

  // Determine physical location on disk
  let filePath = physicalArtifact.s3Key;
  if (!fs.existsSync(filePath)) {
    // Check fallback in public/artifacts/runs/...
    const fallbackPath = path.join(
      process.cwd(),
      "public",
      "artifacts",
      "runs",
      runId,
      physicalArtifact.fileName
    );
    if (fs.existsSync(fallbackPath)) {
      filePath = fallbackPath;
    }
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Artifact file exists in database record but could not be located on storage." },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(filePath);
  const headers: Record<string, string> = {
    "Content-Type": physicalArtifact.contentType || "application/octet-stream",
    "Content-Length": fileBuffer.length.toString(),
  };

  if (isDownload) {
    headers["Content-Disposition"] = `attachment; filename="${physicalArtifact.fileName}"`;
  }

  return new NextResponse(fileBuffer, {
    status: 200,
    headers,
  });
}
