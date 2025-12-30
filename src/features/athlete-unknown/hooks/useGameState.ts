/**
 * Core game state management hook
 * Manages game state for all sports and dates, provides update functions
 */

import { useState, useCallback, useEffect } from "react";
import type {
  PlayerData,
  Round,
  UserStats,
} from "@/features/athlete-unknown/types";
import type { SportType } from "@/features/athlete-unknown/config";
import { TOTAL_TILES, SCORING } from "@/features/athlete-unknown/config";
import {
  loadMidRoundProgress,
  saveMidRoundProgress,
  clearMidRoundProgress,
  type MidRoundProgress,
  getCurrentDateString,
} from "@/features/athlete-unknown/utils";

export interface GameState {
  playersList: PlayerData[] | null;
  round: Round | null;
  userStats: UserStats | null;
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
  userStats: null,
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
  finalRank: state.finalRank,
  firstTileFlipped: state.firstTileFlipped,
  flippedTiles: state.flippedTiles,
  hint: state.hint,
  incorrectGuesses: state.incorrectGuesses,
  lastSubmittedGuess: state.lastSubmittedGuess,
  lastTileFlipped: state.lastTileFlipped,
  message: state.message,
  messageType: state.messageType,
  playerName: state.playerName,
  playerName_saved: state.round?.player?.name || "",
  previousCloseGuess: state.previousCloseGuess,
  score: state.score,
  tilesFlippedCount: state.tilesFlippedCount,
});

/**
 * Convert MidRoundProgress to partial GameState for loading
 */
const progressToGameState = (progress: MidRoundProgress): Partial<GameState> => ({
  finalRank: progress.finalRank,
  firstTileFlipped: progress.firstTileFlipped,
  flippedTiles: progress.flippedTiles,
  hint: progress.hint,
  incorrectGuesses: progress.incorrectGuesses,
  lastSubmittedGuess: progress.lastSubmittedGuess,
  lastTileFlipped: progress.lastTileFlipped,
  message: progress.message,
  messageType: progress.messageType,
  playerName: progress.playerName,
  previousCloseGuess: progress.previousCloseGuess,
  score: progress.score,
  tilesFlippedCount: progress.tilesFlippedCount,
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
        if (!newState.showResultsModal) {
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

  return {
    state: currentState,
    updateState,
    resetState,
    clearProgress,
    allStates: gameStates,
  };
};
