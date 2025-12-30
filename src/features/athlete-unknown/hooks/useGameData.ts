/**
 * Game data hook
 * Handles data fetching and game result submission
 */

import { useEffect, useCallback } from "react";
import type { SportType } from "@/features/athlete-unknown/config";
import type { GameState } from "./useGameState";
import { gameDataService } from "@/features/athlete-unknown/services";
import { userStatsService } from "@/features/athlete-unknown/services";
import type { GameResult } from "@/features/athlete-unknown/types";
import { getCurrentDateString, getGameSubmissionKey } from "@/features/athlete-unknown/utils";

interface UseGameDataProps {
  activeSport: SportType;
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
  playDate?: string;
}

export const useGameData = ({
  activeSport,
  state,
  updateState,
  playDate,
}: UseGameDataProps) => {
  // Load player data and round stats from API
  useEffect(() => {
    const loadData = async () => {
      try {
        updateState({ isLoading: true, error: null });

        const [roundData, userStatsData] = await Promise.all([
          gameDataService.getRoundData(activeSport, playDate),
          userStatsService.getUserStats(),
        ]);

        updateState({
          round: roundData,
          userStats: userStatsData,
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
  }, [activeSport, playDate]); // Reload when sport or playDate changes

  // Submit game results when player wins
  useEffect(() => {
    const submitResults = async () => {
      // Only submit if game is won and we haven't submitted yet
      if (!state.finalRank || !state.round) {
        return;
      }
      // Get current date in local timezone
      const now = new Date();
      const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const roundPlayDate = state.round.playDate || currentDate;
      // Only submit stats if current date matches the round's playDate
      // This prevents stat submission for playtesting future rounds
      if (currentDate !== roundPlayDate) {
        console.log(
          "[Athlete Unknown] Skipping stats submission - playtesting future round"
        );
        return;
      }
      const submissionKey = getGameSubmissionKey(activeSport, roundPlayDate);
      if (localStorage.getItem(submissionKey)) {
        return; // Already submitted
      }
      try {
        const gameResult: GameResult = {
          userId: "temp_user_123", // TODO: Replace with actual user ID from auth
          sport: activeSport,
          playDate: roundPlayDate,
          playerName: state.round.player.name,
          score: state.score,
          tilesFlipped: state.tilesFlippedCount,
          incorrectGuesses: state.incorrectGuesses,
          flippedTilesPattern: state.flippedTiles,
          firstTileFlipped: state.firstTileFlipped || undefined,
          lastTileFlipped: state.lastTileFlipped || undefined,
          completed: true,
          completedAt: getCurrentDateString(),
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
  }, [
    state.finalRank,
    state.score,
    state.tilesFlippedCount,
    state.incorrectGuesses,
    state.flippedTiles,
    state.firstTileFlipped,
    state.lastTileFlipped,
    activeSport,
  ]);

  const refetchData = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });

      const [roundData, userStatsData] = await Promise.all([
        gameDataService.getRoundData(activeSport, playDate),
        userStatsService.getUserStats(),
      ]);

      updateState({
        round: roundData,
        userStats: userStatsData,
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
  }, [activeSport, updateState, playDate]);

  return {
    refetchData,
  };
};
