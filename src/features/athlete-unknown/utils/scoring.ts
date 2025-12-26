/**
 * Scoring utilities for game logic
 * Handles score calculation, rank evaluation, and hint generation
 */

import { SCORING, RANKS } from "@/features/athlete-unknown/config";

export type ScoreAction = "incorrectGuess" | "regularTile" | "photoTile";

/**
 * Calculate new score based on action taken
 */
export const calculateNewScore = (
  currentScore: number,
  action: ScoreAction
): number => {
  switch (action) {
    case "incorrectGuess":
      return currentScore - SCORING.INCORRECT_GUESS_PENALTY;
    case "regularTile":
      return currentScore - SCORING.REGULAR_TILE_PENALTY;
    case "photoTile":
      return currentScore - SCORING.PHOTO_TILE_PENALTY;
    default:
      return currentScore;
  }
};

/**
 * Evaluate player rank based on final score
 */
export const evaluateRank = (points: number): string => {
  if (points >= RANKS.AMAZING.threshold) {
    return RANKS.AMAZING.label;
  }
  if (points >= RANKS.ELITE.threshold) {
    return RANKS.ELITE.label;
  }
  if (points >= RANKS.SOLID.threshold) {
    return RANKS.SOLID.label;
  }
  return "";
};

/**
 * Generate hint (player initials) when score drops below threshold
 */
export const generateHint = (
  newScore: number,
  currentHint: string,
  playerName: string
): string => {
  if (newScore < SCORING.HINT_THRESHOLD && !currentHint) {
    return playerName
      .split(" ")
      .map((w) => w[0])
      .join(".");
  }
  return currentHint;
};
