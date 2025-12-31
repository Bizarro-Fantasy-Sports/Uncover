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

// what is actually sent and returned from BE API
export interface Result {
  score: number;
  isCorrect: boolean;
  tilesFlipped: string[];
  incorrectGuesses: number;
}

export interface GameResultResponse {
  success: boolean;
  message: string;
  result?: Result; // optional for mock data response
}

// Stats represents base statistics tracking
interface Stats {
  totalPlays: number;
  percentageCorrect: number;
  highestScore: number;
  averageCorrectScore: number;
  averageNumberOfTileFlips: number;
  mostCommonFirstTileFlipped: string;
  mostCommonLastTileFlipped: string;
  mostCommonTileFlipped: string;
  leastCommonTileFlipped: string;
  mostTileFlippedTracker: TileTracker;
  firstTileFlippedTracker: TileTracker;
  lastTileFlippedTracker: TileTracker;
}

export interface RoundStats extends Stats {
  playDate: string;
  sport: string;
  name?: string;
}

export interface UserStats {
  userId: string;
  userName: string;
  userCreated: string;
  currentDailyStreak: number;
  lastDayPlayed: string;
  sports: UserSportStats[];
}

export interface UserSportStats {
  sport: string;
  stats: Stats;
  history: RoundHistory[];
}

export interface RoundHistory extends Result {
  playDate: string;
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
