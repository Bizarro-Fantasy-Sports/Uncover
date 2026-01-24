import React from "react";
import { PlayerInput } from "./PlayerInput";
import typewriterImage from "../assets/typewriter.png";
import { PreviousGuesses } from "./PreviousGuesses";

interface TypewriterProps {
  playerName: string;
  isCompleted: boolean;
  onPlayerNameChange: (name: string) => void;
  guesses: string[];
  correctName: string;
}

export function Typewriter({
  playerName,
  isCompleted,
  onPlayerNameChange,
  guesses,
  correctName,
}: TypewriterProps): React.ReactElement {
  return (
    <div className="au-typewriter">
      <img
        src={typewriterImage}
        alt="Typewriter"
        className="au-typewriter-image"
      />
      <div className="au-typewriter-paper">
        <PreviousGuesses guesses={guesses} correctName={correctName} />

        <PlayerInput
          playerName={playerName}
          isCompleted={isCompleted}
          onPlayerNameChange={onPlayerNameChange}
        />
      </div>
    </div>
  );
}
