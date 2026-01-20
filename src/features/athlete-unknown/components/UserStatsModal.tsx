import React, { useEffect, useState } from "react";
import "./UserStatsModal.css";
import {
  TileTracker,
  UserSportStats,
  UserStats,
} from "@/features/athlete-unknown/types";
import { useParams } from "react-router";

interface UserStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats | null;
  onEditUsername?: () => void;
  isLoading: boolean;
  error: string | null;
}

function UserStatsModal({
  isOpen,
  onClose,
  userStats,
  onEditUsername,
  isLoading,
  error,
}: UserStatsModalProps): React.ReactElement | null {
  const { sport } = useParams();
  const [selectedSport, setSelectedSport] = useState<string>(sport ?? "");
  const [selectedSportStats, setSelectedSportStats] =
    useState<UserSportStats | null>();

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

  useEffect(() => {
    const stats = userStats?.sports.filter(
      (sportStats) => sportStats.sport === selectedSport
    );
    setSelectedSportStats(stats?.[0] ?? null);
  }, [userStats, selectedSport]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="user-stats-modal" onClick={onClose}>
      <div
        className="user-stats-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-user-stats" onClick={onClose}>
          ×
        </button>
        <div className="user-stats-container">
          <h1 className="stats-title">User Statistics</h1>

          {isLoading && <p>Loading user stats...</p>}

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          )}

          {!isLoading && userStats && (
            <>
              <div className="user-info">
                <div className="username-row">
                  <p>User: {userStats.userName}</p>
                  {onEditUsername && (
                    <button
                      className="edit-username-button"
                      onClick={onEditUsername}
                      title="Edit username"
                    >
                      ✏️
                    </button>
                  )}
                </div>
                <p>Member Since: {formatDate(userStats.userCreated)}</p>
                <p>Current Daily Streak: {userStats.currentDailyStreak}</p>
              </div>

              {selectedSportStats && (
                <>
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

                  <div className="stats-section">
                    <h2>Overview</h2>
                    <div className="stats-grid">
                      <div className="stat-card">
                        <div className="stat-value">
                          {selectedSportStats.stats.totalPlays}
                        </div>
                        <div className="stat-label">Total Plays</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">
                          {selectedSportStats.stats.percentageCorrect.toFixed(0)}%
                        </div>
                        <div className="stat-label">Accuracy</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">
                          {selectedSportStats.stats.averageCorrectScore}
                        </div>
                        <div className="stat-label">Average Score</div>
                      </div>
                      <div className="stat-card">
                        <div className="stat-value">
                          {selectedSportStats.stats.highestScore}
                        </div>
                        <div className="stat-label">Highest Score</div>
                      </div>
                      <div className="stat-card highlight">
                        <div className="stat-value">
                          {selectedSportStats.stats.averageNumberOfTileFlips}
                        </div>
                        <div className="stat-label">Average # of Tile Flips</div>
                      </div>
                    </div>
                  </div>

                  <div className="stats-section">
                    <h2>Tile Patterns</h2>
                    <div className="tile-patterns">
                      <div className="pattern-card">
                        <h3>Most Common</h3>
                        <div className="pattern-item">
                          <span className="pattern-label">First Tile:</span>
                          <span className="pattern-value">
                            {formatTileName(
                              selectedSportStats.stats.mostCommonFirstTileFlipped
                            )}
                          </span>
                        </div>
                        <div className="pattern-item">
                          <span className="pattern-label">Most Flipped:</span>
                          <span className="pattern-value">
                            {formatTileName(
                              selectedSportStats.stats.mostCommonTileFlipped
                            )}
                          </span>
                        </div>
                        <div className="pattern-item">
                          <span className="pattern-label">Last Tile:</span>
                          <span className="pattern-value">
                            {formatTileName(
                              selectedSportStats.stats.mostCommonLastTileFlipped
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="pattern-card">
                        <h3>Least Common</h3>
                        <div className="pattern-item">
                          <span className="pattern-label">Tile:</span>
                          <span className="pattern-value">
                            {formatTileName(
                              selectedSportStats.stats.leastCommonTileFlipped
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

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
                          {Object.keys(
                            selectedSportStats.stats.firstTileFlippedTracker
                          ).map((tile) => (
                            <tr key={tile}>
                              <td className="tile-name">{formatTileName(tile)}</td>
                              <td>
                                {
                                  selectedSportStats.stats.firstTileFlippedTracker[
                                    tile as keyof TileTracker
                                  ]
                                }
                              </td>
                              <td>
                                {
                                  selectedSportStats.stats.lastTileFlippedTracker[
                                    tile as keyof TileTracker
                                  ]
                                }
                              </td>
                              <td>
                                {
                                  selectedSportStats.stats.mostTileFlippedTracker[
                                    tile as keyof TileTracker
                                  ]
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { UserStatsModal };
