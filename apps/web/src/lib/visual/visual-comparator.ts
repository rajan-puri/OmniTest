import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { VisualComparisonMetrics, VisualComparisonStatus, VisualRegressionConfig, VisualIgnoreRegion } from "./visual-types";

export interface ScreenshotComparisonResult {
  status: VisualComparisonStatus;
  passed: boolean;
  metrics: VisualComparisonMetrics;
  diffBuffer?: Buffer;
  errorMessage?: string;
}

/**
 * Compares two PNG image buffers pixel-by-pixel using pixelmatch and pngjs.
 * Handles dimension verification, ignore regions, diff generation, and deterministic pass/fail threshold.
 */
export function compareScreenshots(
  baselineBuffer: Buffer,
  currentBuffer: Buffer,
  config?: Partial<VisualRegressionConfig>
): ScreenshotComparisonResult {
  const thresholdPct = typeof config?.threshold === "number" ? config.threshold : 0.1; // Default 0.1%
  const pixelSensitivity = typeof config?.diffPixelThreshold === "number" ? config.diffPixelThreshold : 0.1; // pixelmatch default 0.1

  let baselinePng: PNG;
  let currentPng: PNG;

  try {
    baselinePng = PNG.sync.read(baselineBuffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to decode baseline PNG image: ${msg}`);
  }

  try {
    currentPng = PNG.sync.read(currentBuffer);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to decode current PNG image: ${msg}`);
  }

  const baselineWidth = baselinePng.width;
  const baselineHeight = baselinePng.height;
  const currentWidth = currentPng.width;
  const currentHeight = currentPng.height;

  // 1. Dimension validation
  if (baselineWidth !== currentWidth || baselineHeight !== currentHeight) {
    const totalPixels = baselineWidth * baselineHeight;
    return {
      status: "DIMENSION_MISMATCH",
      passed: false,
      metrics: {
        totalPixels,
        changedPixels: Math.abs(totalPixels - (currentWidth * currentHeight)),
        differencePercentage: 100,
        thresholdPercentage: thresholdPct,
        passed: false,
        baselineWidth,
        baselineHeight,
        currentWidth,
        currentHeight,
      },
      errorMessage: `Dimension mismatch: Baseline is ${baselineWidth}x${baselineHeight}, but current screenshot is ${currentWidth}x${currentHeight}.`,
    };
  }

  const width = baselineWidth;
  const height = baselineHeight;
  const totalPixels = width * height;

  if (totalPixels === 0) {
    return {
      status: "ERROR",
      passed: false,
      metrics: {
        totalPixels: 0,
        changedPixels: 0,
        differencePercentage: 0,
        thresholdPercentage: thresholdPct,
        passed: false,
        baselineWidth,
        baselineHeight,
        currentWidth,
        currentHeight,
      },
      errorMessage: "Zero-pixel image encountered.",
    };
  }

  // Clone buffers for ignore region masking so originals stay intact
  const img1Data = Buffer.from(baselinePng.data);
  const img2Data = Buffer.from(currentPng.data);

  // 2. Apply Ignore Regions (e.g. dynamic timestamps, banners, or ads)
  if (config?.ignoreRegions && Array.isArray(config.ignoreRegions)) {
    for (const region of config.ignoreRegions) {
      applyIgnoreRegion(img1Data, img2Data, width, height, region);
    }
  }

  // 3. Prepare diff output buffer
  const diffPng = new PNG({ width, height });

  // Resolve pixelmatch function (handling ESM / CJS module compatibility)
  const pmFn = typeof pixelmatch === "function" ? pixelmatch : (pixelmatch as any).default;

  const changedPixels = pmFn(
    img1Data,
    img2Data,
    diffPng.data,
    width,
    height,
    {
      threshold: pixelSensitivity,
      includeAA: false,
      diffColor: [255, 0, 77], // Vibrant magenta-red for diff highlighting
      diffColorAlt: [0, 220, 255], // Cyan for secondary diff
    }
  );

  const differencePercentage = Number(((changedPixels / totalPixels) * 100).toFixed(4));
  const passed = differencePercentage <= thresholdPct;
  const status: VisualComparisonStatus = passed ? "PASSED" : "FAILED";

  const diffBuffer = PNG.sync.write(diffPng);

  return {
    status,
    passed,
    metrics: {
      totalPixels,
      changedPixels,
      differencePercentage,
      thresholdPercentage: thresholdPct,
      passed,
      baselineWidth,
      baselineHeight,
      currentWidth,
      currentHeight,
    },
    diffBuffer,
    errorMessage: passed
      ? undefined
      : `Visual regression difference of ${differencePercentage}% exceeded threshold of ${thresholdPct}%. (${changedPixels.toLocaleString()} / ${totalPixels.toLocaleString()} changed pixels)`,
  };
}

/**
 * Masks out an ignore region by synchronizing pixels between img1 and img2 in that bounding box,
 * preventing pixelmatch from registering differences inside the region.
 */
function applyIgnoreRegion(
  img1: Buffer,
  img2: Buffer,
  imageWidth: number,
  imageHeight: number,
  region: VisualIgnoreRegion
) {
  const startX = Math.max(0, Math.floor(region.x));
  const startY = Math.max(0, Math.floor(region.y));
  const endX = Math.min(imageWidth, Math.ceil(region.x + region.width));
  const endY = Math.min(imageHeight, Math.ceil(region.y + region.height));

  for (let y = startY; y < endY; y++) {
    for (let x = startX; x < endX; x++) {
      const idx = (imageWidth * y + x) * 4;
      // Copy img1 pixel to img2 so they match identically
      img2[idx] = img1[idx];
      img2[idx + 1] = img1[idx + 1];
      img2[idx + 2] = img1[idx + 2];
      img2[idx + 3] = img1[idx + 3];
    }
  }
}
