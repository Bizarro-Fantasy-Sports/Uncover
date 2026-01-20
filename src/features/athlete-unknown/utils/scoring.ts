/**
 * Scoring utilities for game logic
 * Handles score calculation, rank evaluation, and generating player initials
 */

import {
  INCORRECT_GUESS,
  INCORRECT_GUESS_PENALTY,
  TILES,
} from "@/features/athlete-unknown/config";
import type { ScoreDeduction } from "@/features/athlete-unknown/config";

/**
 * Calculate new score based on action taken
 */
export const calculateNewScore = (
  currentScore: number,
  deduction: ScoreDeduction
): number => {
  const pointPenalty =
    deduction === INCORRECT_GUESS
      ? INCORRECT_GUESS_PENALTY
      : TILES[deduction].penalty;

  return currentScore - pointPenalty;
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
