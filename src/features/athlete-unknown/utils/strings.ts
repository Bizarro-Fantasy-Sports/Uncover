import {
  SPORT_BASEBALL,
  SPORT_BASKETBALL,
  SPORT_FOOTBALL,
  SportType,
} from "@/features/athlete-unknown/config";

/**
 * String matching utilities for game logic
 * Includes Levenshtein distance calculation and string normalization
 */

/**
 * Calculate Levenshtein distance between two strings
 * (edit distance - minimum number of single-character edits)
 */
export const calculateLevenshteinDistance = (a: string, b: string): number => {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }

  return dp[a.length][b.length];
};

/**
 * Normalize string for comparison
 * lowercase, remove whitespace, apostrophes, hyphens, and periods
 */
export const normalize = (str = ""): string =>
  str
    .toLowerCase()
    .replace(/\s/g, "")
    .replaceAll("'", "")
    .replaceAll("-", "")
    .replaceAll(".", "");

/**
 * Type guard to check if a value is a valid SportType
 */
export const isValidSportType = (value: unknown): value is SportType => {
  return (
    value === SPORT_BASEBALL ||
    value === SPORT_BASKETBALL ||
    value === SPORT_FOOTBALL
  );
};

/**
 * Validates sport parameter and returns valid SportType or uses provided fallback
 * @param sportParam string from URL param
 * @param fallback fallback SportType (defaults to SPORT_BASEBALL if not provided)
 * @returns validated SportType
 */
export const getValidSport = (
  sportParam: string | undefined,
  fallback: SportType = SPORT_BASEBALL
): SportType => {
  if (isValidSportType(sportParam)) {
    return sportParam;
  }
  return fallback;
};

export const getSportEmoji = (sport: SportType): string => {
  return sport === SPORT_BASEBALL
    ? "⚾"
    : sport === SPORT_BASKETBALL
      ? "🏀"
      : sport === SPORT_FOOTBALL
        ? "🏈"
        : "";
};
