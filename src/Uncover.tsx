import React, { useEffect, useState } from "react";
import "./Uncover.css";
import TodayStatsModal from "./TodayStatsModal";

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

const sportFiles: Record<SportType, string> = {
  baseball: "/UncoverBaseballData.json",
  basketball: "/UncoverBasketballData.json",
  football: "/UncoverFootballData.json",
};

// Mock Round Stats data (will be fetched from backend later)
// Note: name field will be populated dynamically from player data
const mockRoundStatsTemplate: Record<SportType, any> = {
  baseball: {
    playDate: "2025-11-19",
    sport: "baseball",
    totalPlays: 100,
    percentageCorrect: 81,
    averageScore: 55,
    averageCorrectScore: 88,
    highestScore: 97,
    mostCommonFirstTileFlipped: "playerInformation",
    mostCommonLastTileFlipped: "photo",
    mostCommonTileFlipped: "teamsPlayedOn",
    leastCommonTileFlipped: "bio",
    mostFlippedTracker: {
      bio: 11,
      careerStats: 11,
      draftInformation: 11,
      jerseyNumbers: 11,
      personalAchievements: 11,
      photo: 11,
      playerInformation: 11,
      teamsPlayedOn: 11,
      yearsActive: 11,
    },
    firstFlippedTracker: {
      bio: 12,
      careerStats: 12,
      draftInformation: 12,
      jerseyNumbers: 12,
      personalAchievements: 12,
      photo: 12,
      playerInformation: 12,
      teamsPlayedOn: 12,
      yearsActive: 12,
    },
    lastFlippedTracker: {
      bio: 13,
      careerStats: 13,
      draftInformation: 13,
      jerseyNumbers: 13,
      personalAchievements: 13,
      photo: 13,
      playerInformation: 13,
      teamsPlayedOn: 13,
      yearsActive: 13,
    },
  },
  basketball: {
    playDate: "2025-11-19",
    sport: "basketball",
    totalPlays: 100,
    percentageCorrect: 88,
    averageScore: 66,
    averageCorrectScore: 90,
    highestScore: 97,
    mostCommonFirstTileFlipped: "playerInformation",
    mostCommonLastTileFlipped: "photo",
    mostCommonTileFlipped: "teamsPlayedOn",
    leastCommonTileFlipped: "bio",
    mostFlippedTracker: {
      bio: 21,
      careerStats: 21,
      draftInformation: 21,
      jerseyNumbers: 21,
      personalAchievements: 21,
      photo: 21,
      playerInformation: 21,
      teamsPlayedOn: 21,
      yearsActive: 21,
    },
    firstFlippedTracker: {
      bio: 22,
      careerStats: 22,
      draftInformation: 22,
      jerseyNumbers: 22,
      personalAchievements: 22,
      photo: 22,
      playerInformation: 22,
      teamsPlayedOn: 22,
      yearsActive: 22,
    },
    lastFlippedTracker: {
      bio: 23,
      careerStats: 23,
      draftInformation: 23,
      jerseyNumbers: 23,
      personalAchievements: 23,
      photo: 23,
      playerInformation: 23,
      teamsPlayedOn: 23,
      yearsActive: 23,
    },
  },
  football: {
    playDate: "2025-11-19",
    sport: "football",
    totalPlays: 100,
    percentageCorrect: 90,
    averageScore: 77,
    averageCorrectScore: 90,
    highestScore: 98,
    mostCommonFirstTileFlipped: "playerInformation",
    mostCommonLastTileFlipped: "photo",
    mostCommonTileFlipped: "teamsPlayedOn",
    leastCommonTileFlipped: "bio",
    mostFlippedTracker: {
      bio: 31,
      careerStats: 31,
      draftInformation: 31,
      jerseyNumbers: 31,
      personalAchievements: 31,
      photo: 31,
      playerInformation: 31,
      teamsPlayedOn: 31,
      yearsActive: 31,
    },
    firstFlippedTracker: {
      bio: 32,
      careerStats: 32,
      draftInformation: 32,
      jerseyNumbers: 32,
      personalAchievements: 32,
      photo: 32,
      playerInformation: 32,
      teamsPlayedOn: 32,
      yearsActive: 32,
    },
    lastFlippedTracker: {
      bio: 33,
      careerStats: 33,
      draftInformation: 33,
      jerseyNumbers: 33,
      personalAchievements: 33,
      photo: 33,
      playerInformation: 33,
      teamsPlayedOn: 33,
      yearsActive: 33,
    },
  },
};

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
}

const initialState: GameState = {
  playersList: null,
  playerData: null,
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
};

const Uncover: React.FC = () => {
  const [activeSport, setActiveSport] = useState<SportType>("baseball");
  const [isTodayStatsModalOpen, setIsTodayStatsModalOpen] = useState(false);

  const [gameState, setGameState] = useState<Record<SportType, GameState>>({
    baseball: { ...initialState },
    basketball: { ...initialState },
    football: { ...initialState },
  });

  // Load players JSON sequentially
  useEffect(() => {
    const state = gameState[activeSport];

    // Already loaded → do nothing
    if (state.playersList && state.playerData) {
      return;
    }

    // Load once
    fetch(sportFiles[activeSport])
      .then((res) => res.json())
      .then((data: PlayerData[]) => {
        const key = `playerIndex_${activeSport}`;
        const storedIndex = parseInt(localStorage.getItem(key) || "0");

        const index = storedIndex % data.length;
        const playerData = data[index];

        localStorage.setItem(key, ((index + 1) % data.length).toString());

        setGameState((prev) => ({
          ...prev,
          [activeSport]: {
            ...prev[activeSport],
            playersList: data,
            playerData,
          },
        }));
      })
      .catch((error) => {
        console.error("Error loading player data:", error);
        // Keep showing loading state if fetch fails
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSport]); // gameState intentionally excluded to prevent infinite re-renders

  const s = gameState[activeSport];
  if (!s.playerData) {
    return <p>Loading player data...</p>;
  }

  const updateState = (patch: Partial<GameState>) => {
    setGameState((prev) => ({
      ...prev,
      [activeSport]: { ...prev[activeSport], ...patch },
    }));
  };

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

    if (newScore < 70 && !s.hint) {
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

    // If Photo tile is clicked for the first time, reveal the photo puzzle immediately
    if (topics[index] === "Photo") {
      const updated = [...s.flippedTiles];
      updated[index] = true;

      // Only update score/counters if game is not won
      if (!s.finalRank) {
        let newScore = s.score - 6;

        let newHint = s.hint;
        if (newScore < 70 && !s.hint) {
          newHint = s.playerData!.Name.split(" ")
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
        });
      } else {
        // Game won - just update visual state
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

    // Only update score/counters if game is not won
    if (!s.finalRank) {
      let newScore = s.score - 3;

      let newHint = s.hint;
      if (newScore < 70 && !s.hint) {
        newHint = s.playerData!.Name.split(" ")
          .map((w) => w[0])
          .join(".");
      }

      updateState({
        flippedTiles: updated,
        tilesFlippedCount: s.tilesFlippedCount + 1,
        score: newScore,
        hint: newHint,
      });
    } else {
      // Game won - just update visual state
      updateState({
        flippedTiles: updated,
      });
    }
  };

  const photoUrl = s.playerData.Photo[0];

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
      <div className="sports-navbar">
        {(["baseball", "basketball", "football"] as SportType[]).map((sport) => (
          <div
            key={sport}
            className={`nav-tab ${activeSport === sport ? "active" : ""}`}
            onClick={() => setActiveSport(sport)}
          >
            {sport.toUpperCase()}
          </div>
        ))}
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
        <button className="rules-link" disabled>
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
            <p className="guess-message hint">Hint: Player Initials — {s.hint}</p>
          )}
          {s.finalRank && <p className="final-rank">Your Rank: {s.finalRank}</p>}
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
            <h2 className="results-title">Correct! Your score is {s.score}!</h2>
            <p className="average-score">The average score today is 85</p>

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

            <div className="round-stats-section">
              <h3>Today's Round Stats</h3>
              <div className="round-stats-grid">
                <div className="round-stat-item">
                  <div className="round-stat-label">Games Played</div>
                  <div className="round-stat-value">{mockRoundStatsTemplate[activeSport].totalPlays}</div>
                </div>
                <div className="round-stat-item">
                  <div className="round-stat-label">Average Score</div>
                  <div className="round-stat-value">{mockRoundStatsTemplate[activeSport].averageScore}</div>
                </div>
                <div className="round-stat-item">
                  <div className="round-stat-label">Win Rate</div>
                  <div className="round-stat-value">{mockRoundStatsTemplate[activeSport].percentageCorrect}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <TodayStatsModal
        isOpen={isTodayStatsModalOpen}
        onClose={() => setIsTodayStatsModalOpen(false)}
        roundStats={{
          ...mockRoundStatsTemplate[activeSport],
          name: s.finalRank ? (s.playerData?.Name || "Unknown Player") : "???",
        }}
      />
    </div>
  );
};

export default Uncover;
export { lev };
