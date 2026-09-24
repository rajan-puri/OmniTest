export interface OmniTestConfig {
  $schema?: string;
  project?: string;
  projectId?: string;
  projectName?: string;
  apiUrl?: string;
  baseUrl?: string;
  environment?: string;
  token?: string;
  defaultType?: string;
  timeoutSeconds?: number;
  tests?: {
    types?: string[];
    timeoutSeconds?: number;
  };
}

export interface ResolvedConfig {
  project: string;
  projectId: string;
  projectName?: string;
  apiUrl: string;
  baseUrl?: string;
  environment: string;
  token?: string;
  configFilePath?: string;
}

export interface LoadConfigOptions {
  cwd?: string;
  configPath?: string;
  cliOverrides?: {
    project?: string;
    projectId?: string;
    apiUrl?: string;
    token?: string;
    environment?: string;
  };
}

export interface LoadedConfigResult {
  config: ResolvedConfig;
  configPath?: string;
}
