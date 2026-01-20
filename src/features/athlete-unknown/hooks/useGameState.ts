/**
 * Core game state management hook
 * Manages game state for all sports and dates, provides update functions
 */

import { useState, useCallback, useEffect } from "react";
import type {
  Round,
  RoundSummary,
  UserStats,
} from "@/features/athlete-unknown/types";
import type { SportType, TileType } from "@/features/athlete-unknown/config";
import { INITIAL_SCORE } from "@/features/athlete-unknown/config";
import {
  loadMidRoundProgress,
  saveMidRoundProgress,
  clearMidRoundProgress,
  type MidRoundProgress,
  getCurrentDateString,
  clearMockDataPlayerIndex,
} from "@/features/athlete-unknown/utils";

export interface GameState {
  round: Round | null;
  userStats: UserStats | null;
  playerName: string;
  message: string;
  messageType: string;
  previousCloseGuess: string;
  flippedTiles: TileType[];
  flippedTilesUponCompletion: TileType[];
  photoRevealed: boolean;
  returningFromPhoto: boolean;
  score: number;
  isCompleted: boolean;
  incorrectGuesses: number;
  copiedText: string;
  lastSubmittedGuess: string;
  isLoading: boolean;
  error: string | null;
  currentPlayerIndex?: number;
  roundHistory: RoundSummary[];
}

const createInitialState = (): GameState => ({
  round: null,
  userStats: null,
  playerName: "",
  message: "",
  messageType: "",
  previousCloseGuess: "",
  flippedTiles: [],
  flippedTilesUponCompletion: [],
  photoRevealed: false,
  returningFromPhoto: false,
  score: INITIAL_SCORE,
  isCompleted: false,
  incorrectGuesses: 0,
  copiedText: "",
  lastSubmittedGuess: "",
  isLoading: true,
  error: null,
  roundHistory: [],
});

/**
 * Convert GameState to MidRoundProgress for localStorage
 */
const gameStateToProgress = (
  state: GameState,
  sport: SportType,
  playDate: string
): MidRoundProgress => ({
  sport,
  playDate,
  isCompleted: state.isCompleted,
  flippedTiles: state.flippedTiles,
  incorrectGuesses: state.incorrectGuesses,
  lastSubmittedGuess: state.lastSubmittedGuess,
  message: state.message,
  messageType: state.messageType,
  playerName: state.playerName,
  previousCloseGuess: state.previousCloseGuess,
  score: state.score,
});

/**
 * Convert MidRoundProgress to partial GameState for loading
 */
const progressToGameState = (
  progress: MidRoundProgress
): Partial<GameState> => ({
  isCompleted: progress.isCompleted,
  flippedTiles: progress.flippedTiles,
  incorrectGuesses: progress.incorrectGuesses,
  lastSubmittedGuess: progress.lastSubmittedGuess,
  message: progress.message,
  messageType: progress.messageType,
  playerName: progress.playerName,
  previousCloseGuess: progress.previousCloseGuess,
  score: progress.score,
});

export const useGameState = (activeSport: SportType, playDate?: string) => {
  // Key by sport + playDate to ensure each puzzle has its own state
  // If no playDate provided, use today's date so each day gets its own state
  const effectivePlayDate = playDate || getCurrentDateString();
  const stateKey = `${activeSport}_${effectivePlayDate}`;

  const [gameStates, setGameStates] = useState<Record<string, GameState>>({});

  // Initialize state for current key if it doesn't exist
  // Load from localStorage if available
  useEffect(() => {
    setGameStates((prev) => {
      if (!prev[stateKey]) {
        // Try to load saved progress from localStorage
        const savedProgress = loadMidRoundProgress(
          activeSport,
          effectivePlayDate
        );

        if (savedProgress) {
          console.log(
            `[useGameState] Loading saved progress for ${activeSport} on ${effectivePlayDate}`
          );
          const initialState = createInitialState();
          const restoredState = {
            ...initialState,
            ...progressToGameState(savedProgress),
          };
          return {
            ...prev,
            [stateKey]: restoredState,
          };
        }

        return {
          ...prev,
          [stateKey]: createInitialState(),
        };
      }
      return prev;
    });
  }, [stateKey, activeSport, effectivePlayDate]);

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

        // Save progress to localStorage after state update
        // Only save if the game is in progress (not showing results and not completed)
        if (!newState.isCompleted) {
          const progress = gameStateToProgress(
            newState,
            activeSport,
            effectivePlayDate
          );
          saveMidRoundProgress(activeSport, effectivePlayDate, progress);
        }

        return {
          ...prev,
          [stateKey]: newState,
        };
      });
    },
    [stateKey, activeSport, effectivePlayDate]
  );

  const resetState = useCallback(() => {
    updateState(createInitialState());
  }, [updateState]);

  const clearProgress = useCallback(() => {
    clearMidRoundProgress(activeSport, effectivePlayDate);
    console.log(
      `[useGameState] Cleared saved progress for ${activeSport} on ${effectivePlayDate}`
    );
  }, [activeSport, effectivePlayDate]);

  const clearMockData = useCallback(() => {
    clearMockDataPlayerIndex(activeSport);
    console.log(
      `[useGameState] Cleared saved mock data player index for ${activeSport}`
    );
  }, [activeSport]);

  return {
    state: currentState,
    updateState,
    resetState,
    clearProgress,
    clearMockData,
    allStates: gameStates,
  };
};
