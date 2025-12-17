/**
 * API Service – Centralised HTTP client for the entire app
 * Works with Next.js App Router, handles timeouts, aborts, and JSON automatically
 */

export interface ApiRequestOptions {
  headers?: Record<string, string>
  timeout?: number
}

export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  status: number
}

export class ApiService {
  private baseUrl: string
  private defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  }

  private endpoints = {
    HUMAN: "/human",
    GRAPH: "/graph",
    GRAPHS: "/graph/graphs",
    CALC_USER: "/human/calc",
    USER_GRAPHS: "/human/graphs",
    GRAPH_USERS: "/graph/users",
  }

  constructor() {
    const DEFAULT_URL = "http://localhost:8085/mistaa"
    const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim()

    this.baseUrl = envUrl || DEFAULT_URL
    // Remove trailing slash
    if (this.baseUrl.endsWith("/")) {
      this.baseUrl = this.baseUrl.slice(0, -1)
    }
  }

  private getUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    let url = `${this.baseUrl}${cleanEndpoint}`

    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        const stringValue = String(value)
        if (stringValue) {
          query.append(key, stringValue)
        }
      })
      const queryString = query.toString()
      if (queryString) url += `?${queryString}`
    }

    return url
  }

  private async request<T>(
    url: string,
    method = "GET",
    body?: any,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    let controller: AbortController | null = null

    try {
      controller = new AbortController()
      const timeoutMs = options?.timeout || 100_000

      const timeoutId = setTimeout(() => controller?.abort(), timeoutMs)

      const fetchOptions: RequestInit = {
        method,
        headers: { ...this.defaultHeaders, ...options?.headers },
        signal: controller.signal,
        credentials: "same-origin", // Important for cookies/sessions
      }

      if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
        fetchOptions.body = JSON.stringify(body)
      }

      const response = await fetch(url, fetchOptions)

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Try to parse JSON, fallback to null if empty body
      let data: T | null = null
      const text = await response.text()
      if (text) {
        data = JSON.parse(text) as T
      }

      return { data, error: null, status: response.status }
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error occurred")

      if (err.name === "AbortError") {
        const timeoutError = new Error("Request timeout. Please check that the API server is running and accessible.")
        return { data: null, error: timeoutError, status: 0 }
      }

      return { data: null, error: err, status: 0 }
    }
  }

  // HTTP method wrappers
  public async get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean>,
    options?: ApiRequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(this.getUrl(endpoint, params), "GET", undefined, options)
  }

  public async post<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(this.getUrl(endpoint), "POST", body, options)
  }

  public async put<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(this.getUrl(endpoint), "PUT", body, options)
  }

 public async updateGraph(graphId: string, graphData: any) {
  return this.post<void>(`${this.endpoints.GRAPH}/${graphId}`, graphData)
}

  public async loadGraph(operatorId: string, graphId: string) {
    return this.get<any>(`${this.endpoints.GRAPH}/${operatorId}/${graphId}`)
  }

 public async listGraphIds(operatorId: string) {
  return this.get<string[]>(`${this.endpoints.GRAPHS}?operatorId=${encodeURIComponent(operatorId)}`)
}

  public async calcUser<T>(email: string, graphId: string, answers: Record<string, any>): Promise<ApiResponse<T>> {
    return this.post<T>(`${this.endpoints.CALC_USER}/${encodeURIComponent(email)}/${graphId}`, answers)
  }

  public async getAllConnectedGraphs(email: string): Promise<ApiResponse<Array<{ id: string; operatorId: string }>>> {
    return this.get<Array<{ id: string; operatorId: string }>>(this.endpoints.USER_GRAPHS, { email })
  }

  public async getGraphCompletions(
    operatorId: string,
    graphId: string,
  ): Promise<ApiResponse<Array<{ email: string; status: number }>>> {
    return this.get<Array<{ email: string; status: number }>>(`${this.endpoints.GRAPH_USERS}/${operatorId}/${graphId}`)
  }

  public async login<T>(email: string, password: string): Promise<ApiResponse<T>> {
    const encodedEmail = encodeURIComponent(email)
    const encodedPassword = encodeURIComponent(password)

    try {
      const response = await this.get<T>(`${this.endpoints.HUMAN}/${encodedEmail}/${encodedPassword}`, undefined, {
        timeout: 15_000, // Shorter timeout for login attempts
      })

      // If backend is unavailable in development, allow test login
      if (response.error && response.status === 0 && process.env.NODE_ENV !== "production") {
        console.warn("[v0] Backend unavailable, allowing dev login:", email)
        return {
          data: { username: email.split("@")[0], email } as any,
          error: null,
          status: 200,
        }
      }

      return response
    } catch (err) {
      // Fallback for unexpected errors
      const error = err instanceof Error ? err : new Error("Login failed")
      return { data: null, error, status: 0 }
    }
  }

  public async register<T>(userData: any): Promise<ApiResponse<T>> {
    return this.post<T>(this.endpoints.HUMAN, userData)
  }
}

// Singleton instance
export const apiService = new ApiService()
