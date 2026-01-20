/**
 * Stats Migration Service
 * Handles migration of user stats from localStorage to backend after first login
 */

import { athleteUnknownApiService } from "./api";
import {
  getCurrentDateString,
  loadGuestStats,
  clearGuestStats,
} from "@/features/athlete-unknown/utils";

/**
 * Check if user has any guest stats in localStorage
 */
export const hasGuestStats = (): boolean => {
  try {
    const stats = loadGuestStats();

    // Check if there are any actual game plays (not just empty initial stats)
    const hasSomeData = stats.sports.some(
      (sport) => sport.stats.totalPlays > 0
    );

    return hasSomeData;
  } catch (error) {
    console.error("[StatsMigration] Error checking for guest stats:", error);
    return false;
  }
};

/**
 * Migrate user stats from localStorage to backend
 * This is called after user's first login
 *
 * @returns true if migration was successful or user already migrated, false if failed
 */
export const migrateUserStats = async (
  userId: string | undefined,
  userName: string | undefined
): Promise<boolean> => {
  try {
    console.log("[StatsMigration] Checking for stats to migrate");

    // Check if there are any guest stats to migrate
    if (!hasGuestStats()) {
      console.log("[StatsMigration] No guest stats found to migrate");
      clearGuestStats(); // Clear any empty stats structure
      return true;
    }

    // Load the guest stats
    const guestStats = loadGuestStats();
    console.log("[StatsMigration] Found guest stats to migrate:", guestStats);

    try {
      // Attempt to migrate stats to backend
      guestStats.userId = userId ?? "";
      guestStats.userName = userName ?? "";
      guestStats.userCreated = new Date().toISOString();
      guestStats.lastDayPlayed = getCurrentDateString();
      guestStats.currentDailyStreak = 1;
      await athleteUnknownApiService.migrateUserStats(guestStats);

      console.log("[StatsMigration] Successfully migrated stats to backend");

      // Clear localStorage on successful migration
      clearGuestStats();
      console.log("[StatsMigration] Cleared guest stats from localStorage");

      return true;
    } catch (error: any) {
      // Handle 409 Conflict (user already migrated)
      if (error?.message === "USER_ALREADY_MIGRATED") {
        console.log(
          "[StatsMigration] User already migrated, clearing localStorage"
        );
        clearGuestStats();
        return true;
      }

      // For other errors, don't clear localStorage (user can try again later)
      console.error("[StatsMigration] Failed to migrate stats:", error);
      return false;
    }
  } catch (error) {
    console.error("[StatsMigration] Unexpected error during migration:", error);
    return false;
  }
};
