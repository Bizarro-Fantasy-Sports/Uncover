/**
 * Core game state management hook
 * Manages game state for all sports and dates, provides update functions
 */

import { useState, useCallback, useEffect } from "react";
import type { PlayerData, Round } from "../types/api";
import type { SportType } from "../config";
import { TOTAL_TILES, SCORING } from "../config";

export interface GameState {
  playersList: PlayerData[] | null;
  round: Round | null;
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
  round: null,
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

export const useGameState = (activeSport: SportType, playDate?: string) => {
  // Key by sport + playDate to ensure each puzzle has its own state
  // If no playDate provided, use today's date so each day gets its own state
  const effectivePlayDate = playDate || new Date().toISOString().split('T')[0];
  const stateKey = `${activeSport}_${effectivePlayDate}`;

  const [gameStates, setGameStates] = useState<Record<string, GameState>>({});

  // Initialize state for current key if it doesn't exist
  useEffect(() => {
    setGameStates((prev) => {
      if (!prev[stateKey]) {
        return {
          ...prev,
          [stateKey]: createInitialState(),
        };
      }
      return prev;
    });
  }, [stateKey]);

  const currentState = gameStates[stateKey] || createInitialState();

  const updateState = useCallback(
    (patch: Partial<GameState>) => {
      setGameStates((prev) => {
        const currentSportState = prev[stateKey] || createInitialState();
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
          [stateKey]: newState,
        };
      });
    },
    [stateKey]
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
