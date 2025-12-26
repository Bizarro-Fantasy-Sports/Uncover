/**
 * Game logic hook
 * Handles name submission validation, guess checking, and give up functionality
 */

import { useCallback } from "react";
import type { GameState } from "./useGameState";
import {
  evaluateRank,
  generateHint,
  calculateNewScore,
  normalize,
  calculateLevenshteinDistance,
} from "@/features/athlete-unknown/utils";
import { GUESS_ACCURACY } from "@/features/athlete-unknown/config";

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

    // If game is already won, only allow reopening modal with correct answer
    if (state.finalRank) {
      if (normalizedGuess === normalizedAnswer) {
        updateState({ showResultsModal: true });
      }
      return;
    }

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
      const rank = evaluateRank(state.score);
      updateState({
        message: "You guessed it right!",
        messageType: "success",
        previousCloseGuess: "",
        finalRank: rank,
        hint: "",
        showResultsModal: true,
        lastSubmittedGuess: normalizedGuess,
      });
      return;
    }

    // Incorrect guess - deduct points
    const newScore = calculateNewScore(state.score, "incorrectGuess");
    const newHint = generateHint(
      newScore,
      state.hint,
      state.round?.player.name || ""
    );

    // Check if guess was very close
    if (distance <= GUESS_ACCURACY.VERY_CLOSE_DISTANCE) {
      // If second close guess, reveal answer
      if (
        state.previousCloseGuess &&
        state.previousCloseGuess !== normalizedGuess
      ) {
        const rank = evaluateRank(newScore);
        updateState({
          message: `Correct, you were close! Player's name: ${state.round?.player.name || ""}`,
          messageType: "close",
          previousCloseGuess: "",
          score: newScore,
          hint: newHint,
          lastSubmittedGuess: normalizedGuess,
          finalRank: rank,
          showResultsModal: true,
        });
      } else {
        // First close guess
        updateState({
          message: "You're close! Off by a few letters.",
          messageType: "almost",
          previousCloseGuess: normalizedGuess,
          score: newScore,
          hint: newHint,
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
      hint: newHint,
      incorrectGuesses: state.incorrectGuesses + 1,
      lastSubmittedGuess: normalizedGuess,
    });
  }, [state, updateState]);

  const handleGiveUp = useCallback(() => {
    updateState({
      gaveUp: true,
      finalRank: "",
      showResultsModal: true,
    });
  }, [updateState]);

  return {
    handleNameSubmit,
    handleGiveUp,
  };
};
