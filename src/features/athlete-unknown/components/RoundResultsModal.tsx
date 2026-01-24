import React from "react";
import { ALL_TILES, TILES } from "@/features/athlete-unknown/config";
import type { SportType, TileType } from "@/features/athlete-unknown/config";
import type { Round } from "@/features/athlete-unknown/types";
import TestUnknownPerson from "@/features/athlete-unknown/assets/test-unknown-person.jpg";
import { Button } from "./Button";
import { getSportEmoji } from "@/features/athlete-unknown/utils";
import { formatDate } from "@/utils";

const WIN_OR_LOSE = "winOrLose";

const formatTileName = (tileName: string): string => {
  if (!tileName) {
    return "";
  }
  return tileName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

interface ResultsModalProps {
  isOpen: boolean;
  score: number;
  flippedTiles: TileType[];
  copiedText: string;
  round: Round;
  onClose: () => void;
  onShare: () => void;
  isCompleted: boolean;
  sport: SportType;
  roundNumber: string;
  playDate: string;
}

export function RoundResultsModal({
  isOpen,
  score,
  flippedTiles,
  copiedText,
  round,
  onClose,
  onShare,
  isCompleted,
  sport,
  roundNumber,
  playDate,
}: ResultsModalProps): React.ReactElement | null {
  if (!isOpen) {
    return null;
  }

  const allTilesResults = [WIN_OR_LOSE as typeof WIN_OR_LOSE, ...ALL_TILES];
  const { stats: roundStats, player: playerData } = round;

  return (
    <div className="au-results-modal" onClick={onClose}>
      <div className="au-open-folder">
        <button
          className="au-folder-tab"
          style={{ "--tab-index": 0 } as React.CSSProperties}
          onClick={(e) => e.stopPropagation()}
          aria-label="Folder tab"
        >
          <p className="au-folder-tab-text">{`Case #${getSportEmoji(sport)}${roundNumber}`}</p>
        </button>
        <div
          className="au-results-modal-content"
          onClick={(e) => e.stopPropagation()}
        >
          <button className="au-close-results" onClick={onClose}>
            ✕
          </button>
          <div className="au-results-title-container">
            <h2
              className={`au-results-title ${isCompleted ? "au-results-title--completed" : ""}`}
            >
              {isCompleted ? "Case Closed" : "Case Open"}
            </h2>
          </div>

          <div className="au-player-results-container">
            <div className="au-player-container">
              {isCompleted && playerData.photo ? (
                <img
                  src={playerData.photo}
                  alt={playerData.name}
                  className="au-player-photo"
                />
              ) : (
                <img
                  src={TestUnknownPerson}
                  alt="unknown-player"
                  className="au-player-photo"
                />
              )}
            </div>

            <div className="au-player-results-info-container">
              <div className="au-report-field">
                <span className="au-report-label">Name:</span>
                <span className="au-report-value">
                  {isCompleted ? (
                    <a
                      href={playerData.sportsReferenceURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="au-player-name-link"
                    >
                      {playerData.name}
                    </a>
                  ) : (
                    <p className="au-player-name">?????</p>
                  )}
                </span>
                <div className="au-report-underline"></div>
              </div>
              <div className="au-report-field">
                <span className="au-report-label">Date:</span>
                <span className="au-report-value">{formatDate(playDate)}</span>
                <div className="au-report-underline"></div>
              </div>
              <div className="au-report-field">
                <span className="au-report-label">Score:</span>
                <span className="au-report-value">
                  {isCompleted ? score : "???"}
                </span>
                <div className="au-report-underline"></div>
              </div>
              <div className="au-report-field">
                <span className="au-report-label">P.I.:</span>
                <span className="au-report-value">TestUser123</span>
                <div className="au-report-underline"></div>
              </div>
            </div>
          </div>

          {isCompleted && (
            <>
              <div className="au-results-modal-section-separator" />
              <div className="au-results-grid-container">
                <div className="au-results-grid">
                  {allTilesResults.map(
                    (
                      tileName: typeof WIN_OR_LOSE | TileType,
                      index: number
                    ) => {
                      let emoji;
                      if (tileName === WIN_OR_LOSE) {
                        emoji = score > 0 ? "✅" : "❌";
                      } else {
                        const tile = TILES[tileName];
                        const isFlipped = flippedTiles.includes(tileName);
                        emoji = isFlipped ? tile.flippedEmoji : "🟦";
                      }
                      return <div key={index}>{emoji}</div>;
                    }
                  )}
                </div>
                <div className="au-share-container">
                  <Button onClick={onShare} size="md" variant="primary">
                    Share Results
                  </Button>
                  {copiedText && (
                    <div className="au-copied-message">
                      <p>
                        Copied results <br /> to clipboard
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {roundStats && (
            <>
              <div className="au-results-modal-section-separator" />
              <h3 className="au-results-round-stats-title">Case Stats</h3>
              <div className="au-results-round-stats">
                <div className="au-results-round-stats-row">
                  <div className="au-report-field">
                    <span className="au-report-label">Total Plays:</span>
                    <span className="au-report-value">
                      {roundStats.totalPlays}
                    </span>
                  </div>
                  <div className="au-report-field">
                    <span className="au-report-label">Solve Rate:</span>
                    <span className="au-report-value">
                      {`${Math.round(roundStats.percentageCorrect * 100) / 100}%`}
                    </span>
                  </div>
                </div>
                <div className="au-results-round-stats-row">
                  <div className="au-report-field">
                    <span className="au-report-label">High Score:</span>
                    <span className="au-report-value">
                      {roundStats.highestScore}
                    </span>
                  </div>
                  <div className="au-report-field">
                    <span className="au-report-label">Avg Solve Score:</span>
                    <span className="au-report-value">
                      {Math.round(roundStats.averageCorrectScore * 100) / 100}
                    </span>
                  </div>
                </div>
                <div className="au-results-round-stats-row">
                  <div className="au-report-field">
                    <span className="au-report-label">Avg Clues Used:</span>
                    <span className="au-report-value">
                      {Math.round(roundStats.averageNumberOfTileFlips * 100) /
                        100}
                    </span>
                  </div>
                </div>
              </div>

              <div className="au-results-modal-section-separator" />

              <h3 className="au-results-round-stats-title">Clue Tendencies</h3>
              <div className="au-results-tile-tracker-stats">
                <div className="au-results-tile-tracker-stamp-row">
                  <div className="au-stamp-field">
                    <span className="au-stamp-label">Most Used</span>
                    <div className="au-stamp-box">
                      {roundStats.mostCommonTileFlipped !== "" && (
                        <span className="au-stamp-overlay">
                          {formatTileName(roundStats.mostCommonTileFlipped)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="au-stamp-field">
                    <span className="au-stamp-label">Least Used</span>
                    <div className="au-stamp-box">
                      {roundStats.leastCommonTileFlipped !== "" && (
                        <span className="au-stamp-overlay">
                          {formatTileName(roundStats.leastCommonTileFlipped)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="au-results-tile-tracker-stamp-row">
                  <div className="au-stamp-field">
                    <span className="au-stamp-label">Most Used First</span>
                    <div className="au-stamp-box">
                      {roundStats.mostCommonFirstTileFlipped !== "" && (
                        <span className="au-stamp-overlay">
                          {formatTileName(
                            roundStats.mostCommonFirstTileFlipped
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="au-stamp-field">
                    <span className="au-stamp-label">Most Used Last</span>
                    <div className="au-stamp-box">
                      {roundStats.mostCommonLastTileFlipped && (
                        <span className="au-stamp-overlay">
                          {formatTileName(roundStats.mostCommonLastTileFlipped)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
