// All HTTP verbs the client knows how to issue.
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

// Options supplied when creating a new ApiClient instance.
export interface ApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: HeadersInit;
  fetchImpl?: typeof fetch;
}

// Per-request overrides that feed into ApiClient.request.
export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  parseJson?: boolean;
}

// Standardized error object raised when a response is not ok.
export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;
  private fetchImpl: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

  constructor(options: ApiClientOptions = {}) {
    // Normalize the configured base URL and strip trailing slashes.
    this.baseUrl = options.baseUrl?.replace(/\/+$/, "") ?? "";
    // Store headers that will be sent with every request unless overridden.
    this.defaultHeaders = options.defaultHeaders ?? { "Content-Type": "application/json" };
    const impl = options.fetchImpl ?? fetch;
    // Bind the fetch implementation to globalThis to avoid illegal invocation errors in the browser.
    this.fetchImpl = (input, init) => impl.call(globalThis, input, init);
  }

  // Allow callers to mutate default headers after instantiation (e.g., set Authorization).
  setHeader(name: string, value: string) {
    if (Array.isArray(this.defaultHeaders)) {
      this.defaultHeaders.push([name, value]);
    } else if (this.defaultHeaders instanceof Headers) {
      this.defaultHeaders.set(name, value);
    } else {
      this.defaultHeaders = { ...this.defaultHeaders, [name]: value };
    }
  }

  // Build the absolute URL for a request, including optional query params.
  private buildUrl(path: string, query?: ApiRequestOptions["query"]) {
    const url = new URL(path.replace(/^\//, ""), this.baseUrl || "http://local-placeholder");
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }
    if (!this.baseUrl) {
      return url.pathname + url.search;
    }
    return url.toString();
  }

  // Core request handler used by every verb helper.
  async request<TResponse = unknown>(path: string, options: ApiRequestOptions = {}) {
    const {
      method = "GET",
      body,
      query,
      headers,
      parseJson = true,
      ...rest
    } = options;

    const url = this.buildUrl(path, query);
    const mergedHeaders = this.mergeHeaders(headers);

    const requestInit: RequestInit = {
      method,
      headers: mergedHeaders,
      ...rest,
    };

    // Automatically JSON serialize plain bodies unless they are already streamable (FormData/Blob).
    if (body !== undefined && body !== null) {
      if (body instanceof FormData || body instanceof Blob) {
        requestInit.body = body;
        if (requestInit.headers instanceof Headers) {
          requestInit.headers.delete("Content-Type");
        } else if (!Array.isArray(requestInit.headers)) {
          delete (requestInit.headers as Record<string, string>)["Content-Type"];
        }
      } else {
        requestInit.body = JSON.stringify(body);
      }
    }

    const response = await this.fetchImpl(url, requestInit);
    if (!response.ok) {
      // Capture any response payload and include it with the error for callers to inspect.
      const errorPayload = await this.safeParseJson(response);
      throw new ApiError(response.statusText || "Request failed", response.status, errorPayload);
    }

    if (!parseJson) {
      return response as unknown as TResponse;
    }

    return (await this.safeParseJson(response)) as TResponse;
  }

  // Convenience verb helpers below simply forward to request with the appropriate method.
  get<T = unknown>(path: string, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: "GET" });
  }

  post<T = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: "POST", body });
  }

  put<T = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: "PUT", body });
  }

  patch<T = unknown>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: "PATCH", body });
  }

  delete<T = unknown>(path: string, options?: ApiRequestOptions) {
    return this.request<T>(path, { ...options, method: "DELETE" });
  }

  // Merge per-request headers with the stored defaults while preserving the underlying type.
  private mergeHeaders(override?: HeadersInit): HeadersInit {
    if (!override) return this.defaultHeaders;

    if (override instanceof Headers) {
      const result = new Headers(this.defaultHeaders);
      override.forEach((value, key) => result.set(key, value));
      return result;
    }

    if (Array.isArray(override)) {
      return [...this.asHeaderArray(this.defaultHeaders), ...override];
    }

    if (this.defaultHeaders instanceof Headers) {
      const result = new Headers(this.defaultHeaders);
      Object.entries(override).forEach(([key, value]) => {
        if (value !== undefined) {
          result.set(key, value as string);
        }
      });
      return result;
    }

    return { ...(this.defaultHeaders as Record<string, string>), ...override };
  }

  // Convert any HeadersInit variant into a consistent tuple form.
  private asHeaderArray(headers: HeadersInit): [string, string][] {
    if (headers instanceof Headers) {
      return Array.from(headers.entries());
    }
    if (Array.isArray(headers)) {
      return headers;
    }
    return Object.entries(headers ?? {});
  }

  // Safely attempt to parse JSON responses; ignore invalid JSON or non-JSON responses.
  private async safeParseJson(response: Response) {
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return undefined;
    }
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }
}

function resolveBaseUrl() {
  const configuredRaw = (import.meta.env.PUBLIC_API_URL ?? "").trim();
  const sanitizedConfigured =
    configuredRaw.length > 0 ? configuredRaw.replace(/\/+$/, "") : "";

  if (typeof window !== "undefined") {
    const isGitHubPagesHost = window.location.hostname.endsWith("github.io");
    if (isGitHubPagesHost) {
      if (!sanitizedConfigured || sanitizedConfigured.includes("localhost")) {
        return "https://backend-shop-m2mf.onrender.com";
      }
    }
  }

  if (sanitizedConfigured) {
    return sanitizedConfigured;
  }

  return "http://localhost:3000";
}

// Default shared client used across the app. Inject PUBLIC_API_URL to point at the backend.
export const apiClient = new ApiClient({
  baseUrl: resolveBaseUrl(),
});
