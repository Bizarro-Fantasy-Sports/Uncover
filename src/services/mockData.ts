import type { PlayerData, RoundStats } from '../types/api';

// Mock data service - used when REACT_APP_USE_MOCK_DATA=true or when API calls fail
export class MockDataService {
  private static mockRoundStats: Record<string, RoundStats> = {
    baseball: {
      playDate: new Date().toISOString().split('T')[0],
      sport: "baseball",
      totalPlays: 100,
      percentageCorrect: 81,
      averageScore: 55,
      averageCorrectScore: 88,
      highestScore: 97,
      mostCommonFirstTileFlipped: "playerInformation",
      mostCommonLastTileFlipped: "photo",
      mostCommonTileFlipped: "teamsPlayedOn",
      leastCommonTileFlipped: "bio",
      mostFlippedTracker: {
        bio: 11,
        careerStats: 11,
        draftInformation: 11,
        jerseyNumbers: 11,
        personalAchievements: 11,
        photo: 11,
        playerInformation: 11,
        teamsPlayedOn: 11,
        yearsActive: 11,
      },
      firstFlippedTracker: {
        bio: 12,
        careerStats: 12,
        draftInformation: 12,
        jerseyNumbers: 12,
        personalAchievements: 12,
        photo: 12,
        playerInformation: 12,
        teamsPlayedOn: 12,
        yearsActive: 12,
      },
      lastFlippedTracker: {
        bio: 13,
        careerStats: 13,
        draftInformation: 13,
        jerseyNumbers: 13,
        personalAchievements: 13,
        photo: 13,
        playerInformation: 13,
        teamsPlayedOn: 13,
        yearsActive: 13,
      },
    },
    basketball: {
      playDate: new Date().toISOString().split('T')[0],
      sport: "basketball",
      totalPlays: 100,
      percentageCorrect: 88,
      averageScore: 66,
      averageCorrectScore: 90,
      highestScore: 97,
      mostCommonFirstTileFlipped: "playerInformation",
      mostCommonLastTileFlipped: "photo",
      mostCommonTileFlipped: "teamsPlayedOn",
      leastCommonTileFlipped: "bio",
      mostFlippedTracker: {
        bio: 21,
        careerStats: 21,
        draftInformation: 21,
        jerseyNumbers: 21,
        personalAchievements: 21,
        photo: 21,
        playerInformation: 21,
        teamsPlayedOn: 21,
        yearsActive: 21,
      },
      firstFlippedTracker: {
        bio: 22,
        careerStats: 22,
        draftInformation: 22,
        jerseyNumbers: 22,
        personalAchievements: 22,
        photo: 22,
        playerInformation: 22,
        teamsPlayedOn: 22,
        yearsActive: 22,
      },
      lastFlippedTracker: {
        bio: 23,
        careerStats: 23,
        draftInformation: 23,
        jerseyNumbers: 23,
        personalAchievements: 23,
        photo: 23,
        playerInformation: 23,
        teamsPlayedOn: 23,
        yearsActive: 23,
      },
    },
    football: {
      playDate: new Date().toISOString().split('T')[0],
      sport: "football",
      totalPlays: 100,
      percentageCorrect: 90,
      averageScore: 77,
      averageCorrectScore: 90,
      highestScore: 98,
      mostCommonFirstTileFlipped: "playerInformation",
      mostCommonLastTileFlipped: "photo",
      mostCommonTileFlipped: "teamsPlayedOn",
      leastCommonTileFlipped: "bio",
      mostFlippedTracker: {
        bio: 31,
        careerStats: 31,
        draftInformation: 31,
        jerseyNumbers: 31,
        personalAchievements: 31,
        photo: 31,
        playerInformation: 31,
        teamsPlayedOn: 31,
        yearsActive: 31,
      },
      firstFlippedTracker: {
        bio: 32,
        careerStats: 32,
        draftInformation: 32,
        jerseyNumbers: 32,
        personalAchievements: 32,
        photo: 32,
        playerInformation: 32,
        teamsPlayedOn: 32,
        yearsActive: 32,
      },
      lastFlippedTracker: {
        bio: 33,
        careerStats: 33,
        draftInformation: 33,
        jerseyNumbers: 33,
        personalAchievements: 33,
        photo: 33,
        playerInformation: 33,
        teamsPlayedOn: 33,
        yearsActive: 33,
      },
    },
  };

  static async getPlayerData(sport: string, date?: string): Promise<PlayerData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Load from local JSON files as before
    const sportFiles: Record<string, string> = {
      baseball: "/UncoverBaseballData.json",
      basketball: "/UncoverBasketballData.json",
      football: "/UncoverFootballData.json",
    };

    const response = await fetch(sportFiles[sport]);
    const data: PlayerData[] = await response.json();

    const key = `playerIndex_${sport}`;
    const storedIndex = parseInt(localStorage.getItem(key) || "0");
    const index = storedIndex % data.length;
    const playerData = data[index];

    localStorage.setItem(key, ((index + 1) % data.length).toString());

    return {
      ...playerData,
      playDate: date || new Date().toISOString().split('T')[0],
      sport,
    };
  }

  static async getRoundStats(sport: string, date?: string): Promise<RoundStats> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      ...this.mockRoundStats[sport],
      playDate: date || new Date().toISOString().split('T')[0],
    };
  }
}

export default MockDataService;
