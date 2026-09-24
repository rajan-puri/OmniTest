import { loadConfig } from "../config/loader";
import { ApiClient } from "../client/api-client";
import { ApiClientError } from "../client/types";
import { banner, colors, divider, formatDuration, logError, symbols } from "../output/formatter";
import { ExitCode } from "../utils/exit-codes";

export interface StatusOptions {
  cwd?: string;
  config?: string;
  project?: string;
  json?: boolean;
  token?: string;
  apiUrl?: string;
}

export async function runStatus(options: StatusOptions): Promise<number> {
  const loaded = loadConfig({
    cwd: options.cwd,
    configPath: options.config,
    cliOverrides: {
      project: options.project,
      apiUrl: options.apiUrl,
      token: options.token,
    },
  });

  const client = new ApiClient({
    baseUrl: loaded.config.apiUrl,
    token: loaded.config.token,
  });

  try {
    let me: any = null;
    let project: any = null;
    let latestRun: any = null;

    if (loaded.config.token) {
      try {
        me = await client.getMe();
      } catch {
        // Token might be invalid or me endpoint not reachable
      }
    }

    const projectId = loaded.config.project;
    if (projectId && projectId !== "your-project-id") {
      try {
        const projData = await client.getProject(projectId);
        project = projData?.project;
      } catch {
        // Project lookup failure
      }

      try {
        const histData = await client.getHistory(projectId, { pageSize: 1 });
        latestRun = histData?.items?.[0] || null;
      } catch {
        // History lookup failure
      }
    }

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            apiUrl: loaded.config.apiUrl,
            authenticated: Boolean(me?.user),
            user: me?.user || null,
            activeOrg: me?.activeOrg || null,
            project: project || { id: projectId || null },
            latestRun: latestRun || null,
          },
          null,
          2
        )
      );
      return ExitCode.SUCCESS;
    }

    banner("OmniTest System Status");
    console.log(`${colors.bold}API Server:${colors.reset}   ${colors.cyan}${loaded.config.apiUrl}${colors.reset}`);
    console.log(
      `${colors.bold}Auth Status:${colors.reset}  ${
        me?.user ? `${symbols.success} Logged in as ${colors.green}${me.user.email}${colors.reset}` : `${symbols.warning} Unauthenticated`
      }`
    );

    if (me?.activeOrg) {
      console.log(`${colors.bold}Organization:${colors.reset} ${me.activeOrg.name} (${me.role || "MEMBER"})`);
    }

    divider();

    if (project) {
      console.log(`${colors.bold}Project:${colors.reset}      ${colors.bold}${project.name}${colors.reset} (${project.id})`);
      if (project.baseUrl) {
        console.log(`${colors.bold}Base URL:${colors.reset}     ${project.baseUrl}`);
      }
      if (project.testSuites) {
        const totalTests = project.testSuites.reduce((acc: number, s: any) => acc + (s.testCount || 0), 0);
        console.log(`${colors.bold}Suites/Tests:${colors.reset} ${project.testSuites.length} suites, ${totalTests} tests`);
      }
    } else if (projectId) {
      console.log(`${colors.bold}Project ID:${colors.reset}   ${colors.cyan}${projectId}${colors.reset} (unverified)`);
    } else {
      console.log(`${colors.bold}Project:${colors.reset}      ${colors.dim}No project configured${colors.reset}`);
    }

    if (latestRun) {
      divider();
      console.log(`${colors.bold}Latest Execution:${colors.reset}`);
      const isPassed = latestRun.status === "PASSED";
      const statusColor = isPassed ? colors.green : colors.red;
      console.log(`  Run ID:    ${latestRun.runId}`);
      console.log(`  Test:      ${latestRun.testTitle || latestRun.testId}`);
      console.log(`  Status:    ${statusColor}${latestRun.status}${colors.reset}`);
      console.log(`  Duration:  ${formatDuration(latestRun.duration || latestRun.durationMs || 0)}`);
      if (latestRun.startedAt) {
        console.log(`  Executed:  ${new Date(latestRun.startedAt).toLocaleString()}`);
      }
    }

    divider();
    return ExitCode.SUCCESS;
  } catch (err: any) {
    if (options.json) {
      console.error(
        JSON.stringify({
          success: false,
          error: err?.message || "Failed to retrieve status",
          code: err?.code,
          statusCode: err?.statusCode,
        })
      );
    } else {
      logError("Status Check Failed", {
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
