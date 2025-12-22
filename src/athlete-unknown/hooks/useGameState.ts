/**
 * Core game state management hook
 * Manages game state for all sports and provides update functions
 */

import { useState, useCallback } from "react";
import type { PlayerData, RoundStats } from "../types/api";
import type { SportType } from "../config";
import { TOTAL_TILES, SCORING, SPORTS } from "../config";

export interface GameState {
  playersList: PlayerData[] | null;
  playerData: PlayerData | null;
  roundStats: RoundStats | null;
  playerName: string;
  message: string;
  messageType: string;
  previousCloseGuess: string;
  flippedTiles: boolean[];
  tilesFlippedCount: number;
  photoRevealed: boolean;
  returningFromPhoto: boolean;
  score: number;
  hint: string;
  finalRank: string;
  incorrectGuesses: number;
  showResultsModal: boolean;
  copiedText: string;
  lastSubmittedGuess: string;
  isLoading: boolean;
  error: string | null;
  firstTileFlipped: string | null;
  lastTileFlipped: string | null;
  currentPlayerIndex?: number;
  gaveUp: boolean;
}

const createInitialState = (): GameState => ({
  playersList: null,
  playerData: null,
  roundStats: null,
  playerName: "",
  message: "",
  messageType: "",
  previousCloseGuess: "",
  flippedTiles: Array(TOTAL_TILES).fill(false),
  tilesFlippedCount: 0,
  photoRevealed: false,
  returningFromPhoto: false,
  score: SCORING.INITIAL_SCORE,
  hint: "",
  finalRank: "",
  incorrectGuesses: 0,
  showResultsModal: false,
  copiedText: "",
  lastSubmittedGuess: "",
  isLoading: true,
  error: null,
  firstTileFlipped: null,
  lastTileFlipped: null,
  gaveUp: false,
});

export const useGameState = (activeSport: SportType) => {
  const [gameStates, setGameStates] = useState<Record<SportType, GameState>>({
    [SPORTS.BASEBALL]: createInitialState(),
    [SPORTS.BASKETBALL]: createInitialState(),
    [SPORTS.FOOTBALL]: createInitialState(),
  } as Record<SportType, GameState>);

  const currentState = gameStates[activeSport];

  const updateState = useCallback(
    (patch: Partial<GameState>) => {
      setGameStates((prev) => {
        const currentSportState = prev[activeSport];
        const newState = { ...currentSportState, ...patch };

        // Preserve currentPlayerIndex if not in patch
        if (
          newState.currentPlayerIndex === undefined &&
          currentSportState.currentPlayerIndex !== undefined
        ) {
          newState.currentPlayerIndex = currentSportState.currentPlayerIndex;
        }

        return {
          ...prev,
          [activeSport]: newState,
        };
      });
    },
    [activeSport]
  );

  const resetState = useCallback(() => {
    updateState(createInitialState());
  }, [updateState]);

  return {
    state: currentState,
    updateState,
    resetState,
    allStates: gameStates,
  };
};
