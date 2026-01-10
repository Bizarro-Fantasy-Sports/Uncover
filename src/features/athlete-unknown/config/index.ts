/**
 * Application Configuration
 * Central location for all configurable values used throughout the application.
 * This makes it easy to adjust game mechanics, UI settings, and other parameters
 * without hunting through the codebase.
 */

// ============================================================================
// SPORT CONFIGURATION
// ============================================================================

// Re-export sport types from config to avoid circular dependencies
export {
  SPORT_BASEBALL,
  SPORT_BASKETBALL,
  SPORT_FOOTBALL,
  type SportType,
} from "@/config";

// ============================================================================
// SCORING & TILES CONFIGURATION
// ============================================================================

export const INITIAL_SCORE = 100;
export const INCORRECT_GUESS = "incorrectGuess";
export const INCORRECT_GUESS_PENALTY = 1;

export const TILE_NAMES = {
  INITIALS: "initials",
  NICKNAMES: "nicknames",
  BIO: "bio",
  PLAYER_INFORMATION: "playerInformation",
  DRAFT_INFORMATION: "draftInformation",
  YEARS_ACTIVE: "yearsActive",
  PHOTO: "photo",
  TEAMS_PLAYED_ON: "teamsPlayedOn",
  JERSEY_NUMBERS: "jerseyNumbers",
  CAREER_STATS: "careerStats",
  PERSONAL_ACHIEVEMENTS: "personalAchievements",
} as const;

export const TILE_PENALTIES = {
  [TILE_NAMES.INITIALS]: 6,
  [TILE_NAMES.NICKNAMES]: 6,
  [TILE_NAMES.BIO]: 3,
  [TILE_NAMES.PLAYER_INFORMATION]: 3,
  [TILE_NAMES.DRAFT_INFORMATION]: 3,
  [TILE_NAMES.YEARS_ACTIVE]: 3,
  [TILE_NAMES.PHOTO]: 6,
  [TILE_NAMES.TEAMS_PLAYED_ON]: 3,
  [TILE_NAMES.JERSEY_NUMBERS]: 3,
  [TILE_NAMES.CAREER_STATS]: 3,
  [TILE_NAMES.PERSONAL_ACHIEVEMENTS]: 3,
} as const;

export type ScoreDeduction = typeof INCORRECT_GUESS | TileType;

export const TILES = {
  [TILE_NAMES.INITIALS]: {
    label: `Initials \n(-${TILE_PENALTIES[TILE_NAMES.INITIALS]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.INITIALS],
    flippedEmoji: "💡",
  },
  [TILE_NAMES.NICKNAMES]: {
    label: `Nicknames \n(-${TILE_PENALTIES[TILE_NAMES.NICKNAMES]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.NICKNAMES],
    flippedEmoji: "💡",
  },
  [TILE_NAMES.BIO]: {
    label: `Bio \n(-${TILE_PENALTIES[TILE_NAMES.BIO]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.BIO],
    flippedEmoji: "🟨",
  },
  [TILE_NAMES.PLAYER_INFORMATION]: {
    label: `Player Information \n(-${TILE_PENALTIES[TILE_NAMES.PLAYER_INFORMATION]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.PLAYER_INFORMATION],
    flippedEmoji: "🟨",
  },
  [TILE_NAMES.DRAFT_INFORMATION]: {
    label: `Draft Information \n(-${TILE_PENALTIES[TILE_NAMES.DRAFT_INFORMATION]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.DRAFT_INFORMATION],
    flippedEmoji: "🟨",
  },
  [TILE_NAMES.YEARS_ACTIVE]: {
    label: `Years Active \n(-${TILE_PENALTIES[TILE_NAMES.YEARS_ACTIVE]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.YEARS_ACTIVE],
    flippedEmoji: "🟨",
  },
  [TILE_NAMES.PHOTO]: {
    label: `Photo \n(-${TILE_PENALTIES[TILE_NAMES.PHOTO]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.PHOTO],
    flippedEmoji: "📷",
  },
  [TILE_NAMES.TEAMS_PLAYED_ON]: {
    label: `Teams Played On \n(-${TILE_PENALTIES[TILE_NAMES.TEAMS_PLAYED_ON]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.TEAMS_PLAYED_ON],
    flippedEmoji: "🟨",
  },
  [TILE_NAMES.JERSEY_NUMBERS]: {
    label: `Jersey Numbers \n(-${TILE_PENALTIES[TILE_NAMES.JERSEY_NUMBERS]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.JERSEY_NUMBERS],
    flippedEmoji: "🟨",
  },
  [TILE_NAMES.CAREER_STATS]: {
    label: `Career Stats \n(-${TILE_PENALTIES[TILE_NAMES.CAREER_STATS]} Points)`,
    penalty: TILE_PENALTIES[TILE_NAMES.CAREER_STATS],
    flippedEmoji: "🟨",
  },
  [TILE_NAMES.PERSONAL_ACHIEVEMENTS]: {
    label: `Personal Achievements \n(-${TILE_PENALTIES[TILE_NAMES.PERSONAL_ACHIEVEMENTS]}) Points`,
    penalty: TILE_PENALTIES[TILE_NAMES.PERSONAL_ACHIEVEMENTS],
    flippedEmoji: "🟨",
  },
};

export type TileType = keyof typeof TILES;

export const TOP_TILES = [
  TILE_NAMES.INITIALS as TileType,
  TILE_NAMES.NICKNAMES as TileType,
] as const;

// Tiles in the 3x3 grid. Order matters for grid arrangement
export const GRID_TILES = [
  TILE_NAMES.BIO as TileType,
  TILE_NAMES.PLAYER_INFORMATION as TileType,
  TILE_NAMES.DRAFT_INFORMATION as TileType,
  TILE_NAMES.YEARS_ACTIVE as TileType,
  TILE_NAMES.PHOTO as TileType,
  TILE_NAMES.TEAMS_PLAYED_ON as TileType,
  TILE_NAMES.JERSEY_NUMBERS as TileType,
  TILE_NAMES.CAREER_STATS as TileType,
  TILE_NAMES.PERSONAL_ACHIEVEMENTS as TileType,
] as const;

// All tiles available for clues. Order matters for share text
export const ALL_TILES = [...TOP_TILES, ...GRID_TILES] as const;

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
// GUESS ACCURACY (LEVENSHTEIN DISTANCE)
// ============================================================================

export const GUESS_ACCURACY = {
  // Maximum edit distance for "close" guess (requires second closer guess to reveal player name)
  VERY_CLOSE_DISTANCE: 2,
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

export const LEGACY_SPORT_FILES: Record<string, string> = {
  baseball: "/AthleteUnknownBaseballData.json",
  basketball: "/AthleteUnknownBasketballData.json",
  football: "/AthleteUnknownFootballData.json",
} as const;
