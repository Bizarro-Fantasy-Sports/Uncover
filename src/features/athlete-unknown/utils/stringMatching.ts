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
 * Normalize string for comparison (lowercase, remove whitespace)
 */
export const normalize = (str = ""): string =>
  str.toLowerCase().replace(/\s/g, "");

/**
 * Extract the round number from a roundId
 * @param roundId - The round identifier (e.g., "baseball223")
 * @returns The round number (e.g., 223)
 */
export const extractRoundNumber = (roundId: string): number => {
  const match = roundId.match(/\d+$/);
  return match ? parseInt(match[0], 10) : 1;
};
