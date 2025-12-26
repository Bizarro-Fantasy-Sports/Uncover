import React from "react";
import { TILE_NAMES } from "../config";
import type { RoundStats, PlayerData } from "../types/api";

interface ResultsModalProps {
  isOpen: boolean;
  gaveUp: boolean;
  score: number;
  flippedTiles: boolean[];
  copiedText: string;
  roundStats: RoundStats | null;
  playerData: PlayerData;
  onClose: () => void;
  onShare: () => void;
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
  isOpen,
  gaveUp,
  score,
  flippedTiles,
  copiedText,
  roundStats,
  playerData,
  onClose,
  onShare,
}) => {
  if (!isOpen) return null;

  return (
    <div className="results-modal" onClick={onClose}>
      <div
        className="results-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-results" onClick={onClose}>
          ✕
        </button>
        <h2 className="results-title">
          {gaveUp ? "Try Again Tomorrow!" : `Correct! Your score is ${score}!`}
        </h2>
        {!gaveUp && roundStats && (
          <p className="average-score">
            The average score today is {roundStats.averageCorrectScore}
          </p>
        )}

        <div className="player-info-section">
          <a
            href={playerData.sportsReferenceURL}
            target="_blank"
            rel="noopener noreferrer"
            className="player-name-link"
          >
            {playerData.name}
          </a>
          {playerData.photo && (
            <img
              src={playerData.photo}
              alt={playerData.name}
              className="player-photo"
            />
          )}
        </div>

        <div className="results-grid">
          {TILE_NAMES.map((_, index) => (
            <div
              key={index}
              className={`results-tile ${flippedTiles[index] ? "flipped" : "unflipped"}`}
            >
              {flippedTiles[index] ? "↻" : ""}
            </div>
          ))}
        </div>

        <button className="share-button" onClick={onShare}>
          Share
        </button>

        {copiedText && (
          <div className="copied-message">
            <pre>{copiedText}</pre>
            <p>has been copied</p>
          </div>
        )}

        {roundStats && (
          <div className="round-stats-section">
            <h3>Today's Round Stats</h3>
            <div className="round-stats-grid">
              <div className="round-stat-item">
                <div className="round-stat-label">Games Played</div>
                <div className="round-stat-value">{roundStats.totalPlays}</div>
              </div>
              <div className="round-stat-item">
                <div className="round-stat-label">Average Score</div>
                <div className="round-stat-value">
                  {roundStats.averageCorrectScore}
                </div>
              </div>
              <div className="round-stat-item">
                <div className="round-stat-label">Win Rate</div>
                <div className="round-stat-value">
                  {roundStats.percentageCorrect}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
