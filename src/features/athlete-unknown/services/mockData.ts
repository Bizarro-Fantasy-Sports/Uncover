import type { Round, UserStats } from "@/features/athlete-unknown/types";
import {
  getMockDataPlayerIndex,
  saveMockDataPlayerIndex,
} from "@/features/athlete-unknown/utils";

// Mock data service - used when REACT_APP_USE_MOCK_DATA=true or when API calls fail
class MockDataService {
  static async getRoundData(sport: string): Promise<Round> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Load from local JSON files as before
    const sportFiles: Record<string, string> = {
      baseball: "/AthleteUnknownBaseballData.json",
      basketball: "/AthleteUnknownBasketballData.json",
      football: "/AthleteUnknownFootballData.json",
    };

    const response = await fetch(sportFiles[sport]);
    const data: any[] = await response.json();

    const storedIndex = getMockDataPlayerIndex(sport);
    const index =
      storedIndex === null
        ? Math.floor(Math.random() * data.length)
        : storedIndex;

    saveMockDataPlayerIndex(sport, index);

    return data[index];
  }

  static async getUserStats(): Promise<UserStats> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Load from local JSON files
    const response = await fetch("/AthleteUnknownUserStats.json");
    const userStats: UserStats = await response.json();

    return userStats;
  }
}

export { MockDataService };
