import API_CONFIG from "../config/api";
import type {
  PlayerData,
  RoundStats,
  GameResult,
  GameResultResponse,
  ApiError,
} from "../types/api";

// Tile names mapping (index 0-8 maps to backend tile names)
const TILE_NAMES = [
  "bio",
  "playerInformation",
  "draftInformation",
  "yearsActive",
  "teamsPlayedOn",
  "jerseyNumbers",
  "careerStats",
  "personalAchievements",
  "photo",
];

class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.timeout = API_CONFIG.timeout;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
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

  private async handleResponse<T>(response: Response): Promise<T> {
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
   * Get round data (includes both player and stats)
   * @param sport - The sport (baseball, basketball, football)
   * @param date - The date in YYYY-MM-DD format (optional, defaults to today in browser's local timezone)
   */
  private async getRound(sport: string, date?: string): Promise<any> {
    // Use browser's local timezone for date calculation
    const dateParam = date || (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })();
    const url = `${this.baseUrl}${API_CONFIG.endpoints.getRound(sport, dateParam)}`;

    try {
      const response = await this.fetchWithTimeout(url);
      return this.handleResponse<any>(response);
    } catch (error) {
      console.error("Error fetching round data:", error);
      throw this.formatError(error, "Failed to load round data");
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
        Name: round.player.name,
        Bio: round.player.bio,
        "Player Information": round.player.playerInformation,
        "Draft Information": round.player.draftInformation,
        "Years Active": round.player.yearsActive,
        "Teams Played On": round.player.teamsPlayedOn,
        "Jersey Numbers": round.player.jerseyNumbers,
        "Career Stats": round.player.careerStats,
        "Personal Achievements": round.player.personalAchievements,
        Photo: [round.player.photo],
        playDate: round.playDate,
        sport: round.sport,
      };

      return playerData;
    } catch (error) {
      console.error("Error fetching player data:", error);
      throw this.formatError(error, "Failed to load player data");
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
      throw this.formatError(error, "Failed to load round statistics");
    }
  }

  /**
   * Submit game results
   * @param gameResult - The game result data
   */
  async submitGameResults(
    gameResult: GameResult
  ): Promise<GameResultResponse> {
    // Use browser's local timezone for date calculation
    const dateParam = gameResult.playDate || (() => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    })();
    const url = `${this.baseUrl}${API_CONFIG.endpoints.submitGameResults(gameResult.sport, dateParam)}`;

    // Transform frontend format to backend format
    const backendPayload = {
      score: gameResult.score,
      isCorrect: gameResult.completed,
      tilesFlipped: gameResult.flippedTilesPattern
        .map((flipped, index) => flipped ? TILE_NAMES[index] : null)
        .filter(Boolean),
    };

    try {
      const response = await this.fetchWithTimeout(url, {
        method: "POST",
        body: JSON.stringify(backendPayload),
      });
      const result = await this.handleResponse<any>(response);

      return {
        success: true,
        message: "Results submitted successfully",
        roundStats: result,
      };
    } catch (error) {
      console.error("Error submitting game results:", error);
      throw this.formatError(error, "Failed to submit game results");
    }
  }

  /**
   * Get user statistics
   * @param userId - The user ID
   */
  async getUserStats(userId: string): Promise<any> {
    const url = `${this.baseUrl}${API_CONFIG.endpoints.getUserStats(userId)}`;

    try {
      const response = await this.fetchWithTimeout(url);
      return this.handleResponse<any>(response);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw this.formatError(error, "Failed to load user statistics");
    }
  }

  private formatError(error: any, defaultMessage: string): ApiError {
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
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
