import { config } from "@/config";
import { athleteUnknownApiService } from "./api";
import { MockDataService } from "./mockData";

/**
 * User Stats Service
 * Handles fetching user statistics for the Athlete Unknown game
 */
class UserStatsService {
  private useMockData: boolean;

  constructor() {
    this.useMockData = config.api.useMockData;
    console.log(
      `UserStatsService initialized - Using ${this.useMockData ? "MOCK" : "API"} data`
    );
  }

  /**
   * Get user statistics
   * Falls back to mock data if API call fails
   */
  async getUserStats(): Promise<any> {
    if (this.useMockData) {
      console.log("[MOCK] Fetching user stats");
      return MockDataService.getUserStats();
    }

    try {
      console.log("[API] Fetching user stats");
      return await athleteUnknownApiService.getUserStats();
    } catch (error) {
      console.warn(
        "[API] Failed to fetch user stats, falling back to mock data:",
        error
      );
      return MockDataService.getUserStats();
    }
  }
}

// Export singleton instance
const userStatsService = new UserStatsService();
export { userStatsService };
