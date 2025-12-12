// API Configuration
export const API_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
  useMockData: process.env.REACT_APP_USE_MOCK_DATA === "true",
  endpoints: {
    // Round endpoint - returns both player data and stats
    getRound: (sport: string, date: string) =>
      `/v1/round?sport=${sport}&playDate=${date}`,

    // Game results submission
    submitGameResults: (sport: string, date: string) =>
      `/v1/results?sport=${sport}&playDate=${date}`,

    // User stats endpoints
    getUserStats: (userId: string) => `/v1/stats/user?userId=${userId}`,
  },
  timeout: 10000, // 10 second timeout
};

export default API_CONFIG;
