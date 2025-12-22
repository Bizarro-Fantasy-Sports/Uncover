// Generic HTTP types - reusable across all Statsland games

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}

export interface HttpConfig {
  baseUrl: string;
  timeout: number;
}
