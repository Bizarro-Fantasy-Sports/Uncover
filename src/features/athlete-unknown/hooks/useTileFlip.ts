/**
 * Tile flip logic hook
 * Handles tile click interactions, photo reveal, and score updates
 */

import { useCallback } from "react";
import type { GameState } from "./useGameState";
import { calculateNewScore } from "@/features/athlete-unknown/utils";
import {
  TILE_NAMES,
  TileType,
  TIMING,
} from "@/features/athlete-unknown/config";

interface UseTileFlipProps {
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
}

export const useTileFlip = ({ state, updateState }: UseTileFlipProps) => {
  const handleTileClick = useCallback(
    (tileName: TileType) => {
      // If photo is already revealed, toggle back to tiles
      if (state.photoRevealed) {
        updateState({ photoRevealed: false, returningFromPhoto: true });
        // Clear the returningFromPhoto flag after animation completes
        setTimeout(() => {
          updateState({ returningFromPhoto: false });
        }, TIMING.PHOTO_FLIP_ANIMATION_DURATION);
        return;
      }

      // If clicking an already-flipped Photo tile, reveal photo again
      if (
        state.flippedTiles.includes(tileName) &&
        tileName === TILE_NAMES.PHOTO
      ) {
        updateState({ photoRevealed: true, returningFromPhoto: false });
        return;
      }

      // If tile is already flipped, do nothing
      if (state.flippedTiles.includes(tileName)) {
        return;
      }

      // Track first and last tiles flipped
      const updatedFlippedTiles = [...state.flippedTiles, tileName];

      // If Photo tile is clicked for the first time, reveal the full segmented photo
      if (tileName === TILE_NAMES.PHOTO) {
        // Only update score/counters if game is not won or gave up
        if (!state.isCompleted) {
          const newScore = calculateNewScore(state.score, tileName);

          updateState({
            flippedTiles: updatedFlippedTiles,
            score: newScore,
            photoRevealed: true,
            returningFromPhoto: false,
          });
        } else {
          // Game won or gave up - just update visual state
          // TODO: need to test!!!!!
          updateState({
            flippedTiles: updatedFlippedTiles,
            photoRevealed: true,
            returningFromPhoto: false,
          });
        }
        return;
      }

      // Regular tile flip
      // Only update score/counters if game is not won or gave up
      if (!state.isCompleted) {
        const newScore = calculateNewScore(state.score, tileName);

        updateState({
          flippedTiles: updatedFlippedTiles,
          score: newScore,
        });
      } else {
        // Game won or gave up - just update visual state
        // TODO: need to test
        updateState({
          flippedTiles: updatedFlippedTiles,
        });
      }
    },
    [state, updateState]
  );

  return {
    handleTileClick,
  };
};
