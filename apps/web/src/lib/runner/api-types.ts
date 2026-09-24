export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiAuthType = "none" | "bearer" | "basic" | "api_key";

export interface ApiParam {
  key: string;
  value: string;
  enabled?: boolean;
}

export interface ApiHeader {
  key: string;
  value: string;
  enabled?: boolean;
}

export interface ApiAuthConfig {
  type: ApiAuthType;
  bearerToken?: string;
  basicUsername?: string;
  basicPassword?: string;
  apiKeyName?: string;
  apiKeyValue?: string;
  apiKeyLocation?: "header" | "query";
}

export type ApiAssertionType =
  | "status_equals"
  | "status_is_2xx"
  | "status_is_4xx"
  | "status_is_5xx"
  | "response_time_lt"
  | "body_contains"
  | "json_property_exists"
  | "json_property_equals"
  | "json_property_contains"
  | "header_exists"
  | "header_equals";

export interface ApiAssertion {
  id: string;
  type: ApiAssertionType;
  property?: string; // JSON path (e.g. user.name) or Header name (e.g. Content-Type)
  expected?: string; // Expected value or threshold ms
}

export interface ApiTestSpec {
  version: "1.0";
  method: HttpMethod;
  url: string;
  params: ApiParam[];
  headers: ApiHeader[];
  bodyType: "none" | "json";
  body?: string; // Raw JSON string
  auth: ApiAuthConfig;
  assertions: ApiAssertion[];
  timeoutMs?: number; // Request timeout, defaults to 10000 ms
}

export interface ApiAssertionResult {
  assertionId: string;
  type: ApiAssertionType;
  status: "PASSED" | "FAILED";
  actual?: string;
  expected?: string;
  message?: string;
}

export interface ApiExecutionResult {
  status: "PASSED" | "FAILED" | "TIMED_OUT";
  durationMs: number;
  statusCode?: number;
  statusText?: string;
  request: {
    method: HttpMethod;
    resolvedUrl: string;
    headers: Record<string, string>; // Masked authorization/passwords
    body?: string;
  };
  response?: {
    statusCode: number;
    statusText: string;
    headers: Record<string, string>;
    body: string;
    isJson: boolean;
    jsonParsed?: unknown;
    sizeBytes: number;
  };
  assertions: ApiAssertionResult[];
  totalAssertions: number;
  passedAssertions: number;
  failedAssertions: number;
  errorSummary?: string;
}
