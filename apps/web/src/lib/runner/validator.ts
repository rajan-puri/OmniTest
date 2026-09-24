import { TestSpec, TestStep, StepAction } from "./types";

const VALID_ACTIONS: StepAction[] = [
  "goto",
  "click",
  "fill",
  "press",
  "wait",
  "screenshot",
  "assert_url",
  "assert_text",
  "assert_visible",
];

export class ValidationError extends Error {
  constructor(message: string, public readonly stepIndex?: number) {
    super(message);
    this.name = "ValidationError";
  }
}

export function validateTestSpec(spec: unknown): TestSpec {
  if (!spec || typeof spec !== "object") {
    throw new ValidationError("Test specification must be a JSON object.");
  }

  const s = spec as Partial<TestSpec>;

  if (s.version !== "1.0") {
    throw new ValidationError(`Unsupported spec version "${s.version}". Expected "1.0".`);
  }

  if (!s.name || typeof s.name !== "string" || !s.name.trim()) {
    throw new ValidationError("Test name is required.");
  }

  if (!Array.isArray(s.steps)) {
    throw new ValidationError("Test steps must be an array.");
  }

  if (s.steps.length === 0) {
    throw new ValidationError("At least one test step must be defined.");
  }

  const validatedSteps = s.steps.map((step, idx) => validateStep(step, idx));

  return {
    version: "1.0",
    name: s.name.trim(),
    description: s.description?.trim(),
    viewport: s.viewport || { width: 1280, height: 720 },
    timeoutSeconds: s.timeoutSeconds || 60,
    visualRegression: s.visualRegression
      ? {
          enabled: Boolean(s.visualRegression.enabled),
          threshold: typeof s.visualRegression.threshold === "number" ? s.visualRegression.threshold : 0.1,
          diffPixelThreshold: typeof s.visualRegression.diffPixelThreshold === "number" ? s.visualRegression.diffPixelThreshold : 0.1,
          viewport: s.visualRegression.viewport || s.viewport || { width: 1280, height: 720 },
          screenshotMode: s.visualRegression.screenshotMode === "fullPage" ? "fullPage" : "viewport",
          ignoreRegions: Array.isArray(s.visualRegression.ignoreRegions) ? s.visualRegression.ignoreRegions : [],
          ignoreSelectors: Array.isArray(s.visualRegression.ignoreSelectors) ? s.visualRegression.ignoreSelectors : [],
          disableAnimations: s.visualRegression.disableAnimations ?? true,
        }
      : undefined,
    steps: validatedSteps,
  };
}

export function validateStep(step: unknown, index: number): TestStep {
  if (!step || typeof step !== "object") {
    throw new ValidationError(`Step at index ${index} must be an object.`, index);
  }

  const st = step as Partial<TestStep>;

  if (!st.action || !VALID_ACTIONS.includes(st.action as StepAction)) {
    throw new ValidationError(
      `Invalid action "${st.action}" at step ${index + 1}. Valid actions: ${VALID_ACTIONS.join(", ")}`,
      index
    );
  }

  const id = st.id || `step_${index + 1}_${Date.now()}`;
  const action = st.action as StepAction;
  const target = st.target?.trim();
  const value = st.value !== undefined ? String(st.value).trim() : undefined;

  switch (action) {
    case "goto":
      if (!target) {
        throw new ValidationError(`Step ${index + 1} ("goto"): URL target is required.`, index);
      }
      break;

    case "click":
      if (!target) {
        throw new ValidationError(`Step ${index + 1} ("click"): Target selector is required.`, index);
      }
      break;

    case "fill":
      if (!target) {
        throw new ValidationError(`Step ${index + 1} ("fill"): Target input selector is required.`, index);
      }
      if (value === undefined) {
        throw new ValidationError(`Step ${index + 1} ("fill"): Text value is required.`, index);
      }
      break;

    case "press":
      if (!target) {
        throw new ValidationError(`Step ${index + 1} ("press"): Key name (e.g. "Enter") is required.`, index);
      }
      break;

    case "wait":
      if (!target) {
        throw new ValidationError(`Step ${index + 1} ("wait"): Duration (ms) or selector is required.`, index);
      }
      break;

    case "assert_url":
      if (!target && !value) {
        throw new ValidationError(`Step ${index + 1} ("assert_url"): Expected URL pattern is required.`, index);
      }
      break;

    case "assert_text":
      if (!target) {
        throw new ValidationError(`Step ${index + 1} ("assert_text"): Target element selector is required.`, index);
      }
      if (value === undefined) {
        throw new ValidationError(`Step ${index + 1} ("assert_text"): Expected text value is required.`, index);
      }
      break;

    case "assert_visible":
      if (!target) {
        throw new ValidationError(`Step ${index + 1} ("assert_visible"): Target selector is required.`, index);
      }
      break;

    case "screenshot":
      // Optional target/value
      break;
  }

  return {
    id,
    action,
    target,
    value,
    options: st.options || {},
  };
}
