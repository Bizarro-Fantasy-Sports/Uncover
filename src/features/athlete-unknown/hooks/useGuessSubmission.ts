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
  GUESS_MESSAGE_TYPE,
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

    const normalizedGuesseses = normalize(state.playerName);
    const normalizedAnswer = normalize(state.round?.player.name);

    // Prevent submitting the same incorrect guess consecutively
    if (
      normalizedGuesseses !== normalizedAnswer &&
      state.lastSubmittedGuess &&
      normalizedGuesseses === state.lastSubmittedGuess
    ) {
      return;
    }

    // Correct answer - player wins!
    if (normalizedGuesseses === normalizedAnswer) {
      updateState({
        message: "You guessed it right!",
        messageType: GUESS_MESSAGE_TYPE.SUCCESS,
        previousGuesses: [...state.previousGuesses, state.playerName],
        previousCloseGuess: "",
        isCompleted: true,
        flippedTilesUponCompletion: [...state.flippedTiles],
        lastSubmittedGuess: normalizedGuesseses,
      });
      return;
    }

    // Incorrect guess - deduct points
    const newScore = calculateNewScore(state.score, INCORRECT_GUESS);
    const distance = calculateLevenshteinDistance(
      normalizedGuesseses,
      normalizedAnswer
    );

    // Check if guess was very close
    if (distance <= GUESS_ACCURACY.VERY_CLOSE_DISTANCE) {
      if (!state.previousCloseGuess) {
        // First close guess
        updateState({
          message: `Spelling is off by a ${distance} letter${distance === 1 ? "" : "s"}.`,
          messageType: GUESS_MESSAGE_TYPE.ALMOST,
          previousGuesses: [...state.previousGuesses, state.playerName],
          previousCloseGuess: normalizedGuesseses,
          score: newScore,
          lastSubmittedGuess: normalizedGuesseses,
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
          messageType: GUESS_MESSAGE_TYPE.SUCCESS,
          previousGuesses: [...state.previousGuesses, normalizedGuesseses],
          previousCloseGuess: "",
          score: newScore,
          lastSubmittedGuess: normalizedGuesseses,
          isCompleted: true,
          flippedTilesUponCompletion: [...state.flippedTiles],
        });
        return;
      }
    }

    // Wrong guess - not close
    updateState({
      message: `Incorrect: "${state.playerName}"`,
      messageType: GUESS_MESSAGE_TYPE.ERROR,
      previousGuesses: [...state.previousGuesses, state.playerName],
      score: newScore,
      incorrectGuesses: state.incorrectGuesses + 1,
      lastSubmittedGuess: normalizedGuesseses,
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
