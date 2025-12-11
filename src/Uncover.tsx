import React, { useEffect, useState } from "react";
import "./Uncover.css";
import RulesModal from "./RulesModal";
import TodayStatsModal from "./TodayStatsModal";
import {
  type SportType,
  TILE_TOPICS,
  TOTAL_TILES,
  DEFAULT_SPORT,
  SPORT_LIST,
  SPORTS,
  LEGACY_SPORT_FILES,
  SCORING,
  RANKS,
  GUESS_ACCURACY,
  TIMING,
  PHOTO_GRID,
  STORAGE_KEYS,
  DEFAULTS,
} from "./config";

const topics = TILE_TOPICS;

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
  currentPlayerIndex?: number;
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
  flippedTiles: Array(TOTAL_TILES).fill(false),
  tilesFlippedCount: 0,
  photoRevealed: false,
  returningFromPhoto: false,
  score: SCORING.INITIAL_SCORE,
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

// Guest session persistence utilities
const getGuestSessionKey = (sport: SportType): string => {
  return `guestSession_${sport}`;
};

const saveGuestSession = (sport: SportType, state: GameState, playerIndex?: number): void => {
  try {
    // Only save persistent game state (exclude transient UI state)
    const persistentState = {
      playerName: state.playerName,
      message: state.message,
      messageType: state.messageType,
      previousCloseGuess: state.previousCloseGuess,
      flippedTiles: state.flippedTiles,
      tilesFlippedCount: state.tilesFlippedCount,
      score: state.score,
      hint: state.hint,
      finalRank: state.finalRank,
      incorrectGuesses: state.incorrectGuesses,
      lastSubmittedGuess: state.lastSubmittedGuess,
      // Store player data identifier to verify it's the same puzzle
      playerName_saved: state.playerData?.Name || "",
      // Store player index so we can restore the same player
      playerIndex_saved: playerIndex,
    };
    localStorage.setItem(getGuestSessionKey(sport), JSON.stringify(persistentState));
  } catch (error) {
    console.error("Failed to save guest session:", error);
  }
};

const loadGuestSession = (sport: SportType, currentPlayerName: string): Partial<GameState> | null => {
  try {
    const saved = localStorage.getItem(getGuestSessionKey(sport));
    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);

    // Only restore if it's the same player/puzzle
    if (parsed.playerName_saved !== currentPlayerName) {
      // Different puzzle, clear old session
      clearGuestSession(sport);
      return null;
    }

    // Return only the game state fields (not the saved player name or index)
    // eslint-disable-next-line no-unused-vars
    const { playerName_saved, playerIndex_saved, ...gameStateFields } = parsed;
    return gameStateFields;
  } catch (error) {
    console.error("Failed to load guest session:", error);
    return null;
  }
};

const clearGuestSession = (sport: SportType): void => {
  try {
    localStorage.removeItem(getGuestSessionKey(sport));
  } catch (error) {
    console.error("Failed to clear guest session:", error);
  }
};

const clearAllGuestSessions = (): void => {
  SPORT_LIST.forEach(sport => clearGuestSession(sport));
};

const Uncover: React.FC = () => {
  // Restore previously active sport from localStorage, default to baseball
  const getInitialSport = (): SportType => {
    try {
      const saved = localStorage.getItem("activeSport");
      if (saved && (saved === SPORTS.BASEBALL || saved === SPORTS.BASKETBALL || saved === SPORTS.FOOTBALL)) {
        return saved as SportType;
      }
    } catch (error) {
      console.error("Failed to load active sport:", error);
    }
    return DEFAULT_SPORT;
  };

  const [activeSport, setActiveSport] = useState<SportType>(getInitialSport);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isTodayStatsModalOpen, setIsTodayStatsModalOpen] = useState(false);

  const [gameState, setGameState] = useState<Record<SportType, GameState>>({
    [SPORTS.BASEBALL]: { ...initialState },
    [SPORTS.BASKETBALL]: { ...initialState },
    [SPORTS.FOOTBALL]: { ...initialState },
  } as Record<SportType, GameState>);

  // Save active sport to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem("activeSport", activeSport);
    } catch (error) {
      console.error("Failed to save active sport:", error);
    }
  }, [activeSport]);

  // Load players JSON sequentially
  useEffect(() => {
    const state = gameState[activeSport];

    // Already loaded → do nothing
    if (state.playersList && state.playerData && state.roundData) {
      return;
    }

    // Load once
    fetch(LEGACY_SPORT_FILES[activeSport])
      .then((res) => res.json())
      .then((data: RoundData[]) => {
        const key = `${STORAGE_KEYS.PLAYER_INDEX_PREFIX}${activeSport}`;
        const storedIndex = parseInt(localStorage.getItem(key) || String(DEFAULTS.PLAYER_INDEX));

        // Check if there's a saved session to determine which player to load
        const savedSessionRaw = localStorage.getItem(getGuestSessionKey(activeSport));
        let playerIndex: number = storedIndex % data.length;
        let savedSession: Partial<GameState> | null = null;

        if (savedSessionRaw) {
          try {
            const parsed = JSON.parse(savedSessionRaw);
            // If session has a saved player index, use it to load the correct player
            if (parsed.playerIndex_saved !== undefined) {
              playerIndex = parsed.playerIndex_saved % data.length;
            }
          } catch (error) {
            console.error("Failed to parse saved session:", error);
          }
        }

        const roundData = data[playerIndex];

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

        // Try to load the saved session for this player
        savedSession = loadGuestSession(activeSport, playerData.Name);

        // Only increment player index if there's no saved session
        // This keeps the same puzzle when navigating within the app
        if (!savedSession) {
          localStorage.setItem(key, ((playerIndex + 1) % data.length).toString());
        }

        setGameState((prev) => {
          const newSportState = {
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
            // Restore saved session if available
            ...(savedSession || {}),
            // Store current player index for session saving
            currentPlayerIndex: playerIndex,
          };

          // Save the session immediately after loading (even if no user actions yet)
          // This ensures the same player loads when navigating back
          if (!savedSession) {
            saveGuestSession(activeSport, newSportState, playerIndex);
          }

          return {
            ...prev,
            [activeSport]: newSportState,
          };
        });
      })
      .catch((error) => {
        console.error("Error loading player data:", error);
        // Keep showing loading state if fetch fails
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSport]); // gameState intentionally excluded to prevent infinite re-renders

  // Clear guest sessions when window is closed
  useEffect(() => {
    const handleBeforeUnload = () => {
      clearAllGuestSessions();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  const s = gameState[activeSport];
  if (!s.playerData) {
    return <p>Loading player data...</p>;
  }

  const updateState = (patch: Partial<GameState>) => {
    setGameState((prev) => {
      const currentSportState = prev[activeSport];
      const newState = { ...currentSportState, ...patch };

      // Ensure currentPlayerIndex is preserved if not in the patch
      if (newState.currentPlayerIndex === undefined && currentSportState.currentPlayerIndex !== undefined) {
        newState.currentPlayerIndex = currentSportState.currentPlayerIndex;
      }

      // Save guest session after state update (with player index)
      saveGuestSession(activeSport, newState, newState.currentPlayerIndex);

      return {
        ...prev,
        [activeSport]: newState,
      };
    });
  };

  const evaluateRank = (points: number): string => {
    if (points >= RANKS.AMAZING.threshold) {
      return RANKS.AMAZING.label;
    }
    if (points >= RANKS.ELITE.threshold) {
      return RANKS.ELITE.label;
    }
    if (points >= RANKS.SOLID.threshold) {
      return RANKS.SOLID.label;
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

    const newScore = s.score - SCORING.INCORRECT_GUESS_PENALTY;
    let newHint = s.hint;

    if (newScore < SCORING.HINT_THRESHOLD && !s.hint) {
      newHint = playerData.Name.split(" ")
        .map((w) => w[0])
        .join(".");
    }

    if (distance <= GUESS_ACCURACY.VERY_CLOSE_DISTANCE) {
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

    if (distance <= GUESS_ACCURACY.CLOSE_DISTANCE) {
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
      }, TIMING.PHOTO_FLIP_ANIMATION_DURATION);
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
        const newScore = s.score - SCORING.PHOTO_TILE_PENALTY;

        let newHint = s.hint;
        if (newScore < SCORING.HINT_THRESHOLD && !s.hint) {
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
      const newScore = s.score - SCORING.REGULAR_TILE_PENALTY;

      let newHint = s.hint;
      if (newScore < SCORING.HINT_THRESHOLD && !s.hint) {
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
      // Game won or gave up - just update visual state
      updateState({
        flippedTiles: updated,
      });
    }
  };

  const photoUrl = s.playerData.Photo[0];

  // Calculate background position for photo segments (3x3 grid)
  const getPhotoSegmentStyle = (index: number): React.CSSProperties => {
    const col = index % PHOTO_GRID.COLS;
    const row = Math.floor(index / PHOTO_GRID.COLS);
    const xPos = col * PHOTO_GRID.TILE_WIDTH;
    const yPos = row * PHOTO_GRID.TILE_HEIGHT;

    return {
      backgroundImage: `url(${photoUrl})`,
      backgroundPosition: `-${xPos}px -${yPos}px`,
    };
  };

  const handleShare = () => {
    // Get puzzle number from roundData
    const puzzleNumber = s.roundData
      ? getPuzzleNumber(s.roundData.roundId)
      : String(DEFAULTS.DAILY_NUMBER);
    const sportName =
      activeSport.charAt(0).toUpperCase() + activeSport.slice(1);

    // Build the share text
    let shareText = `Daily Athlete Unknown ${sportName} #${puzzleNumber}\n`;

    // Create a 3x3 grid using emojis
    for (let i = 0; i < TOTAL_TILES; i++) {
      // Yellow emoji for flipped, blue emoji for unflipped
      shareText += s.flippedTiles[i] ? "🟨" : "🟦";
      // Add newline after every 3 tiles (end of row)
      if ((i + 1) % PHOTO_GRID.COLS === 0) {
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
        }, TIMING.SHARE_COPIED_MESSAGE_DURATION);
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
      });
  };

  // Sports Reference URLs
  const sportsReferenceUrls: Record<SportType, string> = {
    basketball: "https://www.basketball-reference.com/?utm_campaign=2023_07_ig_header_logo&utm_source=ig&utm_medium=sr_xsite&__hstc=213859787.d5011e8d60fd9a5193cb043be2a32532.1764028511872.1764187685470.1764486206944.5&__hssc=213859787.1.1764486206944&__hsfp=2724220660",
    baseball: "https://www.baseball-reference.com/?utm_campaign=2023_07_ig_header_logo&utm_source=ig&utm_medium=sr_xsite",
    football: "https://www.pro-football-reference.com/?utm_campaign=2023_07_ig_header_logo&utm_source=ig&utm_medium=sr_xsite"
  };

  const sportLogos: Record<SportType, string> = {
    baseball: "https://cdn.ssref.net/req/202512031/logos/br-logo.svg",
    basketball: "https://cdn.ssref.net/req/202512031/logos/bbr-logo.svg",
    football: "https://cdn.ssref.net/req/202512101/logos/pfr-logo.svg"
  };

  return (
    <div className="uncover-game">
      <div className="sports-reference-attribution">
        <a
          href={sportsReferenceUrls[activeSport]}
          target="_blank"
          rel="noopener noreferrer"
          className="sports-reference-link"
          title={`Data from ${activeSport.charAt(0).toUpperCase() + activeSport.slice(1)} Reference`}
        >
          <img
            src={sportLogos[activeSport]}
            alt={`${activeSport.charAt(0).toUpperCase() + activeSport.slice(1)} Reference`}
            className="sports-reference-logo"
          />
        </a>
      </div>

      <div className="sports-section">
        <div className="sports-navbar">
          {SPORT_LIST.map((sport) => (
            <div
              key={sport}
              className={`nav-tab ${activeSport === sport ? "active" : ""}`}
              onClick={() => setActiveSport(sport)}
            >
              {sport.toUpperCase()}
            </div>
          ))}
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

      <div className="sports-reference-credit">
        All information and images courtesy of Sports-Reference (sports-reference.com)
      </div>

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
export {
  lev,
  saveGuestSession,
  loadGuestSession,
  clearGuestSession,
  clearAllGuestSessions,
  getGuestSessionKey,
};
