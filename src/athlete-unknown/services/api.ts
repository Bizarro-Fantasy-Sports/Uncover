import HttpClient from "../../services/httpClient";
import API_CONFIG from "../../config/api";
import { TILE_NAMES } from "../config";
import type {
  PlayerData,
  RoundStats,
  GameResult,
  GameResultResponse,
} from "../types/api";

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
  private async getRound(sport: string, date?: string): Promise<any> {
    // Use browser's local timezone for date calculation
    const dateParam =
      date ||
      (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })();
    const endpoint = `/v1/round?sport=${sport}&playDate=${dateParam}`;

    try {
      return await this.httpClient.get<any>(endpoint);
    } catch (error) {
      console.error("Error fetching round data:", error);
      throw this.httpClient.formatError(error, "Failed to load round data");
    }
  }

  /**
   * Get player data by sport and date
   * @param sport - The sport (baseball, basketball, football)
   * @param date - The date in YYYY-MM-DD format (optional, defaults to today)
   */
  async getPlayerBySportAndDate(
    sport: string,
    date?: string
  ): Promise<PlayerData> {
    try {
      const round = await this.getRound(sport, date);

      // Transform backend Round.Player to frontend PlayerData format
      const playerData: PlayerData = {
        name: round.player.name,
        bio: round.player.bio,
        playerInformation: round.player.playerInformation,
        draftInformation: round.player.draftInformation,
        yearsActive: round.player.yearsActive,
        teamsPlayedOn: round.player.teamsPlayedOn,
        jerseyNumbers: round.player.jerseyNumbers,
        careerStats: round.player.careerStats,
        personalAchievements: round.player.personalAchievements,
        photo: round.player.photo,
        playDate: round.playDate,
        sport: round.sport,
      };

      return playerData;
    } catch (error) {
      console.error("Error fetching player data:", error);
      throw this.httpClient.formatError(error, "Failed to load player data");
    }
  }

  /**
   * Get round statistics by sport and date
   * @param sport - The sport (baseball, basketball, football)
   * @param date - The date in YYYY-MM-DD format (optional, defaults to today)
   */
  async getRoundStats(sport: string, date?: string): Promise<RoundStats> {
    try {
      const round = await this.getRound(sport, date);

      // Return the stats from the round
      return round.stats as RoundStats;
    } catch (error) {
      console.error("Error fetching round stats:", error);
      throw this.httpClient.formatError(
        error,
        "Failed to load round statistics"
      );
    }
  }

  /**
   * Submit game results
   * @param gameResult - The game result data
   */
  async submitGameResults(gameResult: GameResult): Promise<GameResultResponse> {
    // Use browser's local timezone for date calculation
    const dateParam =
      gameResult.playDate ||
      (() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      })();
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
        roundStats: result,
      };
    } catch (error) {
      console.error("Error submitting game results:", error);
      throw this.httpClient.formatError(
        error,
        "Failed to submit game results"
      );
    }
  }

  /**
   * Get user statistics
   * @param userId - The user ID
   */
  async getUserStats(userId: string): Promise<any> {
    const endpoint = `/v1/stats/user?userId=${userId}`;

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
export const athleteUnknownApiService = new AthleteUnknownApiService();
export default athleteUnknownApiService;
