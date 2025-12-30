import { HttpClient } from "@/services";
import { API_CONFIG } from "@/config";
import { TILE_NAMES } from "@/features/athlete-unknown/config";
import type {
  GameResult,
  GameResultResponse,
  Round,
  UserStats,
} from "@/features/athlete-unknown/types";
import { getCurrentDateString } from "@/features/athlete-unknown/utils";

/**
 * Athlete Unknown API Service
 * Game-specific API methods for the Athlete Unknown game
 */
class AthleteUnknownApiService {
  private httpClient: HttpClient;

  constructor() {
    this.httpClient = new HttpClient(API_CONFIG.baseUrl, API_CONFIG.timeout);
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
    this.httpClient.setGetAccessToken(getAccessTokenSilently);
  }

  /**
   * Get round data (includes both player and stats)
   * @param sport - The sport (baseball, basketball, football)
   * @param date - The date in YYYY-MM-DD format (optional, defaults to today in browser's local timezone)
   */
  async getRound(sport: string, date?: string): Promise<Round> {
    // Use browser's local timezone for date calculation
    const dateParam = date || getCurrentDateString();
    const endpoint = `/v1/round?sport=${sport}&playDate=${dateParam}`;

    try {
      return await this.httpClient.get<any>(endpoint);
    } catch (error) {
      console.error("Error fetching round data:", error);
      throw this.httpClient.formatError(error, "Failed to load round data");
    }
  }

  /**
   * Submit game results
   * @param gameResult - The game result data
   */
  async submitGameResults(gameResult: GameResult): Promise<GameResultResponse> {
    // Use browser's local timezone for date calculation
    const dateParam = gameResult.playDate || getCurrentDateString();
    const endpoint = `/v1/results?sport=${gameResult.sport}&playDate=${dateParam}`;

    // Transform frontend format to backend format
    const backendPayload = {
      score: gameResult.score,
      isCorrect: gameResult.completed,
      tilesFlipped: gameResult.flippedTilesPattern
        .map((flipped, index) => (flipped ? TILE_NAMES[index] : null))
        .filter(Boolean),
    };

    try {
      const result = await this.httpClient.post<any>(endpoint, backendPayload);

      return {
        success: true,
        message: "Results submitted successfully",
        result: result,
      };
    } catch (error) {
      console.error("Error submitting game results:", error);
      throw this.httpClient.formatError(error, "Failed to submit game results");
    }
  }

  /**
   * Get user statistics
   * userId passed via bearer token
   */
  async getUserStats(): Promise<UserStats> {
    const endpoint = `/v1/stats/user`;

    try {
      return await this.httpClient.get<any>(endpoint);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw this.httpClient.formatError(
        error,
        "Failed to load user statistics"
      );
    }
  }
}

// Export singleton instance
const athleteUnknownApiService = new AthleteUnknownApiService();
export { athleteUnknownApiService };
