export type VisualComparisonStatus =
  | "PASSED"
  | "FAILED"
  | "NO_BASELINE"
  | "DIMENSION_MISMATCH"
  | "ERROR";

export interface VisualIgnoreRegion {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
}

export interface VisualRegressionConfig {
  enabled: boolean;
  threshold: number; // Difference percentage threshold: 0.1 means 0.1% (0.001 fractional)
  diffPixelThreshold?: number; // Pixelmatch sensitivity: 0 to 1, default 0.1
  viewport: {
    width: number;
    height: number;
  };
  screenshotMode?: "viewport" | "fullPage";
  ignoreRegions?: VisualIgnoreRegion[];
  ignoreSelectors?: string[];
  disableAnimations?: boolean;
}

export interface VisualComparisonMetrics {
  totalPixels: number;
  changedPixels: number;
  differencePercentage: number; // e.g. 0.142 (%)
  thresholdPercentage: number; // e.g. 0.10 (%)
  passed: boolean;
  baselineWidth: number;
  baselineHeight: number;
  currentWidth: number;
  currentHeight: number;
}

export interface VisualComparisonResult {
  status: VisualComparisonStatus;
  metrics?: VisualComparisonMetrics;
  baselineArtifactId?: string;
  baselineUrl?: string;
  currentArtifactId?: string;
  currentUrl?: string;
  diffArtifactId?: string;
  diffUrl?: string;
  errorMessage?: string;
  viewport: {
    width: number;
    height: number;
  };
  screenshotMode: "viewport" | "fullPage";
  createdAt: string;
}

export interface VisualBaselineMetadata {
  testId: string;
  viewport: {
    width: number;
    height: number;
  };
  screenshotMode: "viewport" | "fullPage";
  browser?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}
