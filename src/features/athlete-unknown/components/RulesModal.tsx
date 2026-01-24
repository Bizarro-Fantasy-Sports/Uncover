import React, { useState, useEffect } from "react";
import {
  INCORRECT_GUESS_PENALTY,
  INITIAL_SCORE,
} from "@/features/athlete-unknown/config";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Split prologue into pages (each page is an array of paragraphs)
const PROLOGUE_PAGES = [
  [
    'Rain pounded the glass of my office window when there was a knock at the door. "BANG, BANG!"',
    '"What brings you here, Commissioner? Woj bomb?", I chuckled as he entered.',
    "He ignored my quip. \"The Tanking Syndicate stole our signs and hacked the Hall of Records. Wiped athlete identities clean. Now half of Statsland can't remember who their favorite players are anymore. It's chaos.\"",
    '"Looks like you\'re on the brink of an epic collapse, Commish," I responded.',
  ],
  [
    '"Off-the-field issues aside," he said, glancing at my bottle of whiskey. "Your talent is off the charts. Frankly, you know the game better than anyone in my front office."',
    "He dropped a stack of case files on my desk as thick as an NFL playbook. I filpped through the files. I looked at the clock.",
    '"Statsland\'s running out of time," I said. And it looks like you\'re all out of timeouts. Good thing comebacks are my calling card."',
  ],
  [
    "How to Play",
    "It's up to you to solve each day's mystery athlete! Strategically use clues to help solve the case with the highest score possible.",
    `Start with ${INITIAL_SCORE} points. Each clue deducts a different amount of points. Each incorrect guess is -${INCORRECT_GUESS_PENALTY} point${INCORRECT_GUESS_PENALTY === 1 ? "" : "s"}.`,
    "Play each day, build up your stats, and share with your friends! Good luck!",
  ],
];

function RulesModal({
  isOpen,
  onClose,
}: RulesModalProps): React.ReactElement | null {
  const [currentPage, setCurrentPage] = useState(0);
  const [displayedChars, setDisplayedChars] = useState(0);

  const currentPageText = PROLOGUE_PAGES[currentPage].join("\n\n");
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === PROLOGUE_PAGES.length - 1;
  const isPageComplete = displayedChars >= currentPageText.length;

  useEffect(() => {
    if (!isOpen) {
      setCurrentPage(0);
      setDisplayedChars(0);
      return;
    }

    if (displayedChars >= currentPageText.length) {
      return;
    }

    const timer = setTimeout(() => {
      setDisplayedChars((prev) => Math.min(prev + 1, currentPageText.length));
    }, 25);

    return () => clearTimeout(timer);
  }, [isOpen, displayedChars, currentPageText.length]);

  useEffect(() => {
    // index = 3 page is the How to Play. Render immediately
    if (currentPage === 3) {
      setDisplayedChars(currentPageText.length);
    }
  }, [currentPageText, setDisplayedChars, currentPage]);

  const handleNextPage = () => {
    if (!isPageComplete) {
      // Skip to end of current page
      setDisplayedChars(currentPageText.length);
    } else if (isLastPage) {
      onClose();
    } else if (!isLastPage) {
      // Go to next page
      setCurrentPage((prev) => prev + 1);
      setDisplayedChars(0);
    }
  };

  const handlePreviousPage = () => {
    if (!isFirstPage) {
      setCurrentPage((prev) => prev - 1);
      setDisplayedChars(0);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="au-rules-modal-overlay" onClick={onClose}>
      <div
        className="au-rules-modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="au-rules-notebook-paper">
          <div className="au-rules-prologue-container" onClick={handleNextPage}>
            {isLastPage ? (
              <div className="au-case-file-paper">
                <div className="au-paperclip"></div>
                <div className="au-fingerprint-smudge"></div>

                <div className="au-case-file-text-container">
                  <p
                    className={`au-rules-prologue au-rules-prologue-invisible au-how-to-play`}
                    aria-hidden="true"
                  >
                    {currentPageText}
                  </p>
                  <p className="au-rules-prologue au-rules-prologue-visible au-how-to-play">
                    {currentPageText.slice(0, displayedChars)}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <p
                  className="au-rules-prologue au-rules-prologue-invisible"
                  aria-hidden="true"
                >
                  {currentPageText}
                </p>
                <p className="au-rules-prologue au-rules-prologue-visible">
                  {currentPageText.slice(0, displayedChars)}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="au-notebook-footer">
          <button
            className={`au-prologue-nav-button ${isFirstPage ? "au-prologue-nav-button--hidden" : ""}`}
            onClick={handlePreviousPage}
          >
            Previous
          </button>
          <div className="au-page-indicator">
            {currentPage + 1} / {PROLOGUE_PAGES.length}
          </div>
          <button className={`au-prologue-nav-button`} onClick={handleNextPage}>
            {isPageComplete ? (isLastPage ? "Close" : "Next") : "Skip"}
          </button>
        </div>
      </div>
    </div>
  );
}

export { RulesModal };
