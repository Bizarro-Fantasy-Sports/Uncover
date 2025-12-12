import React from "react";
import "./TodayStatsModal.css";

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

interface RoundStats {
  playDate: string;
  sport: string;
  name: string;
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

interface TodayStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  roundStats: RoundStats | null;
}

const formatTileName = (tileName: string): string => {
  if (!tileName) {
    return "";
  }
  return tileName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

const TodayStatsModal: React.FC<TodayStatsModalProps> = ({
  isOpen,
  onClose,
  roundStats,
}) => {
  if (!isOpen) {
    return null;
  }

  if (!roundStats) {
    return (
      <div className="today-stats-modal-overlay" onClick={onClose}>
        <div
          className="today-stats-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="today-stats-modal-header">
            <h2>Today's Stats</h2>
            <button className="close-button" onClick={onClose}>
              ×
            </button>
          </div>
          <div className="today-stats-modal-body">
            <p className="no-stats-message">
              Complete today's game to see your results here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="today-stats-modal-overlay" onClick={onClose}>
      <div
        className="today-stats-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="today-stats-modal-header">
          <h2>
            Today's{" "}
            {roundStats.sport
              ? roundStats.sport.charAt(0).toUpperCase() + roundStats.sport.slice(1)
              : ""}{" "}
            Stats
          </h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="today-stats-modal-body">
          <div className="stats-summary">
            <div className="stat-item">
              <div className="stat-label">Games Played</div>
              <div className="stat-value">{roundStats.totalPlays}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Avg Score</div>
              <div className="stat-value">{roundStats.averageScore}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Win Rate</div>
              <div className="stat-value">{roundStats.percentageCorrect}%</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Highest Score</div>
              <div className="stat-value">{roundStats.highestScore}</div>
            </div>
            <div className="stat-item">
              <div className="stat-label">Avg Correct Score</div>
              <div className="stat-value">{roundStats.averageCorrectScore}</div>
            </div>
          </div>

          <div className="tile-stats-section">
            <h3>Tile Statistics</h3>
            <div className="tile-info">
              <p>
                <strong>Most Common First Tile:</strong>{" "}
                {formatTileName(roundStats.mostCommonFirstTileFlipped)}
              </p>
              <p>
                <strong>Most Common Last Tile:</strong>{" "}
                {formatTileName(roundStats.mostCommonLastTileFlipped)}
              </p>
              <p>
                <strong>Most Flipped Tile:</strong>{" "}
                {formatTileName(roundStats.mostCommonTileFlipped)}
              </p>
              <p>
                <strong>Least Flipped Tile:</strong>{" "}
                {formatTileName(roundStats.leastCommonTileFlipped)}
              </p>
            </div>
          </div>

          <div className="mystery-player">
            <h3>Today's Mystery Player</h3>
            <p className="player-name">
              {roundStats.name === "???" ? (
                <>
                  <span className="mystery-placeholder">{roundStats.name}</span>
                  <span className="mystery-hint">
                    {" "}
                    (Solve the puzzle to reveal)
                  </span>
                </>
              ) : (
                roundStats.name
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodayStatsModal;
