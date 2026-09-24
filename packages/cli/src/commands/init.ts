import * as fs from "fs";
import * as path from "path";
import { banner, colors, symbols } from "../output/formatter";
import { ExitCode } from "../utils/exit-codes";

export interface InitOptions {
  cwd?: string;
  project?: string;
  apiUrl?: string;
  force?: boolean;
  json?: boolean;
}

export async function runInit(options: InitOptions): Promise<number> {
  const rootDir = options.cwd || process.cwd();
  const targetFile = path.resolve(rootDir, "omnitest.config.json");

  if (fs.existsSync(targetFile) && !options.force) {
    if (options.json) {
      console.log(
        JSON.stringify({
          success: false,
          error: "Configuration file already exists: omnitest.config.json. Use --force to overwrite.",
          path: targetFile,
        })
      );
    } else {
      banner("Initialize Configuration");
      console.log(
        `${symbols.warning} Configuration file already exists at ${colors.cyan}${targetFile}${colors.reset}`
      );
      console.log(`Use ${colors.bold}--force${colors.reset} to overwrite the existing configuration.`);
    }
    return ExitCode.CLI_ERROR;
  }

  const configContent = {
    $schema: "https://omnitest.dev/schema.json",
    project: options.project || "your-project-id",
    apiUrl: options.apiUrl || "http://localhost:3000",
    environment: "staging",
    tests: {
      types: ["ui", "api", "accessibility", "performance", "seo"],
      timeoutSeconds: 30,
    },
  };

  try {
    fs.writeFileSync(targetFile, JSON.stringify(configContent, null, 2) + "\n", "utf8");

    if (options.json) {
      console.log(
        JSON.stringify({
          success: true,
          message: "Initialized OmniTest configuration",
          path: targetFile,
          config: configContent,
        })
      );
    } else {
      banner("Initialize Configuration");
      console.log(`${symbols.success} Created ${colors.green}omnitest.config.json${colors.reset} successfully!`);
      console.log(`\nLocation: ${colors.dim}${targetFile}${colors.reset}`);
      console.log(`\nNext steps:`);
      console.log(`  1. Set your project ID: ${colors.cyan}omnitest.config.json -> project${colors.reset}`);
      console.log(`  2. Set your auth token: ${colors.cyan}export OMNITEST_TOKEN=...${colors.reset}`);
      console.log(`  3. Run your tests:      ${colors.cyan}omnitest run${colors.reset}\n`);
    }

    return ExitCode.SUCCESS;
  } catch (err: any) {
    if (options.json) {
      console.error(
        JSON.stringify({
          success: false,
          error: err?.message || "Failed to create configuration file",
        })
      );
    } else {
      console.error(`${symbols.failure} ${colors.red}Failed to create configuration file:${colors.reset} ${err?.message}`);
    }
    return ExitCode.CLI_ERROR;
  }
}
