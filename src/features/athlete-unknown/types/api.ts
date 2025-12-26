// Athlete Unknown API Types

export interface Round {
  roundId: string;
  sport: string;
  playDate: string;
  created?: string;
  lastUpdated?: string;
  theme?: string;
  player: PlayerData;
  stats: RoundStats;
}

export interface PlayerData {
  sport: string;
  sportsReferenceURL: string;
  name: string;
  bio: string;
  playerInformation: string;
  draftInformation: string;
  yearsActive: string;
  teamsPlayedOn: string;
  jerseyNumbers: string;
  careerStats: string;
  personalAchievements: string;
  photo: string;
  [key: string]: string | number | undefined;
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

export interface TileTracker {
  bio: number;
  playerInformation: number;
  draftInformation: number;
  yearsActive: number;
  teamsPlayedOn: number;
  jerseyNumbers: number;
  careerStats: number;
  personalAchievements: number;
  photo: number;
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
