import {
  ApiTestSpec,
  ApiExecutionResult,
  ApiAssertionResult,
  ApiAssertion,
} from "./api-types";

// Helper to evaluate dot-notation / jsonpath on parsed JSON objects (e.g. "user.profile.name" or "items.0.id")
function getValueByPath(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== "object") return undefined;
  const segments = path.replace(/\[(\d+)\]/g, ".$1").split(".").map((s) => s.trim()).filter(Boolean);
  let current: any = obj;

  for (const seg of segments) {
    if (current === null || current === undefined) return undefined;
    current = current[seg];
  }

  return current;
}

// Mask sensitive credentials for safe logging and UI reporting
export function maskSensitiveHeaders(headers: Record<string, string>): Record<string, string> {
  const masked: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    if (
      lower === "authorization" ||
      lower === "proxy-authorization" ||
      lower === "cookie" ||
      lower === "set-cookie" ||
      lower.includes("secret") ||
      lower.includes("token") ||
      lower.includes("password") ||
      lower.includes("apikey") ||
      lower.includes("api-key")
    ) {
      if (value.startsWith("Bearer ") && value.length > 12) {
        masked[key] = `Bearer ${value.slice(7, 11)}...${value.slice(-3)}`;
      } else if (value.startsWith("Basic ") && value.length > 10) {
        masked[key] = "Basic ************";
      } else {
        masked[key] = "************";
      }
    } else {
      masked[key] = value;
    }
  }
  return masked;
}

// Basic SSRF protection check: Blocks known dangerous local / metadata destinations
export function checkUrlSecurity(urlStr: string): void {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    throw new Error(`Invalid URL "${urlStr}".`);
  }

  const hostname = parsed.hostname.toLowerCase();

  // Cloud metadata endpoint
  if (hostname === "169.254.169.254" || hostname === "metadata.google.internal") {
    throw new Error("Access to cloud metadata endpoints is restricted for security.");
  }

  // AWS instance metadata IPv6 or link-local
  if (hostname.startsWith("fe80:") || hostname === "::1" && process.env.NODE_ENV === "production") {
    throw new Error("Access to link-local and internal services is restricted.");
  }
}

export async function executeApiTest(
  spec: ApiTestSpec,
  options: { baseUrl?: string } = {}
): Promise<ApiExecutionResult> {
  const startTime = Date.now();

  // 1. Resolve URL & Query Parameters
  let resolvedUrl = spec.url;
  if (!resolvedUrl.startsWith("http://") && !resolvedUrl.startsWith("https://")) {
    if (options.baseUrl) {
      resolvedUrl = new URL(resolvedUrl, options.baseUrl).toString();
    } else {
      throw new Error(`Relative URL "${spec.url}" provided without a configured project Base URL.`);
    }
  }

  checkUrlSecurity(resolvedUrl);

  const urlObj = new URL(resolvedUrl);

  // Append enabled query parameters
  for (const param of spec.params) {
    if (param.enabled !== false && param.key) {
      urlObj.searchParams.append(param.key, param.value);
    }
  }

  // 2. Build Request Headers
  const requestHeaders: Record<string, string> = {};

  for (const h of spec.headers) {
    if (h.enabled !== false && h.key) {
      requestHeaders[h.key] = h.value;
    }
  }

  // Handle Authentication
  if (spec.auth.type === "bearer" && spec.auth.bearerToken) {
    requestHeaders["Authorization"] = `Bearer ${spec.auth.bearerToken}`;
  } else if (spec.auth.type === "basic" && spec.auth.basicUsername) {
    const creds = Buffer.from(
      `${spec.auth.basicUsername}:${spec.auth.basicPassword || ""}`
    ).toString("base64");
    requestHeaders["Authorization"] = `Basic ${creds}`;
  } else if (spec.auth.type === "api_key" && spec.auth.apiKeyName && spec.auth.apiKeyValue) {
    if (spec.auth.apiKeyLocation === "query") {
      urlObj.searchParams.append(spec.auth.apiKeyName, spec.auth.apiKeyValue);
    } else {
      requestHeaders[spec.auth.apiKeyName] = spec.auth.apiKeyValue;
    }
  }

  // Set default Content-Type for JSON body
  if (spec.bodyType === "json" && spec.body && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const finalUrl = urlObj.toString();
  const maskedHeaders = maskSensitiveHeaders(requestHeaders);

  // 3. Dispatch Fetch with Timeout
  const timeoutMs = spec.timeoutMs || 10000;
  const controller = new AbortController();
  const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

  let rawResponse: Response | null = null;
  let responseText = "";
  let durationMs = 0;
  let fetchError: Error | null = null;

  try {
    const fetchOptions: RequestInit = {
      method: spec.method,
      headers: requestHeaders,
      signal: controller.signal,
      redirect: "follow",
    };

    if (spec.bodyType === "json" && spec.body && spec.method !== "GET") {
      fetchOptions.body = spec.body;
    }

    const fetchStart = Date.now();
    rawResponse = await fetch(finalUrl, fetchOptions);
    durationMs = Date.now() - fetchStart;
    responseText = await rawResponse.text();
  } catch (err: unknown) {
    durationMs = Date.now() - startTime;
    fetchError = err instanceof Error ? err : new Error(String(err));
  } finally {
    clearTimeout(timeoutTimer);
  }

  // 4. Handle Transport or Timeout Errors
  if (fetchError) {
    const isTimeout =
      fetchError.name === "AbortError" ||
      fetchError.message.includes("aborted") ||
      durationMs >= timeoutMs;

    let friendlyError = fetchError.message;
    if (isTimeout) {
      friendlyError = `Request timed out after ${timeoutMs}ms. Possible causes: slow server, network latency, or blocked endpoint.`;
    } else if (fetchError.message.includes("ENOTFOUND")) {
      friendlyError = `DNS Lookup failed for host "${urlObj.hostname}". Please verify the URL or domain exists.`;
    } else if (fetchError.message.includes("ECONNREFUSED")) {
      friendlyError = `Connection refused at "${urlObj.host}". Target server is not reachable or offline.`;
    }

    return {
      status: isTimeout ? "TIMED_OUT" : "FAILED",
      durationMs,
      request: {
        method: spec.method,
        resolvedUrl: finalUrl,
        headers: maskedHeaders,
        body: spec.body,
      },
      assertions: spec.assertions.map((a) => ({
        assertionId: a.id,
        type: a.type,
        status: "FAILED",
        message: "Skipped due to request connection failure.",
      })),
      totalAssertions: spec.assertions.length,
      passedAssertions: 0,
      failedAssertions: spec.assertions.length,
      errorSummary: friendlyError,
    };
  }

  if (!rawResponse) {
    return {
      status: "FAILED",
      durationMs,
      request: {
        method: spec.method,
        resolvedUrl: finalUrl,
        headers: maskedHeaders,
        body: spec.body,
      },
      assertions: [],
      totalAssertions: 0,
      passedAssertions: 0,
      failedAssertions: 0,
      errorSummary: "No response received from remote server.",
    };
  }

  // 5. Parse Response Headers & Body
  const respHeaders: Record<string, string> = {};
  rawResponse.headers.forEach((val, key) => {
    respHeaders[key.toLowerCase()] = val;
  });

  let isJson = false;
  let jsonParsed: unknown = undefined;
  try {
    jsonParsed = JSON.parse(responseText);
    isJson = true;
  } catch {
    isJson = false;
  }

  // 6. Evaluate Assertions
  const assertionResults: ApiAssertionResult[] = [];
  let allAssertionsPassed = true;

  for (const assertion of spec.assertions) {
    const res = evaluateAssertion(assertion, {
      statusCode: rawResponse.status,
      durationMs,
      headers: respHeaders,
      bodyText: responseText,
      isJson,
      jsonParsed,
    });

    if (res.status === "FAILED") {
      allAssertionsPassed = false;
    }
    assertionResults.push(res);
  }

  const passedCount = assertionResults.filter((r) => r.status === "PASSED").length;
  const failedCount = assertionResults.filter((r) => r.status === "FAILED").length;
  const overallStatus = allAssertionsPassed ? "PASSED" : "FAILED";

  let errorSummary: string | undefined = undefined;
  if (!allAssertionsPassed) {
    const firstFailure = assertionResults.find((r) => r.status === "FAILED");
    errorSummary = firstFailure?.message || "One or more API assertions failed.";
  }

  return {
    status: overallStatus,
    durationMs,
    statusCode: rawResponse.status,
    statusText: rawResponse.statusText || `${rawResponse.status}`,
    request: {
      method: spec.method,
      resolvedUrl: finalUrl,
      headers: maskedHeaders,
      body: spec.body,
    },
    response: {
      statusCode: rawResponse.status,
      statusText: rawResponse.statusText || `${rawResponse.status}`,
      headers: respHeaders,
      body: responseText,
      isJson,
      jsonParsed,
      sizeBytes: Buffer.byteLength(responseText, "utf-8"),
    },
    assertions: assertionResults,
    totalAssertions: spec.assertions.length,
    passedAssertions: passedCount,
    failedAssertions: failedCount,
    errorSummary,
  };
}

function evaluateAssertion(
  assertion: ApiAssertion,
  context: {
    statusCode: number;
    durationMs: number;
    headers: Record<string, string>;
    bodyText: string;
    isJson: boolean;
    jsonParsed: unknown;
  }
): ApiAssertionResult {
  const result: ApiAssertionResult = {
    assertionId: assertion.id,
    type: assertion.type,
    status: "PASSED",
    expected: assertion.expected,
  };

  switch (assertion.type) {
    case "status_equals": {
      const expectedStatus = Number(assertion.expected || 200);
      result.actual = String(context.statusCode);
      if (context.statusCode !== expectedStatus) {
        result.status = "FAILED";
        result.message = `Status code was ${context.statusCode}, expected ${expectedStatus}.`;
      }
      break;
    }

    case "status_is_2xx": {
      result.actual = String(context.statusCode);
      if (context.statusCode < 200 || context.statusCode > 299) {
        result.status = "FAILED";
        result.message = `Expected 2xx Successful status, but got ${context.statusCode}.`;
      }
      break;
    }

    case "status_is_4xx": {
      result.actual = String(context.statusCode);
      if (context.statusCode < 400 || context.statusCode > 499) {
        result.status = "FAILED";
        result.message = `Expected 4xx Client Error status, but got ${context.statusCode}.`;
      }
      break;
    }

    case "status_is_5xx": {
      result.actual = String(context.statusCode);
      if (context.statusCode < 500 || context.statusCode > 599) {
        result.status = "FAILED";
        result.message = `Expected 5xx Server Error status, but got ${context.statusCode}.`;
      }
      break;
    }

    case "response_time_lt": {
      const threshold = Number(assertion.expected || 1000);
      result.actual = `${context.durationMs}ms`;
      if (context.durationMs > threshold) {
        result.status = "FAILED";
        result.message = `Response time ${context.durationMs}ms exceeded threshold of ${threshold}ms.`;
      }
      break;
    }

    case "body_contains": {
      const needle = assertion.expected || "";
      if (!context.bodyText.includes(needle)) {
        result.status = "FAILED";
        result.actual = context.bodyText.slice(0, 100);
        result.message = `Response body does not contain expected substring "${needle}".`;
      }
      break;
    }

    case "json_property_exists": {
      if (!context.isJson) {
        result.status = "FAILED";
        result.message = "Response body is not valid JSON.";
        break;
      }
      const val = getValueByPath(context.jsonParsed, assertion.property || "");
      if (val === undefined) {
        result.status = "FAILED";
        result.message = `JSON property "${assertion.property}" does not exist in response.`;
      }
      break;
    }

    case "json_property_equals": {
      if (!context.isJson) {
        result.status = "FAILED";
        result.message = "Response body is not valid JSON.";
        break;
      }
      const val = getValueByPath(context.jsonParsed, assertion.property || "");
      result.actual = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
      const expected = String(assertion.expected ?? "");
      if (String(val) !== expected) {
        result.status = "FAILED";
        result.message = `Property "${assertion.property}" value "${result.actual}" did not match expected "${expected}".`;
      }
      break;
    }

    case "json_property_contains": {
      if (!context.isJson) {
        result.status = "FAILED";
        result.message = "Response body is not valid JSON.";
        break;
      }
      const val = getValueByPath(context.jsonParsed, assertion.property || "");
      const actualStr = typeof val === "object" ? JSON.stringify(val) : String(val ?? "");
      result.actual = actualStr;
      const needle = assertion.expected || "";
      if (!actualStr.includes(needle)) {
        result.status = "FAILED";
        result.message = `Property "${assertion.property}" ("${actualStr}") does not contain "${needle}".`;
      }
      break;
    }

    case "header_exists": {
      const headerName = (assertion.property || "").toLowerCase();
      const val = context.headers[headerName];
      if (val === undefined) {
        result.status = "FAILED";
        result.message = `Header "${assertion.property}" was not found in response.`;
      }
      break;
    }

    case "header_equals": {
      const headerName = (assertion.property || "").toLowerCase();
      const val = context.headers[headerName];
      result.actual = val;
      const expected = (assertion.expected || "").toLowerCase();
      if (!val || !val.toLowerCase().includes(expected)) {
        result.status = "FAILED";
        result.message = `Header "${assertion.property}" was "${val || ""}", expected "${assertion.expected}".`;
      }
      break;
    }
  }

  return result;
}
