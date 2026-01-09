/**
 * Centralized Environment Configuration
 * All environment variables are loaded and validated here
 */

// Sport type definitions (kept here to avoid circular dependencies)
export const SPORT_BASEBALL = "baseball";
export const SPORT_BASKETBALL = "basketball";
export const SPORT_FOOTBALL = "football";

export type SportType =
  | typeof SPORT_BASEBALL
  | typeof SPORT_BASKETBALL
  | typeof SPORT_FOOTBALL;

const FALLBACK_SPORTS_LIST = [
  SPORT_FOOTBALL as SportType,
  SPORT_BASKETBALL as SportType,
  SPORT_BASEBALL as SportType,
];

/**
 * Validates and parses the sports list from environment variable
 * If any sport is invalid, returns null (triggers fallback)
 * Otherwise returns typed array of valid sports
 */
function parseSportsListFromEnv(
  envValue: string | undefined
): SportType[] | null {
  if (!envValue) {
    return null;
  }

  const rawSports = envValue.split(",").map((s) => s.trim());

  const validSports = rawSports.every((sport) =>
    [SPORT_BASEBALL, SPORT_BASKETBALL, SPORT_FOOTBALL].includes(sport)
  );

  if (!validSports) {
    console.warn(
      "[Config] Invalid sport in REACT_APP_AU_SPORTS_LIST. Using fallback.",
      {
        provided: rawSports,
        valid: FALLBACK_SPORTS_LIST,
      }
    );
    return null;
  }

  return rawSports as SportType[];
}

interface AppConfig {
  api: {
    baseUrl: string;
    timeout: number;
    useMockData: boolean;
  };
  auth0: {
    domain: string;
    clientId: string;
    audience: string;
  };
  athleteUnknown: {
    sportsList: SportType[];
  };
}

/**
 * Load and validate environment variables
 * Throws an error if required variables are missing
 */
function loadConfig(): AppConfig {
  // Define required environment variables
  const requiredVars = [
    "REACT_APP_AUTH0_DOMAIN",
    "REACT_APP_AUTH0_CLIENT_ID",
    "REACT_APP_AUTH0_AUDIENCE",
  ];

  // Check for missing required variables
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
        "Please check your .env file and ensure all required variables are set."
    );
  }

  return {
    api: {
      baseUrl: process.env.REACT_APP_API_BASE_URL || "http://localhost:8080",
      timeout: 10000, // 10 second timeout
      useMockData: process.env.REACT_APP_USE_MOCK_DATA === "true",
    },
    auth0: {
      domain: process.env.REACT_APP_AUTH0_DOMAIN!,
      clientId: process.env.REACT_APP_AUTH0_CLIENT_ID!,
      audience: process.env.REACT_APP_AUTH0_AUDIENCE!,
    },
    athleteUnknown: {
      sportsList:
        parseSportsListFromEnv(process.env.REACT_APP_AU_SPORTS_LIST) ||
        FALLBACK_SPORTS_LIST,
    },
  };
}

// Export the loaded configuration
export const config = loadConfig();
