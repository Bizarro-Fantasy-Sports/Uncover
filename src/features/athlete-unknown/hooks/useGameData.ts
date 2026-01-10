/**
 * Game data hook
 * Handles data fetching and game result submission
 */

import { useEffect, useCallback } from "react";
import type { SportType } from "@/features/athlete-unknown/config";
import type { GameState } from "./useGameState";
import { gameDataService } from "@/features/athlete-unknown/services";
import { userStatsService } from "@/features/athlete-unknown/services";
import type {
  Result,
  RoundHistory,
  UserSportStats,
} from "@/features/athlete-unknown/types";
import {
  getCurrentDateString,
  updateGuestStats,
} from "@/features/athlete-unknown/utils";

interface UseGameDataProps {
  activeSport: SportType;
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
  playDate?: string;
  isGuest?: boolean; // Whether the user is a guest (not authenticated)
}

export const useGameData = ({
  activeSport,
  state,
  updateState,
  playDate,
  isGuest = false,
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

        // playDate is undefined if current date. BE normally handles default missing case
        const actualPlayDate = playDate ?? getCurrentDateString();

        const userSportStats: UserSportStats = userStatsData.sports.find(
          (s: UserSportStats) => s.sport === activeSport
        );
        const userHistory = userSportStats?.history ?? [];
        const foundHistoricalRound = userHistory.find(
          (h: RoundHistory) => h.playDate === actualPlayDate
        );
        if (foundHistoricalRound) {
          // User has completed this round before - restore state
          updateState({
            round: roundData,
            userStats: userStatsData,
            isLoading: false,
            error: null,
            score: foundHistoricalRound.score,
            flippedTiles: foundHistoricalRound.flippedTiles,
            flippedTilesUponCompletion: foundHistoricalRound.flippedTiles,
            incorrectGuesses: foundHistoricalRound.incorrectGuesses,
            isCompleted: true,
          });
        } else {
          updateState({
            round: roundData,
            userStats: userStatsData,
            isLoading: false,
            error: null,
          });
        }
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
      if (!state.isCompleted || !state.round) {
        return;
      }
      // Get current date in local timezone
      const currentDate = getCurrentDateString();
      const roundPlayDate = state.round.playDate || currentDate;
      // Prevent stat submission for playtesting future rounds
      if (roundPlayDate > currentDate) {
        console.log(
          "[Athlete Unknown] Skipping stats submission - playtesting future round"
        );
        return;
      }
      try {
        const gameResult: Result = {
          score: state.score,
          isCorrect: state.score > 0,
          flippedTiles: state.flippedTiles,
          incorrectGuesses: state.incorrectGuesses,
        };

        // Update guest stats ONLY if user is not authenticated
        // For authenticated users, stats are managed by the backend
        if (isGuest) {
          console.log(
            "[Athlete Unknown] Updating guest stats for",
            activeSport
          );

          updateGuestStats(activeSport, roundPlayDate, gameResult);
        } else {
          console.log(
            "[Athlete Unknown] Skipping guest stats update - user is authenticated"
          );
        }

        console.log("[Athlete Unknown] Submitting game results:", gameResult);
        const response = await gameDataService.submitGameResults(
          activeSport,
          roundPlayDate,
          gameResult
        );
        console.log(
          "[Athlete Unknown] Successfully submitted results: ",
          response
        );
      } catch (error) {
        console.error("[Athlete Unknown] Failed to submit results:", error);
        // Don't block the user experience if submission fails
      }
    };
    submitResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isCompleted,
    state.score,
    state.incorrectGuesses,
    state.flippedTiles,
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
