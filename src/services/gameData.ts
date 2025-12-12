import API_CONFIG from '../config/api';
import apiService from './api';
import MockDataService from './mockData';
import type { PlayerData, RoundStats, GameResult, GameResultResponse } from '../types/api';

/**
 * Unified game data service that switches between API and mock data
 * based on configuration
 */
class GameDataService {
  private useMockData: boolean;

  constructor() {
    this.useMockData = API_CONFIG.useMockData;
    console.log(`GameDataService initialized - Using ${this.useMockData ? 'MOCK' : 'API'} data`);
  }

  /**
   * Get player data by sport and date
   * Falls back to mock data if API call fails
   */
  async getPlayerData(sport: string, date?: string): Promise<PlayerData> {
    if (this.useMockData) {
      console.log(`[MOCK] Fetching player data for ${sport}`);
      return MockDataService.getPlayerData(sport, date);
    }

    try {
      console.log(`[API] Fetching player data for ${sport} on ${date || 'today'}`);
      return await apiService.getPlayerBySportAndDate(sport, date);
    } catch (error) {
      console.warn('[API] Failed to fetch player data, falling back to mock data:', error);
      return MockDataService.getPlayerData(sport, date);
    }
  }

  /**
   * Get round statistics by sport and date
   * Falls back to mock data if API call fails
   */
  async getRoundStats(sport: string, date?: string): Promise<RoundStats> {
    if (this.useMockData) {
      console.log(`[MOCK] Fetching round stats for ${sport}`);
      return MockDataService.getRoundStats(sport, date);
    }

    try {
      console.log(`[API] Fetching round stats for ${sport} on ${date || 'today'}`);
      return await apiService.getRoundStats(sport, date);
    } catch (error) {
      console.warn('[API] Failed to fetch round stats, falling back to mock data:', error);
      return MockDataService.getRoundStats(sport, date);
    }
  }

  /**
   * Submit game results
   * Only submits if not in mock mode
   */
  async submitGameResults(gameResult: GameResult): Promise<GameResultResponse | null> {
    if (this.useMockData) {
      console.log('[MOCK] Game results not submitted (mock mode):', gameResult);
      return {
        success: true,
        message: 'Mock mode - results not submitted',
      };
    }

    try {
      console.log('[API] Submitting game results:', gameResult);
      const response = await apiService.submitGameResults(gameResult);
      console.log('[API] Game results submitted successfully:', response);
      return response;
    } catch (error) {
      console.error('[API] Failed to submit game results:', error);
      // Don't throw - allow game to continue even if submission fails
      return {
        success: false,
        message: 'Failed to submit results',
      };
    }
  }

  /**
   * Toggle between mock and API data (for testing)
   */
  setUseMockData(useMock: boolean): void {
    this.useMockData = useMock;
    console.log(`Switched to ${useMock ? 'MOCK' : 'API'} data mode`);
  }

  /**
   * Check if currently using mock data
   */
  isUsingMockData(): boolean {
    return this.useMockData;
  }
}

// Export singleton instance
export const gameDataService = new GameDataService();
export default gameDataService;
