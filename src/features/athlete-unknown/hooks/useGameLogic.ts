/**
 * Game logic hook
 * Handles name submission validation, guess checking, and give up functionality
 */

import { useCallback } from "react";
import type { GameState } from "./useGameState";
import {
  calculateNewScore,
  normalize,
  calculateLevenshteinDistance,
} from "@/features/athlete-unknown/utils";
import {
  GUESS_ACCURACY,
  INCORRECT_GUESS,
} from "@/features/athlete-unknown/config";

interface UseGameLogicProps {
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
}

export const useGameLogic = ({ state, updateState }: UseGameLogicProps) => {
  const handleNameSubmit = useCallback(() => {
    // Don't allow empty guesses
    if (!state.playerName.trim()) {
      return;
    }

    const normalizedGuess = normalize(state.playerName);
    const normalizedAnswer = normalize(state.round?.player.name);
    const distance = calculateLevenshteinDistance(
      normalizedGuess,
      normalizedAnswer
    );

    // Prevent submitting the same incorrect guess consecutively
    if (
      normalizedGuess !== normalizedAnswer &&
      state.lastSubmittedGuess &&
      normalizedGuess === state.lastSubmittedGuess
    ) {
      return;
    }

    // Correct answer - player wins!
    if (normalizedGuess === normalizedAnswer) {
      updateState({
        message: "You guessed it right!",
        messageType: "success",
        previousCloseGuess: "",
        isCompleted: true,
        lastSubmittedGuess: normalizedGuess,
      });
      return;
    }

    // Incorrect guess - deduct points
    const newScore = calculateNewScore(state.score, INCORRECT_GUESS);

    // TODO: only accept if the distance is less than previous. Specify distance away
    // Check if guess was very close
    if (distance <= GUESS_ACCURACY.VERY_CLOSE_DISTANCE) {
      // If second close guess, reveal answer
      if (
        state.previousCloseGuess &&
        state.previousCloseGuess !== normalizedGuess
      ) {
        updateState({
          message: `Correct, you were close! Player's name: ${state.round?.player.name || ""}`,
          messageType: "close",
          previousCloseGuess: "",
          score: newScore,
          lastSubmittedGuess: normalizedGuess,
          isCompleted: true,
        });
      } else {
        // First close guess
        updateState({
          message: "You're close! Off by a few letters.",
          messageType: "almost",
          previousCloseGuess: normalizedGuess,
          score: newScore,
          lastSubmittedGuess: normalizedGuess,
        });
      }
      return;
    }

    // Wrong guess - not close
    updateState({
      message: `Wrong guess: "${state.playerName}"`,
      messageType: "error",
      score: newScore,
      incorrectGuesses: state.incorrectGuesses + 1,
      lastSubmittedGuess: normalizedGuess,
    });
  }, [state, updateState]);

  const handleGiveUp = useCallback(() => {
    updateState({
      isCompleted: true,
      score: 0,
    });
  }, [updateState]);

  return {
    handleNameSubmit,
    handleGiveUp,
  };
};
