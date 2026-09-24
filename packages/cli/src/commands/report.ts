import { loadConfig } from "../config/loader";
import { ApiClient } from "../client/api-client";
import { ApiClientError } from "../client/types";
import { banner, colors, divider, formatDuration, logError, symbols } from "../output/formatter";
import { ExitCode } from "../utils/exit-codes";

export interface ReportOptions {
  cwd?: string;
  config?: string;
  project?: string;
  run?: string;
  open?: boolean;
  json?: boolean;
  token?: string;
  apiUrl?: string;
}

export async function runReport(options: ReportOptions): Promise<number> {
  const loaded = loadConfig({
    cwd: options.cwd,
    configPath: options.config,
    cliOverrides: {
      project: options.project,
      apiUrl: options.apiUrl,
      token: options.token,
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

  try {
    let runId = options.run;

    // If no run ID provided, find the most recent run from history
    if (!runId) {
      const history = await client.getHistory(projectId, { pageSize: 1 });
      const latest = history?.items?.[0];
      if (!latest || !latest.runId) {
        if (options.json) {
          console.log(
            JSON.stringify({
              success: false,
              error: "No test runs found for this project.",
            })
          );
        } else {
          console.log(`${symbols.info} No test runs found for project ${colors.cyan}${projectId}${colors.reset}.`);
        }
        return ExitCode.CLI_ERROR;
      }
      runId = latest.runId;
    }

    const reportResponse = await client.getReport(projectId, runId!);
    const report = reportResponse?.report || reportResponse;

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
      return ExitCode.SUCCESS;
    }

    const safeRunId: string = runId as string;
    banner(`Test Report • ${safeRunId.slice(0, 8)}`);
    console.log(`${colors.bold}Project:${colors.reset}   ${colors.cyan}${projectId}${colors.reset}`);
    console.log(`${colors.bold}Run ID:${colors.reset}    ${safeRunId}`);
    console.log(`${colors.bold}Status:${colors.reset}    ${report.status === "PASSED" ? colors.green : colors.red}${report.status || "UNKNOWN"}${colors.reset}`);
    console.log(`${colors.bold}Duration:${colors.reset}  ${formatDuration(report.durationMs || report.summary?.durationMs || 0)}`);
    console.log(
      `${colors.bold}Passed:${colors.reset}    ${colors.green}${report.summary?.passedTests ?? report.passedTests ?? 0}${colors.reset} / ${report.summary?.totalTests ?? report.totalTests ?? 0}`
    );
    divider();

    const results: any[] = report.results || report.testResults || [];
    if (results.length > 0) {
      console.log(`\n${colors.bold}Test Results:${colors.reset}`);
      for (const res of results) {
        const isPassed = res.status === "PASSED";
        const icon = isPassed ? symbols.success : symbols.failure;
        const statusColor = isPassed ? colors.green : colors.red;
        const title = res.test?.title || res.testTitle || res.testId;
        const type = res.test?.type || res.testType || "UI";
        console.log(`  ${icon} ${title} [${type}] - ${statusColor}${res.status}${colors.reset} (${formatDuration(res.durationMs || 0)})`);
        if (!isPassed && res.errorMessage) {
          console.log(`      ${colors.red}${res.errorMessage}${colors.reset}`);
        }
      }
    }

    divider();
    const dashboardUrl = `${loaded.config.apiUrl}/dashboard/projects/${projectId}/runs/${runId}`;
    console.log(`${colors.dim}View complete report online:${colors.reset}`);
    console.log(`  ${colors.cyan}${dashboardUrl}${colors.reset}\n`);

    return ExitCode.SUCCESS;
  } catch (err: any) {
    if (options.json) {
      console.error(
        JSON.stringify({
          success: false,
          error: err?.message || "Failed to fetch report",
          code: err?.code,
          statusCode: err?.statusCode,
        })
      );
    } else {
      logError("Report Query Failed", {
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
