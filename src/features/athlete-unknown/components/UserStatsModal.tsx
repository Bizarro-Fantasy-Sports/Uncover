import React, { useEffect, useState } from "react";
import {
  TileTracker,
  UserSportStats,
  UserStats,
} from "@/features/athlete-unknown/types";
import { useParams } from "react-router";
import TestUnknownPerson from "@/features/athlete-unknown/assets/test-unknown-person.jpg";
import { getDateString } from "../utils/date";
import { config, SportType } from "@/config";

interface UserStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats | null;
  isLoading: boolean;
  error: string | null;
}

function UserStatsModal({
  isOpen,
  onClose,
  userStats,
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

  useEffect(() => {
    const stats = userStats?.sports.filter(
      (sportStats) => sportStats.sport === selectedSport
    );
    setSelectedSportStats(stats?.[0] ?? null);
  }, [userStats, selectedSport]);

  if (!isOpen || !userStats || !selectedSportStats) {
    return null;
  }

  return (
    <div className="au-results-modal" onClick={onClose}>
      <div className="au-open-folder">
        {config.athleteUnknown.sportsList.map(
          (sport: SportType, index: number) => (
            <button
              key={sport}
              className={`au-folder-tab ${selectedSport === sport ? "au-folder-tab--selected" : ""}`}
              style={{ "--tab-index": index } as React.CSSProperties}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedSport(sport);
              }}
              aria-label={`${sport} folder tab`}
            >
              <h4 className="au-folder-tab-text">{sport}</h4>
            </button>
          )
        )}
        <div
          className="au-results-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="au-close-results" onClick={onClose}>
            ✕
          </button>
          <div className="au-results-title-container">
            <h2 className="au-results-title">Investigator Profile</h2>
          </div>

          <div className="au-player-results-container">
            <div className="au-player-container">
              <img
                src={TestUnknownPerson}
                alt="unknown-player"
                className="au-player-photo"
              />
            </div>

            <div className="au-player-results-info-container">
              <div className="au-report-field">
                <span className="au-report-label">Name:</span>
                <span className="au-report-value">TestUser123</span>
                <div className="au-report-underline"></div>
              </div>
              <div className="au-report-field">
                <span className="au-report-label">
                  Solving
                  <br />
                  Mysteries
                  <br />
                  Since:
                </span>
                <span className="au-report-value">
                  <br />
                  {userStats.userCreated !== ""
                    ? getDateString(userStats.userCreated)
                    : "N/A"}
                </span>
                <div className="au-report-underline"></div>
              </div>
              <div className="au-report-field">
                <span className="au-report-label">
                  Current Daily <br /> Streak:
                </span>
                <span className="au-report-value">
                  {userStats.currentDailyStreak}
                </span>
                <div className="au-report-underline"></div>
              </div>
            </div>
          </div>

          {selectedSportStats && (
            <>
              <div className="au-results-modal-section-separator" />
              <h3 className="au-results-round-stats-title">{`All ${selectedSport} Case Stats`}</h3>
              <div className="au-results-round-stats">
                <div className="au-results-round-stats-row">
                  <div className="au-report-field">
                    <span className="au-report-label">Total Plays:</span>
                    <span className="au-report-value">
                      {selectedSportStats.stats.totalPlays}
                    </span>
                  </div>
                  <div className="au-report-field">
                    <span className="au-report-label">Solve Rate:</span>
                    <span className="au-report-value">
                      {`${selectedSportStats.stats.percentageCorrect}%`}
                    </span>
                  </div>
                </div>
                <div className="au-results-round-stats-row">
                  <div className="au-report-field">
                    <span className="au-report-label">High Score:</span>
                    <span className="au-report-value">
                      {selectedSportStats.stats.highestScore}
                    </span>
                  </div>
                  <div className="au-report-field">
                    <span className="au-report-label">Avg Solve Score:</span>
                    <span className="au-report-value">
                      {selectedSportStats.stats.averageCorrectScore}
                    </span>
                  </div>
                </div>
                <div className="au-results-round-stats-row">
                  <div className="au-report-field">
                    <span className="au-report-label">Avg Clues Used:</span>
                    <span className="au-report-value">
                      {selectedSportStats.stats.averageNumberOfTileFlips}
                    </span>
                  </div>
                </div>
              </div>

              <div className="au-results-modal-section-separator" />

              <h3 className="au-results-round-stats-title">Clue Tendencies</h3>
              <div className="au-results-tile-tracker-stats">
                <table className="au-tile-tracker-table">
                  <thead>
                    <tr>
                      <th>Clue</th>
                      <th>Most Used</th>
                      <th>First Used</th>
                      <th>Last Used</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(
                      selectedSportStats.stats.firstTileFlippedTracker
                    ).map((tile) => (
                      <tr key={tile}>
                        <td className="au-tile-tracker-name">
                          {formatTileName(tile)}
                        </td>
                        <td>
                          {
                            selectedSportStats.stats.mostTileFlippedTracker[
                              tile as keyof TileTracker
                            ]
                          }
                        </td>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export { UserStatsModal };
