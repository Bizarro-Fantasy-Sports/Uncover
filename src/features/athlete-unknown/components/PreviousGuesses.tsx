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

  // Reverse to show most recent at top
  const reversedGuesses = [...guesses].reverse();
  const useMultiColumn = guesses.length > 4;

  return (
    <div
      className={`previous-guesses ${useMultiColumn ? "previous-guesses--multi-column" : ""}`}
    >
      {reversedGuesses.map((guess, index) => {
        const distance = calculateLevenshteinDistance(
          normalize(guess),
          normalize(correctName)
        );
        const isClose = distance <= GUESS_ACCURACY.VERY_CLOSE_DISTANCE;

        return (
          <div
            key={index}
            className={`previous-guess ${isClose ? "previous-guess--close" : ""}`}
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
