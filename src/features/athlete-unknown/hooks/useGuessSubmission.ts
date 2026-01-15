/**
 * Guess submission hook
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

interface UseGuessSubmissionProps {
  state: GameState;
  updateState: (patch: Partial<GameState>) => void;
}

export const useGuessSubmission = ({
  state,
  updateState,
}: UseGuessSubmissionProps) => {
  const handleNameSubmit = useCallback(() => {
    // Don't allow empty guesses
    if (!state.playerName.trim()) {
      return;
    }

    const normalizedGuess = normalize(state.playerName);
    const normalizedAnswer = normalize(state.round?.player.name);

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
        flippedTilesUponCompletion: [...state.flippedTiles],
        lastSubmittedGuess: normalizedGuess,
      });
      return;
    }

    // Incorrect guess - deduct points
    const newScore = calculateNewScore(state.score, INCORRECT_GUESS);
    const distance = calculateLevenshteinDistance(
      normalizedGuess,
      normalizedAnswer
    );

    // Check if guess was very close
    if (distance <= GUESS_ACCURACY.VERY_CLOSE_DISTANCE) {
      if (!state.previousCloseGuess) {
        // First close guess
        updateState({
          message: `You're close! Spelling is off by a ${distance} letter${distance === 1 ? "" : "s"}.`,
          messageType: "almost",
          previousCloseGuess: normalizedGuess,
          score: newScore,
          lastSubmittedGuess: normalizedGuess,
        });
        return;
      }

      const previousDistance = calculateLevenshteinDistance(
        state.previousCloseGuess,
        normalizedAnswer
      );
      // If second closer guess, reveal answer
      if (distance < previousDistance) {
        updateState({
          message: "Spelling accepted",
          messageType: "success",
          previousCloseGuess: "",
          score: newScore,
          lastSubmittedGuess: normalizedGuess,
          isCompleted: true,
          flippedTilesUponCompletion: [...state.flippedTiles],
        });
        return;
      }
    }

    // Wrong guess - not close
    updateState({
      message: `Incorrect: "${state.playerName}"`,
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
      flippedTilesUponCompletion: [...state.flippedTiles],
    });
  }, [state, updateState]);

  return {
    handleNameSubmit,
    handleGiveUp,
  };
};
