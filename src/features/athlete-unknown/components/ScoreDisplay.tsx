import React from "react";

interface ScoreDisplayProps {
  score: number;
}

export function ScoreDisplay({ score }: ScoreDisplayProps): React.ReactElement {
  return (
    <div className="au-score-container">
      <div className="au-score">
        <div className="au-score-box">
          <p>{score}</p>
        </div>
        <p className="au-score-label">Score</p>
      </div>
    </div>
  );
}
