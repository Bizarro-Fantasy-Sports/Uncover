import React from "react";

interface GameStatsProps {
  tilesFlipped: number;
  incorrectGuesses: number;
}

export const GameStats: React.FC<GameStatsProps> = ({
  tilesFlipped,
  incorrectGuesses,
}) => {
  return (
    <div className="stats-container">
      <h3>Tiles Flipped: {tilesFlipped}</h3>
      <h3>Incorrect Guesses: {incorrectGuesses}</h3>
    </div>
  );
};
