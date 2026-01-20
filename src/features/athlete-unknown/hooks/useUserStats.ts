/**
 * User stats hook
 * Handles fetching user stats
 */

import { useCallback } from "react";
import { userStatsService } from "@/features/athlete-unknown/services";
import type { GameState } from "./useGameState";

interface UseUserStatsProps {
  updateState: (patch: Partial<GameState>) => void;
}

export const useUserStats = ({ updateState }: UseUserStatsProps) => {
  const handleFetchUserStats = useCallback(async () => {
    try {
      updateState({ isLoading: true, error: null });

      const userStats = await userStatsService.getUserStats();

      updateState({
        userStats,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      console.log("Error retrieving user stats: ", error);
      updateState({
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve user stats",
        isLoading: false,
      });
    }
  }, [updateState]);

  return {
    handleFetchUserStats,
  };
};
