import { useCallback } from "react";
import type { GameState } from "./useGameState";
import { HintType } from "../config";
import { calculateNewScore } from "../utils";

interface UseHintSelectionProps {
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
}

export const useHintSelection = ({
  state,
  updateState,
}: UseHintSelectionProps) => {
  const handleHintClick = useCallback(
    (hintKey: HintType) => {
      // if hint already flipped, do nothing
      if (state.hintsUsed.includes(hintKey)) {
        return;
      }

      const newScore = calculateNewScore(state.score, hintKey);
      const newHintsUsed = [...state.hintsUsed, hintKey];
      updateState({
        score: newScore,
        hintsUsed: newHintsUsed,
      });
    },
    [state, updateState]
  );

  return {
    handleHintClick,
  };
};
