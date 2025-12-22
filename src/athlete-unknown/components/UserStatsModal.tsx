import React, { useState } from "react";
import "./UserStatsModal.css";

// TypeScript interfaces for user stats
interface TileTracker {
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

interface SportStats {
  sport: string;
  totalPlays: number;
  percentageCorrect: number;
  averageCorrectScore: number;
  highestScore: number;
  currentDailyStreak: number;
  firstTileFlippedTracker: TileTracker;
  lastTileFlippedTracker: TileTracker;
  mostTileFlippedTracker: TileTracker;
  mostCommonFirstTileFlipped: string;
  mostCommonLastTileFlipped: string;
  mostCommonTileFlipped: string;
  leastCommonTileFlipped: string;
}

interface UserStatsData {
  userId: string;
  userName: string;
  userCreated: string;
  sports: SportStats[];
}

// Sample data - this would eventually come from backend/localStorage
const sampleUserStats: UserStatsData = {
  userId: "FirstTestProdUser123",
  userName: "FirstTestProdUser123",
  sports: [
    {
      averageCorrectScore: 70,
      currentDailyStreak: 3,
      firstTileFlippedTracker: {
        bio: 11,
        careerStats: 17,
        draftInformation: 13,
        jerseyNumbers: 16,
        personalAchievements: 18,
        photo: 19,
        playerInformation: 12,
        teamsPlayedOn: 15,
        yearsActive: 14,
      },
      highestScore: 90,
      lastTileFlippedTracker: {
        bio: 11,
        careerStats: 71,
        draftInformation: 31,
        jerseyNumbers: 61,
        personalAchievements: 81,
        photo: 91,
        playerInformation: 21,
        teamsPlayedOn: 51,
        yearsActive: 41,
      },
      mostTileFlippedTracker: {
        bio: 11,
        careerStats: 71,
        draftInformation: 31,
        jerseyNumbers: 61,
        personalAchievements: 81,
        photo: 91,
        playerInformation: 21,
        teamsPlayedOn: 51,
        yearsActive: 41,
      },
      mostCommonFirstTileFlipped: "playerInformation",
      mostCommonLastTileFlipped: "photo",
      mostCommonTileFlipped: "careerStats",
      leastCommonTileFlipped: "bio",
      percentageCorrect: 0.81,
      sport: "basketball",
      totalPlays: 10,
    },
    {
      averageCorrectScore: 70,
      currentDailyStreak: 5,
      firstTileFlippedTracker: {
        bio: 21,
        careerStats: 27,
        draftInformation: 23,
        jerseyNumbers: 26,
        personalAchievements: 28,
        photo: 29,
        playerInformation: 22,
        teamsPlayedOn: 25,
        yearsActive: 24,
      },
      highestScore: 90,
      lastTileFlippedTracker: {
        bio: 12,
        careerStats: 72,
        draftInformation: 32,
        jerseyNumbers: 62,
        personalAchievements: 82,
        photo: 92,
        playerInformation: 22,
        teamsPlayedOn: 52,
        yearsActive: 42,
      },
      mostTileFlippedTracker: {
        bio: 12,
        careerStats: 72,
        draftInformation: 32,
        jerseyNumbers: 62,
        personalAchievements: 82,
        photo: 92,
        playerInformation: 22,
        teamsPlayedOn: 52,
        yearsActive: 42,
      },
      mostCommonFirstTileFlipped: "playerInformation",
      mostCommonLastTileFlipped: "photo",
      mostCommonTileFlipped: "careerStats",
      leastCommonTileFlipped: "bio",
      percentageCorrect: 0.82,
      sport: "baseball",
      totalPlays: 30,
    },
    {
      averageCorrectScore: 70,
      currentDailyStreak: 7,
      firstTileFlippedTracker: {
        bio: 31,
        careerStats: 37,
        draftInformation: 33,
        jerseyNumbers: 36,
        personalAchievements: 38,
        photo: 39,
        playerInformation: 32,
        teamsPlayedOn: 35,
        yearsActive: 34,
      },
      highestScore: 90,
      lastTileFlippedTracker: {
        bio: 13,
        careerStats: 73,
        draftInformation: 33,
        jerseyNumbers: 63,
        personalAchievements: 83,
        photo: 93,
        playerInformation: 23,
        teamsPlayedOn: 53,
        yearsActive: 43,
      },
      mostTileFlippedTracker: {
        bio: 13,
        careerStats: 73,
        draftInformation: 33,
        jerseyNumbers: 63,
        personalAchievements: 83,
        photo: 93,
        playerInformation: 23,
        teamsPlayedOn: 53,
        yearsActive: 43,
      },
      mostCommonFirstTileFlipped: "playerInformation",
      mostCommonLastTileFlipped: "photo",
      mostCommonTileFlipped: "careerStats",
      leastCommonTileFlipped: "bio",
      percentageCorrect: 0.83,
      sport: "football",
      totalPlays: 30,
    },
  ],
  userCreated: "2025-11-19T07:47:47.242Z",
};

const UserStatsModal: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState<string>("basketball");
  const [userStats] = useState<UserStatsData>(sampleUserStats);

  const currentSportStats = userStats.sports.find(
    (s) => s.sport === selectedSport
  );

  const formatTileName = (name: string): string => {
    return name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!currentSportStats) {
    return <div className="user-stats-container">No stats available</div>;
  }

  return (
    <div className="user-stats-container">
      <h1 className="stats-title">User Statistics</h1>

      <div className="user-info">
        <p>User: {userStats.userName}</p>
        <p>Member Since: {formatDate(userStats.userCreated)}</p>
      </div>

      {/* Sport Selector */}
      <div className="sport-selector">
        {userStats.sports.map((sport) => (
          <button
            key={sport.sport}
            className={`sport-button ${selectedSport === sport.sport ? "active" : ""}`}
            onClick={() => setSelectedSport(sport.sport)}
          >
            {sport.sport.charAt(0).toUpperCase() + sport.sport.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="stats-section">
        <h2>Overview</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{currentSportStats.totalPlays}</div>
            <div className="stat-label">Total Plays</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {(currentSportStats.percentageCorrect * 100).toFixed(0)}%
            </div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {currentSportStats.averageCorrectScore}
            </div>
            <div className="stat-label">Average Score</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{currentSportStats.highestScore}</div>
            <div className="stat-label">Highest Score</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">
              {currentSportStats.currentDailyStreak}
            </div>
            <div className="stat-label">Current Streak</div>
          </div>
        </div>
      </div>

      {/* Tile Patterns */}
      <div className="stats-section">
        <h2>Tile Patterns</h2>
        <div className="tile-patterns">
          <div className="pattern-card">
            <h3>Most Common</h3>
            <div className="pattern-item">
              <span className="pattern-label">First Tile:</span>
              <span className="pattern-value">
                {formatTileName(currentSportStats.mostCommonFirstTileFlipped)}
              </span>
            </div>
            <div className="pattern-item">
              <span className="pattern-label">Most Flipped:</span>
              <span className="pattern-value">
                {formatTileName(currentSportStats.mostCommonTileFlipped)}
              </span>
            </div>
            <div className="pattern-item">
              <span className="pattern-label">Last Tile:</span>
              <span className="pattern-value">
                {formatTileName(currentSportStats.mostCommonLastTileFlipped)}
              </span>
            </div>
          </div>
          <div className="pattern-card">
            <h3>Least Common</h3>
            <div className="pattern-item">
              <span className="pattern-label">Tile:</span>
              <span className="pattern-value">
                {formatTileName(currentSportStats.leastCommonTileFlipped)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Tile Statistics */}
      <div className="stats-section">
        <h2>Tile Flip Details</h2>
        <div className="tile-stats-table">
          <table>
            <thead>
              <tr>
                <th>Tile Type</th>
                <th>First Flipped</th>
                <th>Last Flipped</th>
                <th>Most Flipped</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(currentSportStats.firstTileFlippedTracker).map(
                (tile) => (
                  <tr key={tile}>
                    <td className="tile-name">{formatTileName(tile)}</td>
                    <td>
                      {
                        currentSportStats.firstTileFlippedTracker[
                          tile as keyof TileTracker
                        ]
                      }
                    </td>
                    <td>
                      {
                        currentSportStats.lastTileFlippedTracker[
                          tile as keyof TileTracker
                        ]
                      }
                    </td>
                    <td>
                      {
                        currentSportStats.mostTileFlippedTracker[
                          tile as keyof TileTracker
                        ]
                      }
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export { UserStatsModal };
