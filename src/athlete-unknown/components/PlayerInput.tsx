import React from "react";

interface PlayerInputProps {
  playerName: string;
  score: number;
  finalRank: string;
  gaveUp: boolean;
  onPlayerNameChange: (name: string) => void;
  onSubmit: () => void;
  onGiveUp: () => void;
  onViewResults: () => void;
}

export const PlayerInput: React.FC<PlayerInputProps> = ({
  playerName,
  score,
  finalRank,
  gaveUp,
  onPlayerNameChange,
  onSubmit,
  onGiveUp,
  onViewResults,
}) => {
  return (
    <div className="player-input">
      <input
        type="text"
        placeholder="Enter player name..."
        value={playerName}
        onChange={(e) => onPlayerNameChange(e.target.value)}
      />
      <button onClick={onSubmit} disabled={!playerName.trim()}>
        Submit
      </button>
      {score < 80 && !finalRank && !gaveUp && (
        <button onClick={onGiveUp} className="give-up-button">
          Give Up
        </button>
      )}
      {(gaveUp || finalRank) && (
        <button onClick={onViewResults} className="view-results-button">
          View Results
        </button>
      )}
    </div>
  );
};
