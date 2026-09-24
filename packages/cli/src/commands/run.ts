import { loadConfig } from "../config/loader";
import { ApiClient } from "../client/api-client";
import { ApiClientError } from "../client/types";
import { banner, colors, divider, formatDuration, logError, symbols } from "../output/formatter";
import { ExitCode } from "../utils/exit-codes";

export interface RunOptions {
  cwd?: string;
  config?: string;
  project?: string;
  test?: string;
  type?: string;
  visual?: boolean;
  target?: string;
  environment?: string;
  json?: boolean;
  verbose?: boolean;
  token?: string;
  apiUrl?: string;
}

export async function runTests(options: RunOptions): Promise<number> {
  const loaded = loadConfig({
    cwd: options.cwd,
    configPath: options.config,
    cliOverrides: {
      project: options.project,
      apiUrl: options.apiUrl,
      token: options.token,
      environment: options.environment,
    },
  });

  const projectId = loaded.config.project;
  if (!projectId || projectId === "your-project-id") {
    if (options.json) {
      console.log(
        JSON.stringify({
          success: false,
          error: "No project ID specified. Provide --project <id> or set 'project' in omnitest.config.json.",
        })
      );
    } else {
      logError("Missing Project ID", {
        reason: "No project ID was provided via flag, configuration, or environment variable.",
        suggestion: "Run with --project <projectId> or configure 'project' in omnitest.config.json",
      });
    }
    return ExitCode.CLI_ERROR;
  }

  const client = new ApiClient({
    baseUrl: loaded.config.apiUrl,
    token: loaded.config.token,
  });

  const environment = options.environment || loaded.config.environment || "staging";
  const testIds = options.test ? options.test.split(",").map((s) => s.trim()).filter(Boolean) : undefined;

  if (!options.json) {
    banner(`Test Execution • ${environment}`);
    console.log(`${colors.bold}Project:${colors.reset}     ${colors.cyan}${projectId}${colors.reset}`);
    console.log(`${colors.bold}API Server:${colors.reset}  ${colors.dim}${loaded.config.apiUrl}${colors.reset}`);
    if (options.type) {
      console.log(`${colors.bold}Filter Type:${colors.reset} ${options.type.toUpperCase()}`);
    }
    if (options.visual) {
      console.log(`${colors.bold}Filter:${colors.reset}      Visual Regression tests only`);
    }
    if (options.target) {
      console.log(`${colors.bold}Target URL:${colors.reset}  ${options.target}`);
    }
    console.log(`\n${colors.dim}Running tests...${colors.reset}\n`);
  }

  try {
    const response = await client.runProject(projectId, {
      testIds,
      type: options.type,
      visual: options.visual,
      environment,
      targetUrl: options.target,
    });

    if (options.json) {
      console.log(JSON.stringify(response, null, 2));
    } else {
      const results: any[] = response.results || [];

      if (results.length === 0) {
        console.log(`${symbols.info} ${response.message || "No matching tests found to execute."}`);
      } else {
        for (const res of results) {
          const isPassed = res.status === "PASSED";
          const icon = isPassed ? symbols.success : symbols.failure;
          const statusColor = isPassed ? colors.green : colors.red;
          const durationStr = colors.dim + formatDuration(res.durationMs || 0) + colors.reset;
          const typeBadge = `${colors.bold}[${res.testType || "UI"}]${colors.reset}`;

          console.log(`${icon} ${res.testTitle || res.testId} ${typeBadge} (${statusColor}${res.status}${colors.reset}, ${durationStr})`);

          if (!isPassed && res.errorMessage) {
            console.log(`    ${colors.red}${res.errorMessage}${colors.reset}`);
          }
          if (options.verbose && res.artifacts && res.artifacts.length > 0) {
            console.log(`    ${colors.dim}Artifacts: ${res.artifacts.length} generated${colors.reset}`);
          }
        }
      }

      divider();
      console.log(
        `${colors.bold}Total:${colors.reset} ${response.totalTests || 0}  ` +
          `${colors.green}Passed:${colors.reset} ${response.passedTests || 0}  ` +
          `${colors.red}Failed:${colors.reset} ${response.failedTests || 0}  ` +
          `${colors.bold}Duration:${colors.reset} ${formatDuration(response.durationMs || 0)}  ` +
          (response.runId ? `${colors.dim}Run: ${response.runId}${colors.reset}` : "")
      );
      divider();
    }

    if (response.failedTests > 0) {
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
      logError("Execution Failed", {
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
