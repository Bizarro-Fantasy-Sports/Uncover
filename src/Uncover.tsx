import React, { useEffect, useState } from "react";
import "./Uncover.css";
import RulesModal from "./RulesModal";
import TodayStatsModal from "./TodayStatsModal";
import gameDataService from "./services/gameData";
import type { PlayerData as APIPlayerData, RoundStats, GameResult } from "./types/api";

const topics = [
  "Bio",
  "Player Information",
  "Draft Information",
  "Years Active",
  "Teams Played On",
  "Jersey Numbers",
  "Career Stats",
  "Personal Achievements",
  "Photo",
];

// Helper Function for Name Guessing
const lev = (a: string, b: string): number => {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= b.length; j++) {
    dp[0][j] = j;
  }
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
};

const normalize = (str = ""): string => str.toLowerCase().replace(/\s/g, "");

type SportType = "baseball" | "basketball" | "football";

// Round stats are now fetched from API/backend - no more hardcoded data

interface PlayerData {
  Name: string;
  Bio: string;
  "Player Information": string;
  "Draft Information": string;
  "Years Active": string;
  "Teams Played On": string;
  "Jersey Numbers": string;
  "Career Stats": string;
  "Personal Achievements": string;
  Photo: string[];
  dailyNumber?: number;
  [key: string]: string | string[] | number | undefined;
}

interface GameState {
  playersList: PlayerData[] | null;
  playerData: PlayerData | null;
  roundStats: RoundStats | null;
  playerName: string;
  message: string;
  messageType: string;
  previousCloseGuess: string;
  flippedTiles: boolean[];
  tilesFlippedCount: number;
  photoRevealed: boolean;
  returningFromPhoto: boolean;
  score: number;
  hint: string;
  finalRank: string;
  incorrectGuesses: number;
  showResultsModal: boolean;
  copiedText: string;
  lastSubmittedGuess: string;
  isLoading: boolean;
  error: string | null;
  firstTileFlipped: string | null;
  lastTileFlipped: string | null;
  gaveUp: boolean;
}

const initialState: GameState = {
  playersList: null,
  playerData: null,
  roundStats: null,
  playerName: "",
  message: "",
  messageType: "",
  previousCloseGuess: "",
  flippedTiles: Array(9).fill(false),
  tilesFlippedCount: 0,
  photoRevealed: false,
  returningFromPhoto: false,
  score: 100,
  hint: "",
  finalRank: "",
  incorrectGuesses: 0,
  showResultsModal: false,
  copiedText: "",
  lastSubmittedGuess: "",
  isLoading: true,
  error: null,
  firstTileFlipped: null,
  lastTileFlipped: null,
  gaveUp: false,
};

const Uncover: React.FC = () => {
  const [activeSport, setActiveSport] = useState<SportType>("baseball");
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isTodayStatsModalOpen, setIsTodayStatsModalOpen] = useState(false);

  const [gameState, setGameState] = useState<Record<SportType, GameState>>({
    baseball: { ...initialState },
    basketball: { ...initialState },
    football: { ...initialState },
  });

  // Helper function to update game state for active sport
  const updateState = (patch: Partial<GameState>) => {
    setGameState((prev) => ({
      ...prev,
      [activeSport]: { ...prev[activeSport], ...patch },
    }));
  };

  // Load player data and round stats from API
  useEffect(() => {
    const state = gameState[activeSport];

    // Already loaded → do nothing
    if (state.playerData && state.roundStats) {
      return;
    }

    // Load player data and round stats from API
    const loadData = async () => {
      try {
        updateState({ isLoading: true, error: null });

        // Fetch both player data and round stats in parallel
        const [playerData, roundStats] = await Promise.all([
          gameDataService.getPlayerData(activeSport),
          gameDataService.getRoundStats(activeSport),
        ]);

        updateState({
          playerData,
          roundStats,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        console.error("Error loading game data:", error);
        updateState({
          error: error instanceof Error ? error.message : "Failed to load game data",
          isLoading: false,
        });
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSport]); // gameState intentionally excluded to prevent infinite re-renders

  // Submit game results when player wins
  useEffect(() => {
    const submitResults = async () => {
      const state = gameState[activeSport];

      // Only submit if game is won and we haven't submitted yet
      if (!state.finalRank || !state.playerData || !state.roundStats) {
        return;
      }

      // Check if already submitted (you might want to track this in localStorage)
      const submissionKey = `submitted_${activeSport}_${state.playerData.playDate || state.roundStats.playDate}`;
      if (localStorage.getItem(submissionKey)) {
        return; // Already submitted
      }

      try {
        const playDate = (state.playerData.playDate || state.roundStats.playDate || new Date().toISOString().split('T')[0]) as string;

        const gameResult: GameResult = {
          userId: "temp_user_123", // TODO: Replace with actual user ID from auth
          sport: activeSport,
          playDate,
          playerName: state.playerData.Name,
          score: state.score,
          tilesFlipped: state.tilesFlippedCount,
          incorrectGuesses: state.incorrectGuesses,
          flippedTilesPattern: state.flippedTiles,
          firstTileFlipped: state.firstTileFlipped || undefined,
          lastTileFlipped: state.lastTileFlipped || undefined,
          completed: true,
          completedAt: new Date().toISOString(),
          rank: state.finalRank,
        };

        console.log('[Game] Submitting game results:', gameResult);
        const response = await gameDataService.submitGameResults(gameResult);

        if (response?.success) {
          console.log('[Game] Results submitted successfully');
          localStorage.setItem(submissionKey, 'true');

          // Optionally update round stats if backend returns updated stats
          if (response.roundStats) {
            updateState({ roundStats: response.roundStats });
          }
        }
      } catch (error) {
        console.error('[Game] Failed to submit results:', error);
        // Don't block the user experience if submission fails
      }
    };

    submitResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState[activeSport].finalRank, activeSport]);

  const s = gameState[activeSport];

  // Show loading state
  if (s.isLoading) {
    return (
      <div className="uncover-game">
        <p>Loading player data and round statistics...</p>
      </div>
    );
  }

  // Show error state
  if (s.error) {
    return (
      <div className="uncover-game">
        <div className="error-message">
          <p>Error: {s.error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Ensure data is loaded
  if (!s.playerData || !s.roundStats) {
    return (
      <div className="uncover-game">
        <p>Loading game data...</p>
      </div>
    );
  }

  const evaluateRank = (points: number): string => {
    if (points >= 95) {
      return "Amazing";
    }
    if (points >= 90) {
      return "Elite";
    }
    if (points >= 80) {
      return "Solid";
    }
    return "";
  };

  const handleNameSubmit = () => {
    // Don't allow empty guesses
    if (!s.playerName.trim()) {
      return;
    }

    const playerData = s.playerData!;
    const a = normalize(s.playerName);
    const b = normalize(playerData.Name);
    const distance = lev(a, b);

    // If game is already won, only allow reopening modal with correct answer
    if (s.finalRank) {
      if (a === b) {
        updateState({ showResultsModal: true });
      }
      return;
    }

    // Prevent submitting the same incorrect guess consecutively
    // Only block if there was a previous guess (lastSubmittedGuess is not empty)
    if (a !== b && s.lastSubmittedGuess && a === s.lastSubmittedGuess) {
      return;
    }

    if (a === b) {
      const rank = evaluateRank(s.score);
      updateState({
        message: "You guessed it right!",
        messageType: "success",
        previousCloseGuess: "",
        finalRank: rank,
        hint: "",
        showResultsModal: true,
        lastSubmittedGuess: a,
      });
      return;
    }

    const newScore = s.score - 2;
    let newHint = s.hint;

    if (newScore < 80 && !s.hint) {
      newHint = playerData.Name.split(" ")
        .map((w) => w[0])
        .join(".");
    }

    if (distance <= 2) {
      if (s.previousCloseGuess && s.previousCloseGuess !== a) {
        updateState({
          message: `Correct, you were close! Player's name: ${playerData.Name}`,
          messageType: "close",
          previousCloseGuess: "",
          score: newScore,
          hint: newHint,
          lastSubmittedGuess: a,
        });
      } else {
        updateState({
          message: "You're close! Off by a few letters.",
          messageType: "almost",
          previousCloseGuess: a,
          score: newScore,
          hint: newHint,
          lastSubmittedGuess: a,
        });
      }
      return;
    }

    if (distance <= 4) {
      updateState({
        message: `Correct, you were close! Player's name: ${playerData.Name}`,
        messageType: "close",
        previousCloseGuess: "",
        score: newScore,
        hint: newHint,
        lastSubmittedGuess: a,
      });
      return;
    }

    updateState({
      message: `Wrong guess: "${s.playerName}"`,
      messageType: "error",
      score: newScore,
      hint: newHint,
      incorrectGuesses: s.incorrectGuesses + 1,
      lastSubmittedGuess: a,
    });
  };

  // Helper to convert topic index to camelCase name for tracking
  const getTileName = (index: number): string => {
    return topics[index].replace(/\s+/g, '').replace(/^(.)/, (m) => m.toLowerCase());
  };

  const handleGiveUp = () => {
    updateState({
      gaveUp: true,
      finalRank: "",
      showResultsModal: true,
    });
  };

  const getSportsReferenceUrl = (sport: SportType, path: string): string => {
    const baseUrls: Record<SportType, string> = {
      baseball: "https://www.baseball-reference.com/players/",
      basketball: "https://www.basketball-reference.com/players/",
      football: "https://www.pro-football-reference.com/players/",
    };

    const extensions: Record<SportType, string> = {
      baseball: ".shtml",
      basketball: ".html",
      football: ".htm",
    };

    return baseUrls[sport] + path + extensions[sport];
  };

  const handleTileClick = (index: number) => {
    // If photo is already revealed, allow clicking to toggle back
    if (s.photoRevealed) {
      updateState({ photoRevealed: false, returningFromPhoto: true });
      // Clear the returningFromPhoto flag after the flip animation completes
      setTimeout(() => {
        updateState({ returningFromPhoto: false });
      }, 650);
      return;
    }

    // If clicking an already-flipped Photo tile, reveal the photo again
    if (s.flippedTiles[index] && topics[index] === "Photo") {
      updateState({ photoRevealed: true, returningFromPhoto: false });
      return;
    }

    if (s.flippedTiles[index]) {
      return;
    }

    // Track first and last tiles flipped
    const tileName = getTileName(index);
    const isFirstTile = s.tilesFlippedCount === 0;
    const firstTile = isFirstTile ? tileName : s.firstTileFlipped;

    // If Photo tile is clicked for the first time, reveal the photo puzzle immediately
    if (topics[index] === "Photo") {
      const updated = [...s.flippedTiles];
      updated[index] = true;

      // Only update score/counters if game is not won or gave up
      if (!s.finalRank && !s.gaveUp) {
        let newScore = s.score - 6;

        let newHint = s.hint;
        if (newScore < 80 && !s.hint) {
          newHint = s
            .playerData!.Name.split(" ")
            .map((w) => w[0])
            .join(".");
        }

        updateState({
          flippedTiles: updated,
          tilesFlippedCount: s.tilesFlippedCount + 1,
          score: newScore,
          hint: newHint,
          photoRevealed: true,
          returningFromPhoto: false,
          firstTileFlipped: firstTile,
          lastTileFlipped: tileName,
        });
      } else {
        // Game won or gave up - just update visual state
        updateState({
          flippedTiles: updated,
          photoRevealed: true,
          returningFromPhoto: false,
        });
      }
      return;
    }

    // Regular tile flip
    const updated = [...s.flippedTiles];
    updated[index] = true;

    // Only update score/counters if game is not won or gave up
    if (!s.finalRank && !s.gaveUp) {
      let newScore = s.score - 3;

      let newHint = s.hint;
      if (newScore < 80 && !s.hint) {
        newHint = s
          .playerData!.Name.split(" ")
          .map((w) => w[0])
          .join(".");
      }

      updateState({
        flippedTiles: updated,
        tilesFlippedCount: s.tilesFlippedCount + 1,
        score: newScore,
        hint: newHint,
        firstTileFlipped: firstTile,
        lastTileFlipped: tileName,
      });
    } else {
      // Game won or gave up - just update visual state
      updateState({
        flippedTiles: updated,
      });
    }
  };

  const photoUrl = s.playerData.Photo?.[0] || '';

  // Calculate background position for photo segments (3x3 grid)
  const getPhotoSegmentStyle = (index: number): React.CSSProperties => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const xPos = col * 150; // tile width
    const yPos = row * 150; // tile height

    return {
      backgroundImage: `url(${photoUrl})`,
      backgroundPosition: `-${xPos}px -${yPos}px`,
    };
  };

  const handleShare = () => {
    // Get daily number from playerData or default to 1
    const dailyNumber = s.playerData!.dailyNumber || 1;

    // Build the share text
    let shareText = `Daily Uncover #${dailyNumber}\n`;

    // Create a 3x3 grid using emojis
    for (let i = 0; i < 9; i++) {
      // Yellow emoji for flipped, blue emoji for unflipped
      shareText += s.flippedTiles[i] ? "🟨" : "🟦";
      // Add newline after every 3 tiles (end of row)
      if ((i + 1) % 3 === 0) {
        shareText += "\n";
      }
    }

    // Add score at the end
    shareText += `Score: ${s.score}`;

    // Copy to clipboard
    navigator.clipboard
      .writeText(shareText)
      .then(() => {
        // Show what was copied
        updateState({ copiedText: shareText });
        // Clear the message after 3 seconds
        setTimeout(() => {
          updateState({ copiedText: "" });
        }, 3000);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  return (
    <div className="uncover-game">
      <div className="sports-section">
        <div className="sports-navbar">
          {(["baseball", "basketball", "football"] as SportType[]).map(
            (sport) => (
              <div
                key={sport}
                className={`nav-tab ${activeSport === sport ? "active" : ""}`}
                onClick={() => setActiveSport(sport)}
              >
                {sport.toUpperCase()}
              </div>
            )
          )}
        </div>
      </div>

      <div className="puzzle-info">
        <span className="puzzle-number">Puzzle #__</span>
        <span className="separator">•</span>
        <button
          className="today-stats-link"
          onClick={() => setIsTodayStatsModalOpen(true)}
        >
          Today's Stats
        </button>
        <span className="separator">•</span>
        <button
          className="rules-link"
          onClick={() => setIsRulesModalOpen(true)}
        >
          Rules
        </button>
      </div>

      <div className="score-and-messages">
        <div className="score-section">
          <p className="score-label">Score</p>
          <div className="score-box">{s.score}</div>
        </div>

        <div className="messages-section">
          {s.message && (
            <p className={`guess-message ${s.messageType}`}>{s.message}</p>
          )}
          {s.hint && !s.finalRank && (
            <p className="guess-message hint">
              Hint: Player Initials — {s.hint}
            </p>
          )}
          {s.finalRank && (
            <p className="final-rank">Your Rank: {s.finalRank}</p>
          )}
        </div>
      </div>

      <div className="stats-container">
        <h3>Tiles Flipped: {s.tilesFlippedCount}</h3>
        <h3>Incorrect Guesses: {s.incorrectGuesses}</h3>
      </div>

      <div className="player-input">
        <input
          type="text"
          placeholder="Enter player name..."
          value={s.playerName}
          onChange={(e) => updateState({ playerName: e.target.value })}
        />
        <button onClick={handleNameSubmit} disabled={!s.playerName.trim()}>
          Submit
        </button>
        {s.score < 80 && !s.finalRank && !s.gaveUp && (
          <button onClick={handleGiveUp} className="give-up-button">
            Give Up
          </button>
        )}
        {(s.gaveUp || s.finalRank) && (
          <button
            onClick={() => updateState({ showResultsModal: true })}
            className="view-results-button"
          >
            View Results
          </button>
        )}
      </div>

      <div className="grid">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="tile"
            onClick={() => handleTileClick(index)}
          >
            <div
              className={`tile-inner ${
                s.photoRevealed
                  ? "photo-reveal"
                  : s.returningFromPhoto
                    ? s.flippedTiles[index]
                      ? "flipped no-slide-anim returning-from-photo"
                      : "returning-from-photo"
                    : s.flippedTiles[index]
                      ? "flipped"
                      : ""
              }`}
            >
              <div className="tile-front">{topic}</div>
              <div
                className={`tile-back ${s.photoRevealed ? "photo-segment" : ""}`}
                style={s.photoRevealed ? getPhotoSegmentStyle(index) : {}}
              >
                {!s.photoRevealed &&
                  (topic === "Photo" ? (
                    <img
                      src={photoUrl}
                      alt="Player"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    s.playerData![topic]
                  ))}
                {s.photoRevealed && index === 2 && (
                  <div className="flip-back-arrow">↻</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {s.showResultsModal && (
        <div
          className="results-modal"
          onClick={() => updateState({ showResultsModal: false })}
        >
          <div
            className="results-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-results"
              onClick={() => updateState({ showResultsModal: false })}
            >
              ✕
            </button>
            <h2 className="results-title">
              {s.gaveUp
                ? "Try Again Tomorrow!"
                : `Correct! Your score is ${s.score}!`}
            </h2>
            {!s.gaveUp && s.roundStats && (
              <p className="average-score">
                The average score today is {s.roundStats.averageScore}
              </p>
            )}

            <div className="results-grid">
              {topics.map((topic, index) => (
                <div
                  key={index}
                  className={`results-tile ${s.flippedTiles[index] ? "flipped" : "unflipped"}`}
                >
                  {s.flippedTiles[index] ? "↻" : ""}
                </div>
              ))}
            </div>

            <button className="share-button" onClick={handleShare}>
              Share
            </button>

            {s.copiedText && (
              <div className="copied-message">
                <pre>{s.copiedText}</pre>
                <p>has been copied</p>
              </div>
            )}

            {s.roundStats && (
              <div className="round-stats-section">
                <h3>Today's Round Stats</h3>
                <div className="round-stats-grid">
                  <div className="round-stat-item">
                    <div className="round-stat-label">Games Played</div>
                    <div className="round-stat-value">
                      {s.roundStats.totalPlays}
                    </div>
                  </div>
                  <div className="round-stat-item">
                    <div className="round-stat-label">Average Score</div>
                    <div className="round-stat-value">
                      {s.roundStats.averageScore}
                    </div>
                  </div>
                  <div className="round-stat-item">
                    <div className="round-stat-label">Win Rate</div>
                    <div className="round-stat-value">
                      {s.roundStats.percentageCorrect}%
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {s.roundStats && (
        <TodayStatsModal
          isOpen={isTodayStatsModalOpen}
          onClose={() => setIsTodayStatsModalOpen(false)}
          roundStats={{
            ...s.roundStats,
            name:
              s.finalRank || s.gaveUp
                ? s.playerData?.Name || "Unknown Player"
                : "???",
          }}
        />
      )}
    </div>
  );
};

export default Uncover;
export { lev };
