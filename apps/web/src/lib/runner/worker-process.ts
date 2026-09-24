import fs from "fs";
import { validateTestSpec } from "./validator";
import { executePlaywrightTest, ExecutionOptions } from "./executor";

interface WorkerPayload {
  spec: unknown;
  options: ExecutionOptions;
}

async function runWorker() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];

  if (!inputPath || !outputPath) {
    console.error("Worker requires input and output file paths.");
    process.exit(1);
  }

  try {
    const rawInput = fs.readFileSync(inputPath, "utf-8");
    const payload: WorkerPayload = JSON.parse(rawInput);

    const validatedSpec = validateTestSpec(payload.spec);
    const result = await executePlaywrightTest(validatedSpec, payload.options);

    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
    process.exit(0);
  } catch (err: unknown) {
    const errorPayload = {
      status: "FAILED",
      durationMs: 0,
      totalSteps: 0,
      passedSteps: 0,
      failedSteps: 1,
      stepResults: [],
      consoleErrors: [],
      networkFailures: [],
      artifacts: [],
      errorSummary: err instanceof Error ? err.message : String(err),
      stackTrace: err instanceof Error ? err.stack : undefined,
    };

    if (outputPath) {
      try {
        fs.writeFileSync(outputPath, JSON.stringify(errorPayload, null, 2), "utf-8");
      } catch {
        // Fallback
      }
    }

    console.error("Worker execution failed:", err);
    process.exit(1);
  }
}

runWorker();
