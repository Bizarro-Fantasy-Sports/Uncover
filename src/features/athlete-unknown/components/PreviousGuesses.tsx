import React from "react";
import {
  calculateLevenshteinDistance,
  normalize,
} from "@/features/athlete-unknown/utils";
import { GUESS_ACCURACY } from "@/features/athlete-unknown/config";

interface PreviousGuessesProps {
  guesses: string[];
  correctName: string;
}

export function PreviousGuesses({
  guesses,
  correctName,
}: PreviousGuessesProps): React.ReactElement | null {
  if (guesses.length === 0) {
    return null;
  }

  // Only show the last 4 guesses
  const displayedGuesses = guesses.slice(-2);

  return (
    <div className="au-previous-guesses">
      {displayedGuesses.map((guess, index) => {
        const distance = calculateLevenshteinDistance(
          normalize(guess),
          normalize(correctName)
        );
        const isCorrect = distance === 0;
        const isClose = distance <= GUESS_ACCURACY.VERY_CLOSE_DISTANCE;

        return (
          <div
            key={index}
            className={`au-previous-guess ${isCorrect ? "au-previous-guess--correct" : isClose ? "au-previous-guess--close" : ""}`}
            data-tooltip={
              isClose
                ? `Spelling is off by ${distance} letter${distance !== 1 ? "s" : ""}!`
                : ""
            }
          >
            {guess}
          </div>
        );
      })}
    </div>
  );
}
