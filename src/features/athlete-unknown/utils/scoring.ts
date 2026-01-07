/**
 * Scoring utilities for game logic
 * Handles score calculation, rank evaluation, and generating player initials
 */

import { SCORING } from "@/features/athlete-unknown/config";
import type { HintType, ScoreAction } from "@/features/athlete-unknown/config";

/**
 * Calculate new score based on action taken
 */
export const calculateNewScore = (
  currentScore: number,
  action: ScoreAction | HintType
): number => {
  switch (action) {
    case "incorrectGuess":
      return currentScore - SCORING.INCORRECT_GUESS_PENALTY;
    case "regularTile":
      return currentScore - SCORING.REGULAR_TILE_PENALTY;
    case "photoTile":
      return currentScore - SCORING.PHOTO_TILE_PENALTY;
    case "initials":
      return currentScore - SCORING.INITIALS_HINT_PENALTY;
    case "nicknames":
      return currentScore - SCORING.NICKNAMES_HINT_PENALTY;
    default:
      return currentScore;
  }
};

/**
 * Generate player initials
 */
export const generateInitials = (playerName: string): string => {
  return playerName
    .split(" ")
    .map((w) => w[0])
    .join(".");
};
