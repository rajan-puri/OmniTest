import { VisualRegressionConfig, VisualComparisonResult } from "../visual/visual-types";

export type StepAction =
  | "goto"
  | "click"
  | "fill"
  | "press"
  | "wait"
  | "screenshot"
  | "assert_url"
  | "assert_text"
  | "assert_visible";

export interface StepOptions {
  timeoutMs?: number;
  state?: "visible" | "hidden" | "attached" | "detached";
  fullPage?: boolean;
}

export interface TestStep {
  id: string;
  action: StepAction;
  target?: string; // URL, selector, key, or duration ms
  value?: string;  // text to fill, expected text, or screenshot name
  options?: StepOptions;
}

export interface TestSpec {
  version: "1.0";
  name: string;
  description?: string;
  viewport?: {
    width: number;
    height: number;
  };
  timeoutSeconds?: number;
  visualRegression?: VisualRegressionConfig;
  steps: TestStep[];
}

export interface StepExecutionResult {
  stepId: string;
  action: StepAction;
  status: "PASSED" | "FAILED" | "SKIPPED";
  durationMs: number;
  errorMessage?: string;
  screenshotUrl?: string;
}

export interface ConsoleErrorRecord {
  text: string;
  location?: string;
  timestamp: string;
}

export interface NetworkFailureRecord {
  url: string;
  method: string;
  status?: number;
  errorText?: string;
  timestamp: string;
}

export interface CapturedArtifact {
  type: "SCREENSHOT" | "LOG_STDOUT" | "LOG_HAR" | "VISUAL_BASELINE" | "VISUAL_CURRENT" | "VISUAL_DIFF";
  fileName: string;
  filePath: string;
  url: string;
  sizeBytes: number;
}

export interface TestExecutionResult {
  status: "PASSED" | "FAILED" | "TIMED_OUT";
  durationMs: number;
  totalSteps: number;
  passedSteps: number;
  failedSteps: number;
  stepResults: StepExecutionResult[];
  consoleErrors: ConsoleErrorRecord[];
  networkFailures: NetworkFailureRecord[];
  artifacts: CapturedArtifact[];
  visualComparison?: VisualComparisonResult;
  errorSummary?: string;
  stackTrace?: string;
}
