import fs from "fs";
import path from "path";
import { OmniTestConfig, ResolvedConfig, LoadConfigOptions, LoadedConfigResult } from "./types";

export const DEFAULT_API_URL = "http://localhost:3000";
export const CONFIG_FILE_NAMES = [
  "omnitest.config.json",
  ".omnitestrc.json",
  "omnitest.config.js",
  "omnitest.config.ts",
];

/**
 * Searches for an OmniTest configuration file in the specified directory or cwd.
 */
export function findConfigFile(dir: string = process.cwd()): string | null {
  for (const name of CONFIG_FILE_NAMES) {
    const fullPath = path.resolve(dir, name);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Loads and parses an OmniTest configuration file if it exists.
 */
export function loadConfigFile(configPath: string): OmniTestConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const ext = path.extname(configPath);
  if (ext === ".json") {
    try {
      const content = fs.readFileSync(configPath, "utf-8");
      return JSON.parse(content);
    } catch (err: any) {
      throw new Error(`Invalid JSON in configuration file ${configPath}: ${err.message}`);
    }
  }

  if (ext === ".js" || ext === ".ts") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require(configPath);
      return mod.default || mod;
    } catch (err: any) {
      throw new Error(`Unable to load configuration file ${configPath}: ${err.message}`);
    }
  }

  throw new Error(`Unsupported configuration file format: ${ext}`);
}

/**
 * Resolves the configuration by combining config file values, environment variables, and CLI overrides.
 */
export function resolveConfig(options: {
  cwd?: string;
  configPath?: string;
  projectId?: string;
  project?: string;
  apiUrl?: string;
  token?: string;
  environment?: string;
} = {}): ResolvedConfig {
  const cwd = options.cwd || process.cwd();
  const filePath = options.configPath ? path.resolve(cwd, options.configPath) : findConfigFile(cwd);

  let fileConfig: OmniTestConfig = {};
  if (filePath) {
    fileConfig = loadConfigFile(filePath);
  }

  // Precedence: CLI args > Environment variables > Config file > Default
  const apiUrl =
    options.apiUrl ||
    process.env.OMNITEST_API_URL ||
    fileConfig.apiUrl ||
    DEFAULT_API_URL;

  const projectId =
    options.projectId ||
    options.project ||
    process.env.OMNITEST_PROJECT_ID ||
    fileConfig.projectId ||
    fileConfig.project ||
    "";

  const token =
    options.token ||
    process.env.OMNITEST_TOKEN ||
    fileConfig.token ||
    undefined;

  const environment =
    options.environment ||
    process.env.OMNITEST_ENV ||
    fileConfig.environment ||
    "local";

  const baseUrl = fileConfig.baseUrl;
  const projectName = fileConfig.projectName;

  return {
    project: projectId,
    projectId,
    projectName,
    apiUrl: normalizeApiUrl(apiUrl),
    baseUrl,
    environment,
    token,
    configFilePath: filePath || undefined,
  };
}

/**
 * Convenience helper to load configuration with overrides.
 */
export function loadConfig(options: LoadConfigOptions = {}): LoadedConfigResult {
  const cwd = options.cwd || process.cwd();
  const filePath = options.configPath ? path.resolve(cwd, options.configPath) : findConfigFile(cwd);
  const resolved = resolveConfig({
    cwd,
    configPath: options.configPath,
    project: options.cliOverrides?.project,
    projectId: options.cliOverrides?.projectId,
    apiUrl: options.cliOverrides?.apiUrl,
    token: options.cliOverrides?.token,
    environment: options.cliOverrides?.environment,
  });

  return {
    config: resolved,
    configPath: filePath || undefined,
  };
}

/**
 * Validates that an API URL is well-formed.
 */
export function normalizeApiUrl(url: string): string {
  let cleaned = url.trim();
  if (!cleaned.startsWith("http://") && !cleaned.startsWith("https://")) {
    cleaned = `http://${cleaned}`;
  }
  // Remove trailing slashes
  return cleaned.replace(/\/+$/, "");
}

/**
 * Masks a secret token for safe logging/display.
 */
export function maskSecret(secret?: string): string {
  if (!secret) return "none";
  if (secret.length <= 8) return "********";
  return `${secret.slice(0, 4)}...${secret.slice(-4)}`;
}
