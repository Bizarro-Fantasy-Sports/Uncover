/**
 * Guest User Stats Tracking
 * Manages statistics for guest (non-authenticated) users in localStorage
 */

import type { SportType } from "@/features/athlete-unknown/config";
import type { Result, TileTracker, UserStats, UserSportStats } from "@/features/athlete-unknown/types";
import { STORAGE_KEYS } from "./storage";

/**
 * Create an empty tile tracker
 */
const createEmptyTileTracker = (): TileTracker => ({
  bio: 0,
  playerInformation: 0,
  draftInformation: 0,
  teamsPlayedOn: 0,
  jerseyNumbers: 0,
  careerStats: 0,
  personalAchievements: 0,
  photo: 0,
  yearsActive: 0,
});

/**
 * Create initial stats for a sport
 */
const createInitialSportStats = (sport: SportType): UserSportStats => ({
  sport: sport,
  stats: {
    totalPlays: 0,
    percentageCorrect: 0,
    highestScore: 0,
    averageCorrectScore: 0,
    averageNumberOfTileFlips: 0,
    mostCommonFirstTileFlipped: "",
    mostCommonLastTileFlipped: "",
    mostCommonTileFlipped: "",
    leastCommonTileFlipped: "",
    firstTileFlippedTracker: createEmptyTileTracker(),
    lastTileFlippedTracker: createEmptyTileTracker(),
    mostTileFlippedTracker: createEmptyTileTracker(),
  },
  history: [],
});

/**
 * Load all guest stats from localStorage
 */
export const loadGuestStats = (): UserStats => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.GUEST_STATS_KEY);
    if (data) {
      return JSON.parse(data) as UserStats;
    }
    return {
      userId: "",
      userName: "",
      userCreated: "",
      currentDailyStreak: 0,
      lastDayPlayed: "",
      sports: [createInitialSportStats("baseball"), createInitialSportStats("basketball"), createInitialSportStats("football")]
    };
  } catch (error) {
    console.error("[GuestStats] Error loading guest stats:", error);
    return {
      userId: "",
      userName: "",
      userCreated: "",
      currentDailyStreak: 0,
      lastDayPlayed: "",
      sports: [createInitialSportStats("baseball"), createInitialSportStats("basketball"), createInitialSportStats("football")]
    };
  }
};

/**
 * Save guest stats to localStorage
 */
const saveGuestStats = (stats: UserStats): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.GUEST_STATS_KEY, JSON.stringify(stats));
    console.log("[GuestStats] Saved guest stats to localStorage");
  } catch (error) {
    console.error("[GuestStats] Error saving guest stats:", error);
  }
};

/**
 * Increment a tile in the tracker
 */
const incrementTileTracker = (
  tracker: TileTracker,
  tileName: string
): void => {
  const key = tileName as keyof TileTracker;
  if (key in tracker) {
    tracker[key]++;
  }
};

/**
 * Find the most common tile from a tracker
 */
const findMostCommonTile = (tracker: TileTracker): string => {
  let maxCount = 0;
  let mostCommon = "";

  for (const [tile, count] of Object.entries(tracker)) {
    if (count > maxCount) {
      maxCount = count;
      mostCommon = tile;
    }
  }

  return mostCommon;
};

/**
 * Find the least common tile from a tracker (ignoring zeros)
 */
const findLeastCommonTile = (tracker: TileTracker): string => {
  let minCount = Infinity;
  let leastCommon = "";

  for (const [tile, count] of Object.entries(tracker)) {
    if (count > 0 && count < minCount) {
      minCount = count;
      leastCommon = tile;
    }
  }

  return leastCommon;
};

/**
 * Update guest stats with a new game result
 */
export const updateGuestStats = (sport: SportType, result: Result): void => {
  try {
    console.log("[GuestStats] Updating guest stats for", sport);

    const allStats = loadGuestStats();
    let sportStats = allStats.sports.find((s) => s.sport === sport);

    // Initialize stats for this sport if it doesn't exist
    if (!sportStats) {
      sportStats = createInitialSportStats(sport);
      allStats.sports.push(sportStats);
    }

    // Update total plays
    sportStats.stats.totalPlays++;

    // Update score-related stats
    if (result.isCorrect) {
      // Update average correct score
      const oldTotalCorrectGames =
        Math.round(((sportStats.stats.totalPlays - 1) * sportStats.stats.percentageCorrect) / 100);
      const newTotalCorrectGames = oldTotalCorrectGames + 1;
      const oldTotalCorrectScore =
        sportStats.stats.averageCorrectScore * oldTotalCorrectGames;
      sportStats.stats.averageCorrectScore =
        (oldTotalCorrectScore + result.score) / newTotalCorrectGames;

      // Update percentage correct
      sportStats.stats.percentageCorrect =
        (newTotalCorrectGames / sportStats.stats.totalPlays) * 100;

      // Update highest score
      if (result.score > sportStats.stats.highestScore) {
        sportStats.stats.highestScore = result.score;
      }
    }

    // Update average number of tile flips
    const oldTotalTileFlips =
      sportStats.stats.averageNumberOfTileFlips * (sportStats.stats.totalPlays - 1);
    sportStats.stats.averageNumberOfTileFlips =
      (oldTotalTileFlips + result.tilesFlipped.length) / sportStats.stats.totalPlays;

    // Update tile trackers
    if (result.tilesFlipped.length > 0) {
      // First tile flipped
      const firstTile = result.tilesFlipped[0];
      incrementTileTracker(sportStats.stats.firstTileFlippedTracker, firstTile);

      // Last tile flipped
      const lastTile = result.tilesFlipped[result.tilesFlipped.length - 1];
      incrementTileTracker(sportStats.stats.lastTileFlippedTracker, lastTile);

      // All tiles flipped (most flipped tracker)
      for (const tile of result.tilesFlipped) {
        incrementTileTracker(sportStats.stats.mostTileFlippedTracker, tile);
      }

      // Update most/least common tiles
      sportStats.stats.mostCommonFirstTileFlipped = findMostCommonTile(
        sportStats.stats.firstTileFlippedTracker
      );
      sportStats.stats.mostCommonLastTileFlipped = findMostCommonTile(
        sportStats.stats.lastTileFlippedTracker
      );
      sportStats.stats.mostCommonTileFlipped = findMostCommonTile(
        sportStats.stats.mostTileFlippedTracker
      );
      sportStats.stats.leastCommonTileFlipped = findLeastCommonTile(
        sportStats.stats.mostTileFlippedTracker
      );
    }

    // Save updated stats
    saveGuestStats(allStats);

    console.log("[GuestStats] Updated stats:", sportStats);
  } catch (error) {
    console.error("[GuestStats] Error updating guest stats:", error);
  }
};

/**
 * Clear all guest stats (useful for testing or user reset)
 */
export const clearGuestStats = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.GUEST_STATS_KEY);
    console.log("[GuestStats] Cleared all guest stats");
  } catch (error) {
    console.error("[GuestStats] Error clearing guest stats:", error);
  }
};
