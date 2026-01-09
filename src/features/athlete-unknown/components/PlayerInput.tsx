import React from "react";

interface PlayerInputProps {
  playerName: string;
  isCompleted: boolean;
  onPlayerNameChange: (name: string) => void;
  onSubmit: () => void;
  onGiveUp: () => void;
}

export function PlayerInput({
  playerName,
  isCompleted,
  onPlayerNameChange,
  onSubmit,
  onGiveUp,
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
      {!isCompleted && (
        <button onClick={onGiveUp} className="give-up-button">
          Give Up
        </button>
      )}
    </div>
  );
}
