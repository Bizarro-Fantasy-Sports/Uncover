/**
 * Share results hook
 * Handles sharing game results to clipboard
 */

import { useCallback } from "react";
import type { GameState } from "./useGameState";
import { TOTAL_TILES, PHOTO_GRID, TIMING } from "../config";

interface UseShareResultsProps {
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
}

export const useShareResults = ({
  state,
  updateState,
}: UseShareResultsProps) => {
  const handleShare = useCallback(() => {
    // Get daily number from playerData or default to 1
    const dailyNumber = state.playerData!.dailyNumber || 1;

    // Build the share text
    let shareText = `Daily Athlete Unknown #${dailyNumber}\n`;

    // Create a 3x3 grid using emojis
    for (let i = 0; i < TOTAL_TILES; i++) {
      // Yellow emoji for flipped, blue emoji for unflipped
      shareText += state.flippedTiles[i] ? "🟨" : "🟦";
      // Add newline after every 3 tiles (end of row)
      if ((i + 1) % PHOTO_GRID.COLS === 0) {
        shareText += "\n";
      }
    }

    // Add score at the end
    shareText += `Score: ${state.score}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        // Show what was copied
        updateState({ copiedText: shareText });
        // Clear the message after 3 seconds
        setTimeout(() => {
          updateState({ copiedText: "" });
        }, TIMING.SHARE_COPIED_MESSAGE_DURATION);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  }, [state, updateState]);

  return {
    handleShare,
  };
};
