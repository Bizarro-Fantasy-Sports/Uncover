/**
 * Guest session persistence hook
 * Handles auto-saving and loading game state from localStorage
 */

import { useEffect } from "react";
import type { SportType } from "../config";
import type { GameState } from "./useGameState";
import {
  saveGuestSession,
  loadGuestSession,
  clearGuestSession,
  clearAllGuestSessions,
} from "../utils/guestSession";

interface UseGuestSessionProps {
  activeSport: SportType;
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
}

export const useGuestSession = ({
  activeSport,
  state,
  updateState,
}: UseGuestSessionProps) => {
  // Auto-save guest session whenever state changes
  useEffect(() => {
    if (state.playerData) {
      saveGuestSession(activeSport, state, state.currentPlayerIndex);
    }
  }, [activeSport, state]);

  // Load guest session on mount (if player data is available)
  useEffect(() => {
    if (state.playerData && !state.finalRank) {
      const savedSession = loadGuestSession(activeSport, state.playerData.name);
      if (savedSession) {
        updateState(savedSession);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSport, state.playerData?.name]); // Only run when sport or player changes

  return {
    clearSession: () => clearGuestSession(activeSport),
    clearAllSessions: clearAllGuestSessions,
  };
};
