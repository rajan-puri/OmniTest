import {
  ApiTestSpec,
  HttpMethod,
  ApiAuthConfig,
  ApiParam,
  ApiHeader,
  ApiAssertion,
  ApiAssertionType,
} from "./api-types";

const ALLOWED_METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const ALLOWED_ASSERTION_TYPES: ApiAssertionType[] = [
  "status_equals",
  "status_is_2xx",
  "status_is_4xx",
  "status_is_5xx",
  "response_time_lt",
  "body_contains",
  "json_property_exists",
  "json_property_equals",
  "json_property_contains",
  "header_exists",
  "header_equals",
];

export function validateApiTestSpec(raw: unknown): ApiTestSpec {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid API test specification: Expected an object.");
  }

  const spec = raw as Partial<ApiTestSpec>;

  // 1. Method
  const method = (spec.method || "GET").toUpperCase() as HttpMethod;
  if (!ALLOWED_METHODS.includes(method)) {
    throw new Error(`Unsupported HTTP method "${spec.method}". Allowed methods: ${ALLOWED_METHODS.join(", ")}`);
  }

  // 2. URL
  if (!spec.url || typeof spec.url !== "string" || !spec.url.trim()) {
    throw new Error("API request URL is required.");
  }
  const trimmedUrl = spec.url.trim();

  // Basic URL sanity check (relative or absolute)
  if (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) {
    try {
      new URL(trimmedUrl);
    } catch {
      throw new Error(`Invalid URL format: "${trimmedUrl}"`);
    }
  }

  // 3. Params
  const params: ApiParam[] = Array.isArray(spec.params)
    ? spec.params
        .filter((p) => p && typeof p.key === "string" && p.key.trim() !== "")
        .map((p) => ({
          key: p.key.trim(),
          value: typeof p.value === "string" ? p.value : String(p.value ?? ""),
          enabled: p.enabled !== false,
        }))
    : [];

  // 4. Headers
  const headers: ApiHeader[] = Array.isArray(spec.headers)
    ? spec.headers
        .filter((h) => h && typeof h.key === "string" && h.key.trim() !== "")
        .map((h) => ({
          key: h.key.trim(),
          value: typeof h.value === "string" ? h.value : String(h.value ?? ""),
          enabled: h.enabled !== false,
        }))
    : [];

  // 5. Body & BodyType
  const bodyType = spec.bodyType === "json" ? "json" : "none";
  let body: string | undefined = undefined;

  if (bodyType === "json" && spec.body) {
    if (typeof spec.body === "string" && spec.body.trim()) {
      try {
        JSON.parse(spec.body);
        body = spec.body.trim();
      } catch (e) {
        throw new Error(`Invalid JSON request body: ${(e as Error).message}`);
      }
    } else if (typeof spec.body === "object") {
      body = JSON.stringify(spec.body, null, 2);
    }
  }

  // 6. Auth
  const rawAuth = (spec.auth || { type: "none" }) as Partial<ApiAuthConfig>;
  const auth: ApiAuthConfig = {
    type: ["none", "bearer", "basic", "api_key"].includes(rawAuth.type as string)
      ? (rawAuth.type as ApiAuthConfig["type"])
      : "none",
  };

  if (auth.type === "bearer") {
    auth.bearerToken = rawAuth.bearerToken?.trim() || "";
  } else if (auth.type === "basic") {
    auth.basicUsername = rawAuth.basicUsername?.trim() || "";
    auth.basicPassword = rawAuth.basicPassword || "";
  } else if (auth.type === "api_key") {
    auth.apiKeyName = rawAuth.apiKeyName?.trim() || "x-api-key";
    auth.apiKeyValue = rawAuth.apiKeyValue || "";
    auth.apiKeyLocation = rawAuth.apiKeyLocation === "query" ? "query" : "header";
  }

  // 7. Assertions
  const assertions: ApiAssertion[] = Array.isArray(spec.assertions)
    ? spec.assertions
        .filter((a) => a && ALLOWED_ASSERTION_TYPES.includes(a.type))
        .map((a, idx) => ({
          id: a.id || `assert_${idx + 1}`,
          type: a.type,
          property: a.property?.trim() || undefined,
          expected: a.expected !== undefined ? String(a.expected) : undefined,
        }))
    : [];

  // 8. Timeout
  const timeoutMs = typeof spec.timeoutMs === "number" && spec.timeoutMs > 0
    ? Math.min(Math.max(spec.timeoutMs, 500), 60000)
    : 10000;

  return {
    version: "1.0",
    method,
    url: trimmedUrl,
    params,
    headers,
    bodyType,
    body,
    auth,
    assertions,
    timeoutMs,
  };
}
