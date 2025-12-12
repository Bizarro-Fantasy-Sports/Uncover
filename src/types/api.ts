// API Request/Response Types

export interface PlayerData {
  Name: string;
  Bio: string;
  "Player Information": string;
  "Draft Information": string;
  "Years Active": string;
  "Teams Played On": string;
  "Jersey Numbers": string;
  "Career Stats": string;
  "Personal Achievements": string;
  Photo: string[];
  dailyNumber?: number;
  playDate?: string;
  sport?: string;
  [key: string]: string | string[] | number | undefined;
}

export interface TileTracker {
  bio: number;
  careerStats: number;
  draftInformation: number;
  jerseyNumbers: number;
  personalAchievements: number;
  photo: number;
  playerInformation: number;
  teamsPlayedOn: number;
  yearsActive: number;
}

export interface RoundStats {
  playDate: string;
  sport: string;
  name?: string;
  totalPlays: number;
  percentageCorrect: number;
  averageScore: number;
  averageCorrectScore: number;
  highestScore: number;
  mostCommonFirstTileFlipped: string;
  mostCommonLastTileFlipped: string;
  mostCommonTileFlipped: string;
  leastCommonTileFlipped: string;
  mostFlippedTracker: TileTracker;
  firstFlippedTracker: TileTracker;
  lastFlippedTracker: TileTracker;
}

export interface GameResult {
  userId: string;
  sport: string;
  playDate: string;
  playerName: string;
  score: number;
  tilesFlipped: number;
  incorrectGuesses: number;
  flippedTilesPattern: boolean[];
  firstTileFlipped?: string;
  lastTileFlipped?: string;
  completed: boolean;
  completedAt?: string;
  rank?: string;
}

export interface GameResultResponse {
  success: boolean;
  message: string;
  result?: GameResult;
  roundStats?: RoundStats;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: any;
}
