import { runInit } from "./commands/init";
import { runTests } from "./commands/run";
import { runSingleTest } from "./commands/test";
import { runHistory } from "./commands/history";
import { runReport } from "./commands/report";
import { runStatus } from "./commands/status";
import { ExitCode } from "./utils/exit-codes";
import { banner, colors } from "./output/formatter";

const CLI_VERSION = "0.1.0";

export interface ParsedArgs {
  command?: string;
  subcommand?: string;
  flags: Record<string, string | boolean>;
  positionals: string[];
}

export function parseArgs(rawArgs: string[]): ParsedArgs {
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];

  for (let i = 0; i < rawArgs.length; i++) {
    const arg = rawArgs[i];

    if (arg.startsWith("--")) {
      const equalIndex = arg.indexOf("=");
      if (equalIndex !== -1) {
        const key = arg.slice(2, equalIndex);
        const value = arg.slice(equalIndex + 1);
        flags[key] = value;
      } else {
        const key = arg.slice(2);
        const nextArg = rawArgs[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith("-")) {
          flags[key] = nextArg;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      // Short flags
      const shortChar = arg.slice(1);
      const nextArg = rawArgs[i + 1];

      // Handle common short flags
      let expandedKey = shortChar;
      if (shortChar === "v") expandedKey = "version";
      else if (shortChar === "h") expandedKey = "help";
      else if (shortChar === "p") expandedKey = "project";
      else if (shortChar === "t") expandedKey = "test";
      else if (shortChar === "l") expandedKey = "limit";
      else if (shortChar === "c") expandedKey = "config";
      else if (shortChar === "f") expandedKey = "force";
      else if (shortChar === "s") expandedKey = "search";

      if (["version", "help", "force"].includes(expandedKey)) {
        flags[expandedKey] = true;
      } else if (nextArg !== undefined && !nextArg.startsWith("-")) {
        flags[expandedKey] = nextArg;
        i++;
      } else {
        flags[expandedKey] = true;
      }
    } else {
      positionals.push(arg);
    }
  }

  return {
    command: positionals[0],
    subcommand: positionals[1],
    flags,
    positionals,
  };
}

export function showHelp(command?: string): void {
  banner("Unified Test Orchestration Platform");

  if (!command || command === "help") {
    console.log(`
${colors.bold}USAGE${colors.reset}
  $ omnitest <command> [options]

${colors.bold}COMMANDS${colors.reset}
  ${colors.green}init${colors.reset}      Initialize omnitest.config.json in current directory
  ${colors.green}run${colors.reset}       Run OmniTest tests across suites/types
  ${colors.green}test${colors.reset}      Execute a single test directly by ID
  ${colors.green}history${colors.reset}   Inspect execution history and trends
  ${colors.green}report${colors.reset}    View execution report and summary metrics
  ${colors.green}status${colors.reset}    Show project health, auth, and server status

${colors.bold}GLOBAL OPTIONS${colors.reset}
  -h, --help     Show help information
  -v, --version  Show version information
  --json         Format output as raw machine-readable JSON
  --verbose      Enable verbose diagnostic logging
  --api-url      OmniTest API server URL (default: http://localhost:3000)
  --token        Authentication bearer token

${colors.bold}EXAMPLES${colors.reset}
  $ omnitest init
  $ omnitest run --project proj_123
  $ omnitest run --type ui --visual
  $ omnitest test test_456
  $ omnitest history --status FAILED
  $ omnitest report --open
  $ omnitest status --json
`);
    return;
  }

  switch (command) {
    case "init":
      console.log(`
${colors.bold}USAGE${colors.reset}
  $ omnitest init [options]

${colors.bold}OPTIONS${colors.reset}
  -p, --project <id>   Project identifier
  --api-url <url>      OmniTest API server URL
  -f, --force          Overwrite existing omnitest.config.json
  --json               Output result as JSON
`);
      break;

    case "run":
      console.log(`
${colors.bold}USAGE${colors.reset}
  $ omnitest run [options]

${colors.bold}OPTIONS${colors.reset}
  -p, --project <id>   Project identifier (or set in omnitest.config.json)
  -t, --test <id>      Specific test ID or comma-separated test IDs
  --type <type>        Filter by engine: ui, api, accessibility, performance, seo
  --visual             Run only tests with visual regression enabled
  --target <url>       Target base URL override
  --env <name>         Execution environment (default: staging)
  --json               Raw JSON output without terminal styling
  --verbose            Show step and artifact details
`);
      break;

    case "test":
      console.log(`
${colors.bold}USAGE${colors.reset}
  $ omnitest test <testId> [options]

${colors.bold}OPTIONS${colors.reset}
  --target <url>       Target base URL override
  --json               Raw JSON output without terminal styling
  --verbose            Show detailed step results
`);
      break;

    case "history":
      console.log(`
${colors.bold}USAGE${colors.reset}
  $ omnitest history [options]

${colors.bold}OPTIONS${colors.reset}
  -p, --project <id>   Project identifier
  -t, --test <id>      Filter history for a single test
  --status <status>    Filter by status: PASSED, FAILED
  --type <type>        Filter by test type
  -l, --limit <n>      Number of runs to display (default: 15)
  -s, --search <query> Search by title
  --json               Raw JSON output
`);
      break;

    case "report":
      console.log(`
${colors.bold}USAGE${colors.reset}
  $ omnitest report [options]

${colors.bold}OPTIONS${colors.reset}
  -p, --project <id>   Project identifier
  --run <runId>        Test run identifier (defaults to latest run)
  --open               Display dashboard web link
  --json               Raw JSON output
`);
      break;

    case "status":
      console.log(`
${colors.bold}USAGE${colors.reset}
  $ omnitest status [options]

${colors.bold}OPTIONS${colors.reset}
  -p, --project <id>   Project identifier
  --json               Raw JSON output
`);
      break;

    default:
      console.log(`Unknown command: ${command}. Run 'omnitest --help' for available commands.`);
  }
}

export async function runCli(rawArgs: string[] = process.argv.slice(2)): Promise<number> {
  const parsed = parseArgs(rawArgs);

  // Global flags
  if (parsed.flags.version) {
    console.log(`omnitest v${CLI_VERSION}`);
    return ExitCode.SUCCESS;
  }

  if (parsed.flags.help || parsed.command === "help") {
    const helpCmd = parsed.command === "help" ? parsed.subcommand : parsed.command;
    showHelp(helpCmd);
    return ExitCode.SUCCESS;
  }

  if (!parsed.command) {
    showHelp();
    return ExitCode.SUCCESS;
  }

  const isJson = Boolean(parsed.flags.json);
  const isVerbose = Boolean(parsed.flags.verbose);
  const token = typeof parsed.flags.token === "string" ? parsed.flags.token : undefined;
  const apiUrl = typeof parsed.flags["api-url"] === "string" ? (parsed.flags["api-url"] as string) : undefined;
  const config = typeof parsed.flags.config === "string" ? (parsed.flags.config as string) : undefined;
  const project = typeof parsed.flags.project === "string" ? (parsed.flags.project as string) : undefined;

  let exitCode: number = ExitCode.SUCCESS;

  switch (parsed.command) {
    case "init": {
      exitCode = await runInit({
        project,
        apiUrl,
        force: Boolean(parsed.flags.force),
        json: isJson,
      });
      break;
    }

    case "run": {
      const type = typeof parsed.flags.type === "string" ? (parsed.flags.type as string) : undefined;
      const test = typeof parsed.flags.test === "string" ? (parsed.flags.test as string) : undefined;
      const target = typeof parsed.flags.target === "string" ? (parsed.flags.target as string) : undefined;
      const environment = typeof parsed.flags.env === "string" ? (parsed.flags.env as string) : undefined;
      const visual = Boolean(parsed.flags.visual);

      exitCode = await runTests({
        project,
        test,
        type,
        visual,
        target,
        environment,
        json: isJson,
        verbose: isVerbose,
        token,
        apiUrl,
        config,
      });
      break;
    }

    case "test": {
      const testId = parsed.positionals[1] || (typeof parsed.flags.test === "string" ? (parsed.flags.test as string) : undefined);
      const target = typeof parsed.flags.target === "string" ? (parsed.flags.target as string) : undefined;

      exitCode = await runSingleTest({
        testId,
        target,
        json: isJson,
        verbose: isVerbose,
        token,
        apiUrl,
        config,
      });
      break;
    }

    case "history": {
      const test = typeof parsed.flags.test === "string" ? (parsed.flags.test as string) : undefined;
      const status = typeof parsed.flags.status === "string" ? (parsed.flags.status as string) : undefined;
      const type = typeof parsed.flags.type === "string" ? (parsed.flags.type as string) : undefined;
      const limit = parsed.flags.limit ? Number(parsed.flags.limit) : undefined;
      const page = parsed.flags.page ? Number(parsed.flags.page) : undefined;
      const search = typeof parsed.flags.search === "string" ? (parsed.flags.search as string) : undefined;

      exitCode = await runHistory({
        project,
        test,
        status,
        type,
        limit,
        page,
        search,
        json: isJson,
        token,
        apiUrl,
        config,
      });
      break;
    }

    case "report": {
      const runId = typeof parsed.flags.run === "string" ? (parsed.flags.run as string) : undefined;
      const open = Boolean(parsed.flags.open);

      exitCode = await runReport({
        project,
        run: runId,
        open,
        json: isJson,
        token,
        apiUrl,
        config,
      });
      break;
    }

    case "status": {
      exitCode = await runStatus({
        project,
        json: isJson,
        token,
        apiUrl,
        config,
      });
      break;
    }

    default: {
      if (isJson) {
        console.error(
          JSON.stringify({
            success: false,
            error: `Unknown command: '${parsed.command}'`,
            suggestion: "Run 'omnitest --help' to see valid commands.",
          })
        );
      } else {
        console.error(`${colors.bold}${colors.red}Error:${colors.reset} Unknown command '${parsed.command}'`);
        console.error(`Run ${colors.cyan}omnitest --help${colors.reset} to see available commands.\n`);
      }
      exitCode = ExitCode.CLI_ERROR;
      break;
    }
  }

  process.exitCode = exitCode;
  return exitCode;
}
