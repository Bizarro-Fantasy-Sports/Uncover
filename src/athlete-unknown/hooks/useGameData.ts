/**
 * Game data hook
 * Handles data fetching and game result submission
 */

import { useEffect, useCallback } from "react";
import type { SportType } from "../config";
import type { GameState } from "./useGameState";
import gameDataService from "../services/gameData";
import type { GameResult } from "../types/api";
import { getGameSubmissionKey } from "../utils/storage";

interface UseGameDataProps {
  activeSport: SportType;
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
}

export const useGameData = ({
  activeSport,
  state,
  updateState,
}: UseGameDataProps) => {
  // Load player data and round stats from API
  useEffect(() => {
    // Already loaded - do nothing
    if (state.round) {
      return;
    }

    const loadData = async () => {
      try {
        updateState({ isLoading: true, error: null });

        // const testPlayDate = "???";
        const roundData = await gameDataService.getRoundData(
          activeSport,
          undefined // until a testPlayDate can be inserted from FE to BE
        );

        updateState({
          round: roundData,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error loading game data:", error);
        updateState({
          error:
            error instanceof Error ? error.message : "Failed to load game data",
          isLoading: false,
        });
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSport]); // state intentionally excluded to prevent infinite re-renders

  // Submit game results when player wins
  useEffect(() => {
    const submitResults = async () => {
      // Only submit if game is won and we haven't submitted yet
      if (!state.finalRank || !state.round) {
        return;
      }

      // Check if already submitted
      const playDate = (state.round.playDate ||
        new Date().toISOString().split("T")[0]) as string;

      const submissionKey = getGameSubmissionKey(activeSport, playDate);
      if (localStorage.getItem(submissionKey)) {
        return; // Already submitted
      }

      try {
        const gameResult: GameResult = {
          userId: "temp_user_123", // TODO: Replace with actual user ID from auth
          sport: activeSport,
          playDate,
          playerName: state.round.player.name,
          score: state.score,
          tilesFlipped: state.tilesFlippedCount,
          incorrectGuesses: state.incorrectGuesses,
          flippedTilesPattern: state.flippedTiles,
          firstTileFlipped: state.firstTileFlipped || undefined,
          lastTileFlipped: state.lastTileFlipped || undefined,
          completed: true,
          completedAt: new Date().toISOString(),
          rank: state.finalRank,
        };

        console.log("[Athlete Unknown] Submitting game results:", gameResult);
        const response = await gameDataService.submitGameResults(gameResult);

        if (response?.success) {
          console.log("[Athlete Unknown] Results submitted successfully");
          localStorage.setItem(submissionKey, "true");
        }
      } catch (error) {
        console.error("[Athlete Unknown] Failed to submit results:", error);
        // Don't block the user experience if submission fails
      }
    };

    submitResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.finalRank, activeSport]);

  const refetchData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });

      // const testPlayDate = "???";
      const roundData = await gameDataService.getRoundData(
        activeSport,
        undefined // until a testPlayDate can be inserted from FE to BE
      );

      updateState({
        round: roundData,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.error("Error refetching game data:", error);
      updateState({
        error:
          error instanceof Error ? error.message : "Failed to load game data",
        isLoading: false,
      });
    }
  }, [activeSport, updateState]);

  return {
    refetchData,
  };
};
