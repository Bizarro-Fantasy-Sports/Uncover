/**
 * Tile flip logic hook
 * Handles tile click interactions, photo reveal, and score updates
 */

import { useCallback } from "react";
import type { GameState } from "./useGameState";
import { generateHint, calculateNewScore } from "../utils/scoring";
import { TILE_NAMES, TIMING } from "../config";

interface UseTileFlipProps {
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
}

export const useTileFlip = ({ state, updateState }: UseTileFlipProps) => {
  const handleTileClick = useCallback(
    (index: number) => {
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
      if (state.flippedTiles[index] && TILE_NAMES[index] === "photo") {
        updateState({ photoRevealed: true, returningFromPhoto: false });
        return;
      }

      // If tile is already flipped, do nothing
      if (state.flippedTiles[index]) {
        return;
      }

      // Track first and last tiles flipped
      const tileName = TILE_NAMES[index];
      const isFirstTile = state.tilesFlippedCount === 0;
      const firstTile = isFirstTile ? tileName : state.firstTileFlipped;

      const updated = [...state.flippedTiles];
      updated[index] = true;

      // If Photo tile is clicked for the first time, reveal the full segmented photo
      if (TILE_NAMES[index] === "photo") {
        // Only update score/counters if game is not won or gave up
        if (!state.finalRank && !state.gaveUp) {
          const newScore = calculateNewScore(state.score, "photoTile");
          const newHint = generateHint(
            newScore,
            state.hint,
            state.round?.player.name!
          );

          updateState({
            flippedTiles: updated,
            tilesFlippedCount: state.tilesFlippedCount + 1,
            score: newScore,
            hint: newHint,
            photoRevealed: true,
            returningFromPhoto: false,
            firstTileFlipped: firstTile,
            lastTileFlipped: tileName,
          });
        } else {
          // Game won or gave up - just update visual state
          updateState({
            flippedTiles: updated,
            photoRevealed: true,
            returningFromPhoto: false,
          });
        }
        return;
      }

      // Regular tile flip
      // Only update score/counters if game is not won or gave up
      if (!state.finalRank && !state.gaveUp) {
        const newScore = calculateNewScore(state.score, "regularTile");
        const newHint = generateHint(
          newScore,
          state.hint,
          state.round?.player.name!
        );

        updateState({
          flippedTiles: updated,
          tilesFlippedCount: state.tilesFlippedCount + 1,
          score: newScore,
          hint: newHint,
          firstTileFlipped: firstTile,
          lastTileFlipped: tileName,
        });
      } else {
        // Game won or gave up - just update visual state
        updateState({
          flippedTiles: updated,
        });
      }
    },
    [state, updateState]
  );

  return {
    handleTileClick,
  };
};
