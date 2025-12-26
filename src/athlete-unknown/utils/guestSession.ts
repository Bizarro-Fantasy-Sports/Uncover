/**
 * Guest session persistence utilities
 * Handles saving/loading game state to localStorage for non-authenticated users
 */

import type { SportType } from "../config";
import { SPORT_LIST } from "../config";
import { getGuestSessionKey } from "./storage";
import type { GameState } from "../hooks/useGameState";

/**
 * Save guest session to localStorage
 */
export const saveGuestSession = (
  sport: SportType,
  playDate: string,
  state: GameState,
  playerIndex?: number
): void => {
  try {
    // Only save persistent game state (exclude transient UI state)
    const persistentState = {
      playerName: state.playerName,
      message: state.message,
      messageType: state.messageType,
      previousCloseGuess: state.previousCloseGuess,
      flippedTiles: state.flippedTiles,
      tilesFlippedCount: state.tilesFlippedCount,
      score: state.score,
      hint: state.hint,
      finalRank: state.finalRank,
      incorrectGuesses: state.incorrectGuesses,
      lastSubmittedGuess: state.lastSubmittedGuess,
      firstTileFlipped: state.firstTileFlipped,
      lastTileFlipped: state.lastTileFlipped,
      // Store player data identifier to verify it's the same round
      playerName_saved: state.round?.player?.name || "",
      // Store player index so we can restore the same player
      playerIndex_saved: playerIndex,
    };
    localStorage.setItem(
      getGuestSessionKey(sport, playDate),
      JSON.stringify(persistentState)
    );
  } catch (error) {
    console.error("Failed to save guest session:", error);
  }
};

/**
 * Load guest session from localStorage
 */
export const loadGuestSession = (
  sport: SportType,
  playDate: string,
  currentPlayerName: string
): Partial<GameState> | null => {
  try {
    const saved = localStorage.getItem(getGuestSessionKey(sport, playDate));
    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    // Only restore if it's the same player/round
    if (parsed.playerName_saved !== currentPlayerName) {
      // Different round, clear old session
      clearGuestSession(sport, playDate);
      return null;
    }

    // Return only the game state fields (not the saved player name or index)
    // eslint-disable-next-line no-unused-vars
    const { playerName_saved, playerIndex_saved, ...gameStateFields } = parsed;
    return gameStateFields;
  } catch (error) {
    console.error("Failed to load guest session:", error);
    return null;
  }
};

/**
 * Clear guest session for a specific sport and date
 */
export const clearGuestSession = (sport: SportType, playDate: string): void => {
  try {
    localStorage.removeItem(getGuestSessionKey(sport, playDate));
  } catch (error) {
    console.error("Failed to clear guest session:", error);
  }
};

/**
 * Clear all guest sessions for all sports and dates
 */
export const clearAllGuestSessions = (): void => {
  try {
    // Get all keys from localStorage
    const keys = Object.keys(localStorage);
    // Filter keys that match the guest session prefix
    const guestSessionKeys = keys.filter(key =>
      key.startsWith("guestSession_")
    );
    // Remove all guest session keys
    guestSessionKeys.forEach(key => localStorage.removeItem(key));
  } catch (error) {
    console.error("Failed to clear all guest sessions:", error);
  }
};
