import { config, SportType } from "@/config";
import { athleteUnknownApiService } from "./api";
import { MockDataService } from "./mockData";
import type { Round } from "@/features/athlete-unknown/types";

/**
 * Rounds Service
 * Handles fetching round data for the Athlete Unknown game
 */
class RoundsService {
  private useMockData: boolean;

  constructor() {
    this.useMockData = config.api.useMockData;
    console.log(
      `RoundsService initialized - Using ${this.useMockData ? "MOCK" : "API"} data`
    );
  }

  /**
   * Get all rounds for a sport (for regular users)
   */
  async getRounds(sport: SportType): Promise<Round[]> {
    if (this.useMockData) {
      console.log(`[MOCK] Fetching rounds for ${sport}`);
      return MockDataService.getRounds(sport);
    }

    try {
      console.log(`[API] Fetching rounds for ${sport}`);
      return await athleteUnknownApiService.getRounds(sport);
    } catch (error) {
      console.warn(
        "[API] Failed to fetch rounds, falling back to mock data:",
        error
      );
      return MockDataService.getRounds(sport);
    }
  }

  /**
   * Get upcoming rounds for a sport (for playtesters)
   */
  async getUpcomingRounds(sport: SportType): Promise<Round[]> {
    if (this.useMockData) {
      console.log(`[MOCK] Fetching upcoming rounds for ${sport}`);
      return MockDataService.getUpcomingRounds(sport);
    }

    try {
      console.log(`[API] Fetching upcoming rounds for ${sport}`);
      return await athleteUnknownApiService.getUpcomingRounds(sport);
    } catch (error) {
      console.warn(
        "[API] Failed to fetch upcoming rounds, falling back to mock data:",
        error
      );
      return MockDataService.getUpcomingRounds(sport);
    }
  }
}

// Export singleton instance
const roundsService = new RoundsService();
export { roundsService };
