import { loadConfig } from "../config/loader";
import { ApiClient } from "../client/api-client";
import { ApiClientError } from "../client/types";
import { banner, colors, divider, formatDuration, logError, symbols } from "../output/formatter";
import { ExitCode } from "../utils/exit-codes";

export interface TestCommandOptions {
  cwd?: string;
  config?: string;
  testId?: string;
  target?: string;
  json?: boolean;
  verbose?: boolean;
  token?: string;
  apiUrl?: string;
}

export async function runSingleTest(options: TestCommandOptions): Promise<number> {
  if (!options.testId) {
    if (options.json) {
      console.log(
        JSON.stringify({
          success: false,
          error: "Missing test identifier. Usage: omnitest test <testId>",
        })
      );
    } else {
      logError("Missing Test ID", {
        reason: "No test ID was specified.",
        suggestion: "Specify a test to run: omnitest test <testId>",
      });
    }
    return ExitCode.CLI_ERROR;
  }

  const loaded = loadConfig({
    cwd: options.cwd,
    configPath: options.config,
    cliOverrides: {
      apiUrl: options.apiUrl,
      token: options.token,
    },
  });

  const client = new ApiClient({
    baseUrl: loaded.config.apiUrl,
    token: loaded.config.token,
  });

  if (!options.json) {
    banner("Single Test Execution");
    console.log(`${colors.bold}Test ID:${colors.reset}     ${colors.cyan}${options.testId}${colors.reset}`);
    console.log(`${colors.bold}API Server:${colors.reset}  ${colors.dim}${loaded.config.apiUrl}${colors.reset}`);
    if (options.target) {
      console.log(`${colors.bold}Target URL:${colors.reset}  ${options.target}`);
    }
    console.log(`\n${colors.dim}Executing test...${colors.reset}\n`);
  }

  try {
    const response = await client.runTest(options.testId, {
      targetUrl: options.target,
    });

    if (options.json) {
      console.log(JSON.stringify(response, null, 2));
    } else {
      const result = response.testResult || {};
      const isPassed = result.status === "PASSED";
      const icon = isPassed ? symbols.success : symbols.failure;
      const statusColor = isPassed ? colors.green : colors.red;
      const durationStr = formatDuration(response.durationMs || 0);

      console.log(`${icon} Test ${options.testId} finished: ${statusColor}${result.status}${colors.reset} (${durationStr})`);

      if (!isPassed && result.errorMessage) {
        console.log(`\n${colors.red}${colors.bold}Error:${colors.reset} ${result.errorMessage}`);
      }

      if (options.verbose && Array.isArray(result.stepResults) && result.stepResults.length > 0) {
        console.log(`\n${colors.bold}Step Details:${colors.reset}`);
        result.stepResults.forEach((step: any, idx: number) => {
          const stepIcon = step.status === "PASSED" ? symbols.success : symbols.failure;
          console.log(`  ${stepIcon} Step ${idx + 1}: ${step.action} [${step.durationMs}ms]`);
        });
      }

      if (result.artifacts && result.artifacts.length > 0) {
        console.log(`\n${colors.dim}Artifacts generated: ${result.artifacts.length}${colors.reset}`);
      }

      divider();
      console.log(`${colors.bold}Run ID:${colors.reset} ${response.runId}  ${colors.bold}Duration:${colors.reset} ${durationStr}`);
      divider();
    }

    if (response.status !== "PASSED" && response.testResult?.status !== "PASSED") {
      return ExitCode.TEST_FAILURE;
    }

    return ExitCode.SUCCESS;
  } catch (err: any) {
    if (options.json) {
      console.error(
        JSON.stringify({
          success: false,
          error: err?.message || "Execution failed",
          code: err?.code,
          statusCode: err?.statusCode,
        })
      );
    } else {
      logError("Single Test Execution Failed", {
        reason: err?.message,
        status: err?.statusCode,
        suggestion: err?.suggestion,
      });
    }

    if (err instanceof ApiClientError) {
      if (err.statusCode === 401 || err.statusCode === 403) {
        return ExitCode.AUTH_ERROR;
      }
    }

    return ExitCode.CLI_ERROR;
  }
}
