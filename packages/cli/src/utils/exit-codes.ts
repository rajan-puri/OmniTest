/**
 * Standardized exit codes for OmniTest CLI
 */
export const ExitCode = {
  SUCCESS: 0,
  TEST_FAILURE: 1,
  CONFIG_ERROR: 2,
  CLI_ERROR: 2,
  API_OR_AUTH_ERROR: 3,
  AUTH_ERROR: 3,
} as const;

export type ExitCodeType = (typeof ExitCode)[keyof typeof ExitCode] | number;
