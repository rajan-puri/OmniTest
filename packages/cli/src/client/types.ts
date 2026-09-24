export interface ApiClientOptions {
  baseUrl: string;
  token?: string;
  timeoutMs?: number;
}

export interface ApiErrorResponse {
  error?: string | { message?: string; code?: string; statusCode?: number };
  message?: string;
}

export class ApiClientError extends Error {
  public statusCode: number;
  public code: string;
  public suggestion?: string;
  public details?: any;

  constructor(
    message: string,
    options: {
      statusCode?: number;
      code?: string;
      suggestion?: string;
      details?: any;
    } = {}
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = options.statusCode || 500;
    this.code = options.code || "UNKNOWN_ERROR";
    this.suggestion = options.suggestion;
    this.details = options.details;
  }
}
