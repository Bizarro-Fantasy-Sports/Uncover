/**
 * LocalStorage key constants
 * Centralized location for all localStorage keys used in the application
 */

import type { SportType } from "../config";

export const STORAGE_KEYS = {
  ACTIVE_SPORT: "activeSport",
  GUEST_SESSION_PREFIX: "guestSession_",
  GAME_SUBMITTED_PREFIX: "submitted_",
} as const;

/**
 * Get the guest session key for a specific sport and date
 */
export const getGuestSessionKey = (sport: SportType, playDate: string): string => {
  return `${STORAGE_KEYS.GUEST_SESSION_PREFIX}${sport}_${playDate}`;
};

/**
 * Get the game submission key for a specific sport and date
 */
export const getGameSubmissionKey = (
  sport: SportType,
  playDate: string
): string => {
  return `${STORAGE_KEYS.GAME_SUBMITTED_PREFIX}${sport}_${playDate}`;
};
