import React, { useEffect, useState } from "react";
import "./Uncover.css";
import RulesModal from "./RulesModal";
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

// New data structure interfaces
interface Player {
  sport: string;
  sportsReferencePath: string;
  name: string;
  bio: string;
  playerInformation: string;
  draftInformation: string;
  yearsActive: string;
  teamsPlayedOn: string;
  jerseyNumbers: string;
  careerStats: string;
  personalAchievements: string;
  photo: string;
}

interface TileTracker {
  bio: number;
  careerStats: number;
  draftInformation: number;
  jerseyNumbers: number;
  personalAchievements: number;
  photo: number;
  playerInformation: number;
  teamsPlayedOn: number;
  yearsActive: number;
}

interface RoundStats {
  playDate: string;
  sport: string;
  name: string;
  totalPlays: number;
  percentageCorrect: number;
  averageScore: number;
  averageCorrectScore: number;
  highestScore: number;
  mostCommonFirstTileFlipped: string;
  mostCommonLastTileFlipped: string;
  mostCommonTileFlipped: string;
  leastCommonTileFlipped: string;
  mostFlippedTracker: TileTracker;
  firstFlippedTracker: TileTracker;
  lastFlippedTracker: TileTracker;
}

interface RoundData {
  playDate: string;
  sport: string;
  roundId: string;
  created: string;
  lastUpdated: string;
  previouslyPlayedDates: string[];
  player: Player;
  stats: RoundStats;
}

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
  roundData: RoundData | null;
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
  gaveUp: boolean;
}

const initialState: GameState = {
  playersList: null,
  playerData: null,
  roundData: null,
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
  gaveUp: false,
};

// Helper function to extract puzzle number from roundId
const getPuzzleNumber = (roundId: string): string => {
  const match = roundId.match(/\d+$/);
  return match ? match[0] : "1";
};

// Helper function to format date as mm-dd-yy
const formatDateMMDDYY = (dateString: string): string => {
  const [year, month, day] = dateString.split("-");
  const shortYear = year.slice(-2);
  return `${month}-${day}-${shortYear}`;
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

  // Load players JSON sequentially
  useEffect(() => {
    const state = gameState[activeSport];

    // Already loaded → do nothing
    if (state.playersList && state.playerData && state.roundData) {
      return;
    }

    // Load once
    fetch(sportFiles[activeSport])
      .then((res) => res.json())
      .then((data: RoundData[]) => {
        const key = `playerIndex_${activeSport}`;
        const storedIndex = parseInt(localStorage.getItem(key) || "0");

        const index = storedIndex % data.length;
        const roundData = data[index];

        // Transform Player object to PlayerData format
        const playerData: PlayerData = {
          Name: roundData.player.name,
          Bio: roundData.player.bio,
          "Player Information": roundData.player.playerInformation,
          "Draft Information": roundData.player.draftInformation,
          "Years Active": roundData.player.yearsActive,
          "Teams Played On": roundData.player.teamsPlayedOn,
          "Jersey Numbers": roundData.player.jerseyNumbers,
          "Career Stats": roundData.player.careerStats,
          "Personal Achievements": roundData.player.personalAchievements,
          Photo: [roundData.player.photo],
        };

        localStorage.setItem(key, ((index + 1) % data.length).toString());

        setGameState((prev) => ({
          ...prev,
          [activeSport]: {
            ...prev[activeSport],
            playersList: data.map((round) => ({
              Name: round.player.name,
              Bio: round.player.bio,
              "Player Information": round.player.playerInformation,
              "Draft Information": round.player.draftInformation,
              "Years Active": round.player.yearsActive,
              "Teams Played On": round.player.teamsPlayedOn,
              "Jersey Numbers": round.player.jerseyNumbers,
              "Career Stats": round.player.careerStats,
              "Personal Achievements": round.player.personalAchievements,
              Photo: [round.player.photo],
            })),
            playerData,
            roundData,
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
      });
    } else {
      // Game won or gave up - just update visual state
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
    // Get puzzle number from roundData
    const puzzleNumber = s.roundData
      ? getPuzzleNumber(s.roundData.roundId)
      : "1";
    const sportName =
      activeSport.charAt(0).toUpperCase() + activeSport.slice(1);

    // Build the share text
    let shareText = `Daily Athlete Unknown ${sportName} #${puzzleNumber}\n`;

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
        <span className="puzzle-number">
          Puzzle #{s.roundData ? getPuzzleNumber(s.roundData.roundId) : "..."}
        </span>
        <span className="separator">•</span>
        <span className="play-date">
          {s.roundData ? formatDateMMDDYY(s.roundData.playDate) : "..."}
        </span>
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
            {!s.gaveUp && s.roundData && (
              <p className="average-score">
                The average score today is {s.roundData.stats.averageScore}
              </p>
            )}

            {s.playerData && s.roundData && (
              <div className="player-info-section">
                <a
                  href={getSportsReferenceUrl(
                    activeSport,
                    s.roundData.player.sportsReferencePath
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="player-name-link"
                >
                  {s.playerData.Name}
                </a>
                {s.roundData.player.photo && (
                  <img
                    src={s.roundData.player.photo}
                    alt={s.playerData.Name}
                    className="player-photo"
                  />
                )}
              </div>
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

            {s.roundData && (
              <div className="round-stats-section">
                <h3>Today's Round Stats</h3>
                <div className="round-stats-grid">
                  <div className="round-stat-item">
                    <div className="round-stat-label">Games Played</div>
                    <div className="round-stat-value">
                      {s.roundData.stats.totalPlays}
                    </div>
                  </div>
                  <div className="round-stat-item">
                    <div className="round-stat-label">Average Score</div>
                    <div className="round-stat-value">
                      {s.roundData.stats.averageScore}
                    </div>
                  </div>
                  <div className="round-stat-item">
                    <div className="round-stat-label">Win Rate</div>
                    <div className="round-stat-value">
                      {s.roundData.stats.percentageCorrect}%
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

      {s.roundData && (
        <TodayStatsModal
          isOpen={isTodayStatsModalOpen}
          onClose={() => setIsTodayStatsModalOpen(false)}
          roundStats={{
            ...s.roundData.stats,
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
