// Global API Configuration - reusable across all Statsland games
export const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  timeout: 10000, // 10 second timeout
  useMockData: process.env.REACT_APP_USE_MOCK_DATA === "true",
};

export default API_CONFIG;
