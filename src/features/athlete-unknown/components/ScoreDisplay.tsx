import React from "react";

interface ScoreDisplayProps {
  score: number;
  message?: string;
  messageType?: string;
  hint?: string;
  isCompleted: boolean;
  tilesFlipped: number;
  incorrectGuesses: number;
}

export function ScoreDisplay({
  score,
  message,
  messageType,
  hint,
  isCompleted,
  tilesFlipped,
  incorrectGuesses,
}: ScoreDisplayProps): React.ReactElement {
  return (
    <div>
      <div className="score-and-messages">
        <div className="score-section">
          <p className="score-label">Score</p>
          <div className="score-box">{score}</div>
        </div>

        <div className="messages-section">
          {message && (
            <p className={`guess-message ${messageType}`}>{message}</p>
          )}
          {hint && !isCompleted && (
            <p className="guess-message hint">Hint: Player Initials — {hint}</p>
          )}
        </div>
      </div>
      <div className="stats-container">
        <h3>Tiles Flipped: {tilesFlipped}</h3>
        <h3>Incorrect Guesses: {incorrectGuesses}</h3>
      </div>
    </div>
  );
}
