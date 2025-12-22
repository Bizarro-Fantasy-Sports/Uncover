import type { ApiError } from "../types/http";

/**
 * Generic HTTP client with auth, timeout, and error handling
 * Reusable across all Statsland games
 */
class HttpClient {
  private baseUrl: string;
  private timeout: number;
  private getAccessTokenSilently?: (options?: {
    authorizationParams?: {
      audience?: string;
    };
  }) => Promise<string>;

  constructor(baseUrl: string, timeout: number = 10000) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Set the Auth0 getAccessTokenSilently function
   * This should be called after the Auth0Provider is initialized
   */
  setGetAccessToken(
    getAccessTokenSilently: (options?: {
      authorizationParams?: {
        audience?: string;
      };
    }) => Promise<string>
  ): void {
    this.getAccessTokenSilently = getAccessTokenSilently;
  }

  /**
   * Fetch with timeout and authentication
   */
  async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      // Get access token if available
      let token: string | undefined;
      if (this.getAccessTokenSilently) {
        try {
          token = await this.getAccessTokenSilently({
            authorizationParams: {
              audience: process.env.REACT_APP_AUTH0_AUDIENCE,
            },
          });
        } catch (error) {
          console.error("Error getting access token:", error);
          // Continue without token - let the backend handle unauthorized requests
        }
      }

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });
      clearTimeout(id);
      return response;
    } catch (error) {
      clearTimeout(id);
      throw error;
    }
  }

  /**
   * Handle HTTP response and extract JSON
   */
  async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP error! status: ${response.status}`,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.details = errorData;
        error.message = errorData.message || error.message;
      } catch {
        // Response body is not JSON
      }

      throw error;
    }

    return response.json();
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithTimeout(url);
    return this.handleResponse<T>(response);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body: any): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await this.fetchWithTimeout(url, {
      method: "POST",
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(response);
  }

  /**
   * Format error for display
   */
  formatError(error: any, defaultMessage: string): ApiError {
    if (error.name === "AbortError") {
      return {
        message: "Request timeout - please try again",
        status: 408,
      };
    }

    if (error.message && error.status) {
      return error as ApiError;
    }

    return {
      message: defaultMessage,
      details: error,
    };
  }

  /**
   * Get base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

export default HttpClient;
