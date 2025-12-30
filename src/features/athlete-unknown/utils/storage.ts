/**
 * LocalStorage key constants
 * Centralized location for all localStorage keys used in the application
 */

import type { SportType } from "@/features/athlete-unknown/config";

export const STORAGE_KEYS = {
  ACTIVE_SPORT: "activeSport",
  GAME_SUBMITTED_PREFIX: "submitted_",
  PLAYER_INDEX_PREFIX: "playerIndex_",
  CURRENT_SESSION_PREFIX: "currentSession_",
} as const;

/**
 * Get the game submission key for a specific sport and date
 */
export const getGameSubmissionKey = (
  sport: SportType,
  playDate: string
): string => {
  return `${STORAGE_KEYS.GAME_SUBMITTED_PREFIX}${sport}_${playDate}`;
};

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
 * Mid-round progress data structure
 */
export interface MidRoundProgress {
  sport: string;
  playDate: string;
  finalRank: string;
  firstTileFlipped: string | null;
  flippedTiles: boolean[];
  hint: string;
  incorrectGuesses: number;
  lastSubmittedGuess: string;
  lastTileFlipped: string | null;
  message: string;
  messageType: string;
  playerName: string;
  playerName_saved: string;
  previousCloseGuess: string;
  score: number;
  tilesFlippedCount: number;
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
