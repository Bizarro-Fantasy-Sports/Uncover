/**
 * Application Configuration
 * Central location for all configurable values used throughout the application.
 * This makes it easy to adjust game mechanics, UI settings, and other parameters
 * without hunting through the codebase.
 */

// ============================================================================
// SPORT CONFIGURATION
// ============================================================================

export type SportType = "baseball" | "basketball" | "football";

export const SPORTS = {
  BASEBALL: "baseball" as SportType,
  BASKETBALL: "basketball" as SportType,
  FOOTBALL: "football" as SportType,
} as const;

export const SPORT_LIST: SportType[] = [
  SPORTS.BASEBALL,
  SPORTS.BASKETBALL,
  SPORTS.FOOTBALL,
];

export const DEFAULT_SPORT: SportType = SPORTS.BASEBALL;

// ============================================================================
// EXTERNAL REFERENCE URLS
// ============================================================================

export const REFERENCE_URLS = {
  BASEBALL_WAR: "https://www.baseball-reference.com/about/war_explained.shtml",
  BASKETBALL_BPM: "https://www.basketball-reference.com/about/bpm2.html",
  FOOTBALL_AV:
    "https://www.pro-football-reference.com/about/approximate_value.htm",
} as const;

// ============================================================================
// SCORING CONFIGURATION
// ============================================================================

export const SCORING = {
  // Initial score when game starts
  INITIAL_SCORE: 100,

  // Points deducted for an incorrect guess
  INCORRECT_GUESS_PENALTY: 2,

  // Points deducted for flipping a regular tile
  REGULAR_TILE_PENALTY: 3,

  // Points deducted for flipping the photo tile
  PHOTO_TILE_PENALTY: 6,

  // Score threshold below which a hint (player initials) is shown
  HINT_THRESHOLD: 70,
} as const;

// ============================================================================
// RANK THRESHOLDS
// ============================================================================

export const RANKS = {
  AMAZING: {
    threshold: 95,
    label: "Amazing",
  },
  ELITE: {
    threshold: 90,
    label: "Elite",
  },
  SOLID: {
    threshold: 80,
    label: "Solid",
  },
} as const;

// ============================================================================
// GUESS ACCURACY (LEVENSHTEIN DISTANCE)
// ============================================================================

export const GUESS_ACCURACY = {
  // Maximum edit distance for "close" guess (requires second close guess to reveal player name)
  VERY_CLOSE_DISTANCE: 3,
} as const;

// ============================================================================
// UI/UX TIMING
// ============================================================================

export const TIMING = {
  // Duration of photo flip animation in milliseconds
  PHOTO_FLIP_ANIMATION_DURATION: 650,

  // How long to show the "copied to clipboard" message in milliseconds
  SHARE_COPIED_MESSAGE_DURATION: 3000,
} as const;

// ============================================================================
// PHOTO GRID CONFIGURATION
// ============================================================================

export const PHOTO_GRID = {
  // Photo is displayed as a 3x3 grid of tiles
  ROWS: 3,
  COLS: 3,

  // Width and height of each photo tile segment in pixels
  TILE_WIDTH: 150,
  TILE_HEIGHT: 150,
} as const;

// ============================================================================
// TILE NAMES
// ============================================================================

// Tile names mapping (index 0-8 maps to backend tile names)
export const TILE_NAMES = [
  "bio",
  "playerInformation",
  "draftInformation",
  "yearsActive",
  "teamsPlayedOn",
  "jerseyNumbers",
  "careerStats",
  "personalAchievements",
  "photo",
] as const;

// Total number of tiles in the game
export const TOTAL_TILES = TILE_NAMES.length;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // Prefix for player index storage (will be followed by sport name)
  PLAYER_INDEX_PREFIX: "playerIndex_",
} as const;

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULTS = {
  // Default daily round number if not specified
  ROUND_ID_NUMBER: 1,

  // Default player index if none is stored
  PLAYER_INDEX: 0,
} as const;

// ============================================================================
// LEGACY DATA FILES (for backwards compatibility)
// ============================================================================

export const LEGACY_SPORT_FILES: Record<SportType, string> = {
  baseball: "/AthleteUnknownBaseballData.json",
  basketball: "/AthleteUnknownBasketballData.json",
  football: "/AthleteUnknownFootballData.json",
} as const;
