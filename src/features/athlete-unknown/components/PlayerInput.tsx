import React from "react";

interface PlayerInputProps {
  playerName: string;
  score: number;
  isCompleted: boolean;
  onPlayerNameChange: (name: string) => void;
  onSubmit: () => void;
  onGiveUp: () => void;
  onViewResults: () => void;
}

export function PlayerInput({
  playerName,
  score,
  isCompleted,
  onPlayerNameChange,
  onSubmit,
  onGiveUp,
  onViewResults,
}: PlayerInputProps): React.ReactElement {
  return (
    <div className="player-input">
      <input
        type="text"
        placeholder="Enter player name..."
        value={playerName}
        disabled={isCompleted}
        onChange={(e) => onPlayerNameChange(e.target.value)}
      />
      {!isCompleted && (
        <button onClick={onSubmit} disabled={!playerName.trim()}>
          Submit
        </button>
      )}
      {score < 80 && !isCompleted && (
        <button onClick={onGiveUp} className="give-up-button">
          Give Up
        </button>
      )}
      {isCompleted && (
        <button onClick={onViewResults} className="view-results-button">
          View Results
        </button>
      )}
    </div>
  );
}
