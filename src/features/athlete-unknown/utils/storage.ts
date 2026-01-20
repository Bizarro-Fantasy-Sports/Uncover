/**
 * LocalStorage key constants
 * Centralized location for all localStorage keys used in the application
 */

import type { SportType, TileType } from "@/features/athlete-unknown/config";

export const STORAGE_KEYS = {
  MOCK_DATA_PLAYER_INDEX_PREFIX: "mockDataPlayerIndex_",
  CURRENT_SESSION_PREFIX: "currentSession_",
  GUEST_STATS_KEY: "guestStats",
} as const;

/**
 * Get the current session key for a specific sport and date
 */
export const getCurrentSessionKey = (
  sport: SportType,
  playDate: string
): string => {
  return `${STORAGE_KEYS.CURRENT_SESSION_PREFIX}${sport}_${playDate}`;
};

/**
 * Get the mock data player index key for a specific sport
 */
export const getMockDataPlayerIndexKey = (sport: string): string => {
  return `${STORAGE_KEYS.MOCK_DATA_PLAYER_INDEX_PREFIX}${sport}`;
};

/**
 * Mid-round progress data structure
 */
export interface MidRoundProgress {
  sport: string;
  playDate: string;
  isCompleted: boolean;
  flippedTiles: TileType[];
  incorrectGuesses: number;
  lastSubmittedGuess: string;
  message: string;
  messageType: string;
  playerName: string;
  previousCloseGuess: string;
  score: number;
}

/**
 * Save mid-round progress to localStorage
 */
export const saveMidRoundProgress = (
  sport: SportType,
  playDate: string,
  progress: MidRoundProgress
): void => {
  try {
    const key = getCurrentSessionKey(sport, playDate);
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error("[Storage] Error saving mid-round progress:", error);
  }
};

/**
 * Load mid-round progress from localStorage
 */
export const loadMidRoundProgress = (
  sport: SportType,
  playDate: string
): MidRoundProgress | null => {
  try {
    const key = getCurrentSessionKey(sport, playDate);
    const data = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data) as MidRoundProgress;
    }
    return null;
  } catch (error) {
    console.error("[Storage] Error loading mid-round progress:", error);
    return null;
  }
};

/**
 * Clear mid-round progress from localStorage
 */
export const clearMidRoundProgress = (
  sport: SportType,
  playDate: string
): void => {
  try {
    const key = getCurrentSessionKey(sport, playDate);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("[Storage] Error clearing mid-round progress:", error);
  }
};

/**
 * Get mock data player index from localStorage
 */
export const getMockDataPlayerIndex = (sport: string): number | null => {
  try {
    const key = getMockDataPlayerIndexKey(sport);
    const data = localStorage.getItem(key);
    if (data) {
      return parseInt(data, 10);
    }
    return null;
  } catch (error) {
    console.error("[Storage] Error loading mock data player index:", error);
    return null;
  }
};

/**
 * Save mock data player index to localStorage
 */
export const saveMockDataPlayerIndex = (
  sport: string,
  index: number
): void => {
  try {
    const key = getMockDataPlayerIndexKey(sport);
    localStorage.setItem(key, index.toString());
  } catch (error) {
    console.error("[Storage] Error saving mock data player index:", error);
  }
};

/**
 * Clear mock data player index from localStorage
 */
export const clearMockDataPlayerIndex = (sport: string): void => {
  try {
    const key = getMockDataPlayerIndexKey(sport);
    localStorage.removeItem(key);
  } catch (error) {
    console.error("[Storage] Error clearing mock data player index:", error);
  }
};
