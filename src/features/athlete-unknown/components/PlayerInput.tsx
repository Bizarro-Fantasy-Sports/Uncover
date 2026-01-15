import React from "react";

interface PlayerInputProps {
  playerName: string;
  isCompleted: boolean;
  onPlayerNameChange: (name: string) => void;
}

export function PlayerInput({
  playerName,
  isCompleted,
  onPlayerNameChange,
}: PlayerInputProps): React.ReactElement {
  return (
    <div className="au-player-input">
      <input
        type="text"
        placeholder="Enter player name..."
        value={playerName}
        disabled={isCompleted}
        onChange={(e) => onPlayerNameChange(e.target.value)}
      />
    </div>
  );
}
