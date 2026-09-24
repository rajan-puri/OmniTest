import { loadConfig } from "../config/loader";
import { ApiClient } from "../client/api-client";
import { ApiClientError } from "../client/types";
import { banner, colors, formatDuration, logError, renderTable, symbols } from "../output/formatter";
import { ExitCode } from "../utils/exit-codes";

export interface HistoryOptions {
  cwd?: string;
  config?: string;
  project?: string;
  test?: string;
  status?: string;
  type?: string;
  limit?: number;
  page?: number;
  search?: string;
  json?: boolean;
  token?: string;
  apiUrl?: string;
}

export async function runHistory(options: HistoryOptions): Promise<number> {
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
    const data = await client.getHistory(projectId, {
      testId: options.test,
      status: options.status,
      testType: options.type,
      pageSize: options.limit || 15,
      page: options.page || 1,
      search: options.search,
    });

    if (options.json) {
      console.log(JSON.stringify(data, null, 2));
      return ExitCode.SUCCESS;
    }

    banner("Execution History");
    console.log(`${colors.bold}Project:${colors.reset} ${colors.cyan}${projectId}${colors.reset}\n`);

    const items: any[] = data.items || [];
    if (items.length === 0) {
      console.log(`${symbols.info} No test history found for the given criteria.`);
      return ExitCode.SUCCESS;
    }

    const headers = ["Test", "Status", "Type", "Duration", "Started", "Run ID"];
    const rows = items.map((item) => {
      const isPassed = item.status === "PASSED";
      const statusStr = isPassed ? `${colors.green}PASSED${colors.reset}` : `${colors.red}${item.status}${colors.reset}`;
      const startedStr = item.startedAt ? new Date(item.startedAt).toLocaleTimeString() : "-";
      const shortRunId = item.runId ? item.runId.slice(0, 10) : "-";

      return [
        item.testTitle || item.testId || "Unknown",
        statusStr,
        item.testType || "UI",
        formatDuration(item.duration || item.durationMs || 0),
        startedStr,
        shortRunId,
      ];
    });

    renderTable(headers, rows);

    const p = data.pagination;
    if (p) {
      console.log(`\n${colors.dim}Showing page ${p.page} of ${p.totalPages} (${p.total} total runs)${colors.reset}\n`);
    }

    return ExitCode.SUCCESS;
  } catch (err: any) {
    if (options.json) {
      console.error(
        JSON.stringify({
          success: false,
          error: err?.message || "Failed to fetch history",
          code: err?.code,
          statusCode: err?.statusCode,
        })
      );
    } else {
      logError("History Query Failed", {
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
