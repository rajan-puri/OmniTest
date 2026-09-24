import { ApiClientOptions, ApiClientError } from "./types";

export class ApiClient {
  private baseUrl: string;
  private token?: string;
  private timeoutMs: number;

  constructor(options: ApiClientOptions) {
    // Normalize baseUrl: strip trailing slash
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.token = options.token;
    this.timeoutMs = options.timeoutMs || 30000;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const contentType = response.headers.get("content-type") || "";
      let data: any;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        let suggestion: string | undefined;
        let code = `HTTP_${response.status}`;

        if (response.status === 401) {
          code = "UNAUTHORIZED";
          suggestion =
            "Authentication failed. Please verify your OMNITEST_TOKEN or run 'omnitest init' to configure.";
        } else if (response.status === 403) {
          code = "FORBIDDEN";
          suggestion =
            "You do not have permission for this project. Check your role or organization membership.";
        } else if (response.status === 404) {
          code = "NOT_FOUND";
          suggestion =
            "The requested resource was not found. Please verify project/test IDs in your config or arguments.";
        } else if (response.status >= 500) {
          code = "SERVER_ERROR";
          suggestion = "The OmniTest server encountered an error. Check server logs.";
        }

        const errorMessage =
          typeof data?.error === "string"
            ? data.error
            : data?.error?.message || data?.message || `Request failed with status ${response.status}`;

        throw new ApiClientError(errorMessage, {
          statusCode: response.status,
          code,
          suggestion,
          details: data,
        });
      }

      return data as T;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err instanceof ApiClientError) {
        throw err;
      }

      if (err.name === "AbortError") {
        throw new ApiClientError(`Request timed out after ${this.timeoutMs}ms`, {
          statusCode: 408,
          code: "TIMEOUT",
          suggestion: `Ensure OmniTest server at ${this.baseUrl} is running and reachable.`,
        });
      }

      throw new ApiClientError(err?.message || "Failed to connect to OmniTest server", {
        statusCode: 0,
        code: "CONNECTION_FAILED",
        suggestion: `Could not reach ${this.baseUrl}. Is the OmniTest server running?`,
      });
    }
  }

  async getMe(): Promise<any> {
    return this.request<any>("/api/auth/me");
  }

  async getProject(projectId: string): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}`);
  }

  async listTests(projectId: string): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}/tests`);
  }

  async getTest(testId: string): Promise<any> {
    return this.request<any>(`/api/tests/${testId}`);
  }

  async runTest(testId: string, options: { targetUrl?: string } = {}): Promise<any> {
    return this.request<any>(`/api/tests/${testId}/run`, {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async runProject(
    projectId: string,
    options: {
      testIds?: string[];
      type?: string;
      visual?: boolean;
      environment?: string;
      targetUrl?: string;
    } = {}
  ): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}/run`, {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async getHistory(
    projectId: string,
    filter: {
      testId?: string;
      status?: string;
      testType?: string;
      page?: number;
      pageSize?: number;
      search?: string;
    } = {}
  ): Promise<any> {
    const params = new URLSearchParams();
    if (filter.testId) params.append("testId", filter.testId);
    if (filter.status) params.append("status", filter.status);
    if (filter.testType) params.append("testType", filter.testType);
    if (filter.page) params.append("page", String(filter.page));
    if (filter.pageSize) params.append("pageSize", String(filter.pageSize));
    if (filter.search) params.append("search", filter.search);

    const queryString = params.toString() ? `?${params.toString()}` : "";
    return this.request<any>(`/api/projects/${projectId}/history${queryString}`);
  }

  async getReport(projectId: string, runId: string): Promise<any> {
    return this.request<any>(`/api/projects/${projectId}/runs/${runId}/report`);
  }
}
