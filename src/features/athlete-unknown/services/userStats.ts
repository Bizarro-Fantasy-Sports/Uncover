import { config } from "@/config";
import { athleteUnknownApiService } from "./api";
import { MockDataService } from "./mockData";
import {
  createInitialUserStats,
  loadGuestStats,
} from "@/features/athlete-unknown/utils";
import { hasGuestStats } from "./statsMigration";

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
   * Returns empty stats object if user is not authenticated (401)
   */
  async getUserStats(): Promise<any> {
    if (this.useMockData) {
      console.log("[MOCK] Fetching user stats");
      return MockDataService.getUserStats();
    }

    try {
      console.log("[API] Fetching user stats");
      return await athleteUnknownApiService.getUserStats();
    } catch (error: any) {
      // Handle 401 (unauthorized) gracefully - user is not logged in
      console.log("ERROR", error);
      if (error?.status === 401) {
        console.log("[API] User not authenticated, returning empty stats");
        // load guestStats as user stats if availble
        if (hasGuestStats()) {
          return loadGuestStats();
        }
        return createInitialUserStats();
      }
      // Re-throw other errors
      throw error;
    }
  }
}

// Export singleton instance
const userStatsService = new UserStatsService();
export { userStatsService };
