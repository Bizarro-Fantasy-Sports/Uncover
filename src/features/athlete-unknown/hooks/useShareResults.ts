/**
 * Share results hook
 * Handles sharing game results to clipboard
 */

import { useCallback } from "react";
import type { GameState } from "./useGameState";
import {
  PHOTO_GRID,
  TIMING,
  TILES,
  ALL_TILES,
} from "@/features/athlete-unknown/config";

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
    const roundId = state.round?.roundId ?? "";
    const [sport, roundNumber] = roundId.split("#");

    // Build the share text
    // TODO. Nicer title
    let shareText = `Athlete Unknown ${sport} #${roundNumber}\n`;

    // first tile is whether round is won or given up
    const isRoundWon = state.score > 0;
    const correctOrIncorrectEmoji = isRoundWon ? "✅" : "❌";
    shareText += correctOrIncorrectEmoji;

    for (let i = 0; i < ALL_TILES.length; i++) {
      const tileName = ALL_TILES[i];
      const tile = TILES[tileName];
      const isFlipped = state.flippedTiles.includes(tileName);
      const emoji = isFlipped ? tile.flippedEmoji : "🟦";
      shareText += emoji;

      const shareIndex = i + 2; // +1 for first inserted tile, +1 for starting at 0 before modulus
      if (shareIndex % PHOTO_GRID.COLS === 0) {
        shareText += "\n";
      }
    }

    // Add score at the end if won round
    if (isRoundWon) {
      shareText += `Score: ${state.score}`;
    }

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
