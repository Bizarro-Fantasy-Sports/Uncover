import { config } from "@/config";
import { athleteUnknownApiService } from "./api";
import { MockDataService } from "./mockData";
import type {
  GameResultResponse,
  Result,
  Round,
} from "@/features/athlete-unknown/types";

/**
 * Unified game data service that switches between API and mock data
 * based on configuration
 */
class GameDataService {
  private useMockData: boolean;

  constructor() {
    this.useMockData = config.api.useMockData;
    console.log(
      `GameDataService initialized - Using ${this.useMockData ? "MOCK" : "API"} data`
    );
  }

  /**
   * Get round data by sport and date
   * Falls back to mock data if API call fails
   */
  async getRoundData(sport: string, date?: string): Promise<Round> {
    if (this.useMockData) {
      console.log(`[MOCK] Fetching round data for ${sport}`);
      return MockDataService.getRoundData(sport);
    }

    try {
      console.log(
        `[API] Fetching player data for ${sport} on ${date || "today"}`
      );
      return await athleteUnknownApiService.getRound(sport, date);
    } catch (error) {
      console.warn(
        "[API] Failed to fetch round data, falling back to mock data:",
        error
      );
      return MockDataService.getRoundData(sport);
    }
  }

  /**
   * Submit game results
   * Only submits if not in mock mode
   */
  async submitGameResults(
    sport: string,
    playDate: string,
    gameResult: Result
  ): Promise<GameResultResponse | null> {
    if (this.useMockData) {
      console.log("[MOCK] Game results not submitted (mock mode):", gameResult);
      return {
        success: true,
        message: "Mock mode - results not submitted",
      };
    }

    try {
      console.log("[API] Submitting game results:", gameResult);
      const response = await athleteUnknownApiService.submitGameResults(
        sport,
        playDate,
        gameResult
      );
      console.log("[API] Game results submitted successfully:", response);
      return response;
    } catch (error) {
      console.error("[API] Failed to submit game results:", error);
      // Don't throw - allow game to continue even if submission fails
      return {
        success: false,
        message: "Failed to submit results",
      };
    }
  }

  /**
   * Toggle between mock and API data (for testing)
   */
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
    console.log(`Switched to ${useMock ? "MOCK" : "API"} data mode`);
  }

  /**
   * Check if currently using mock data
   */
  isUsingMockData(): boolean {
    return this.useMockData;
  }
}

// Export singleton instance
const gameDataService = new GameDataService();
export { gameDataService };
