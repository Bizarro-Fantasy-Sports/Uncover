import React, { useEffect, useState } from "react";
import "./Uncover.css";

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
const lev = (a, b) => {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) {dp[i][0] = i;}
  for (let j = 0; j <= b.length; j++) {dp[0][j] = j;}
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

const normalize = (str = "") => str.toLowerCase().replace(/\s/g, "");

const sportFiles = {
  baseball: "/UncoverBaseballData.json",
  basketball: "/UncoverBasketballData.json",
  football: "/UncoverFootballData.json",
};

const initialState = {
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
};

const Uncover = () => {
  const [activeSport, setActiveSport] = useState("baseball");

  const [gameState, setGameState] = useState({
    baseball: { ...initialState },
    basketball: { ...initialState },
    football: { ...initialState },
  });

  // Load players JSON sequentially
  useEffect(() => {
    const state = gameState[activeSport];

    // Already loaded → do nothing
    if (state.playersList && state.playerData) {return;}

    // Load once
    fetch(sportFiles[activeSport])
      .then((res) => res.json())
      .then((data) => {
        const key = `playerIndex_${activeSport}`;
        const storedIndex = parseInt(localStorage.getItem(key) || "0");

        const index = storedIndex % data.length;
        const playerData = data[index];

        localStorage.setItem(key, (index + 1) % data.length);

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
  }, [activeSport, gameState]);

  const s = gameState[activeSport];
  if (!s.playerData) {return <p>Loading player data...</p>;}

  const updateState = (patch) => {
    setGameState((prev) => ({
      ...prev,
      [activeSport]: { ...prev[activeSport], ...patch },
    }));
  };

  const evaluateRank = (points) => {
    if (points >= 95) {return "Amazing";}
    if (points >= 90) {return "Elite";}
    if (points >= 80) {return "Solid";}
    return "";
  };

  const handleNameSubmit = () => {
    const playerData = s.playerData;
    const a = normalize(s.playerName);
    const b = normalize(playerData.Name);
    const distance = lev(a, b);

    if (a === b) {
      const rank = evaluateRank(s.score);
      updateState({
        message: "You guessed it right!",
        messageType: "success",
        previousCloseGuess: "",
        finalRank: rank,
        hint: "",
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
        });
      } else {
        updateState({
          message: "You're close! Off by a few letters.",
          messageType: "almost",
          previousCloseGuess: a,
          score: newScore,
          hint: newHint,
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
      });
      return;
    }

    updateState({
      message: `Wrong guess: "${s.playerName}"`,
      messageType: "error",
      score: newScore,
      hint: newHint,
    });
  };

  const handleTileClick = (index) => {
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

      const newScore = s.score - 6;

      let newHint = s.hint;
      if (newScore < 70 && !s.hint) {
        newHint = s.playerData.Name.split(" ")
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
      return;
    }

    // Regular tile flip
    const updated = [...s.flippedTiles];
    updated[index] = true;

    const newScore = s.score - 3;

    let newHint = s.hint;
    if (newScore < 70 && !s.hint) {
      newHint = s.playerData.Name.split(" ")
        .map((w) => w[0])
        .join(".");
    }

    updateState({
      flippedTiles: updated,
      tilesFlippedCount: s.tilesFlippedCount + 1,
      score: newScore,
      hint: newHint,
    });
  };

  const photoUrl = s.playerData.Photo[0];

  // Calculate background position for photo segments (3x3 grid)
  const getPhotoSegmentStyle = (index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const xPos = col * 150; // tile width
    const yPos = row * 150; // tile height

    return {
      backgroundImage: `url(${photoUrl})`,
      backgroundPosition: `-${xPos}px -${yPos}px`,
    };
  };

  return (
    <div className="uncover-game">
      <div className="sports-navbar">
        {["baseball", "basketball", "football"].map((sport) => (
          <div
            key={sport}
            className={`nav-tab ${activeSport === sport ? "active" : ""}`}
            onClick={() => setActiveSport(sport)}
          >
            {sport.toUpperCase()}
          </div>
        ))}
      </div>

      {s.message && (
        <p className={`guess-message ${s.messageType}`}>{s.message}</p>
      )}

      <div className="guess-and-rank">
        {s.hint && !s.finalRank && (
          <p className="guess-message hint">Hint: Player Initials — {s.hint}</p>
        )}

        {s.finalRank && <p className="final-rank">Your Rank: {s.finalRank}</p>}
      </div>

      <div className="player-input">
        <input
          type="text"
          placeholder="Enter player name..."
          value={s.playerName}
          onChange={(e) => updateState({ playerName: e.target.value })}
        />
        <button onClick={handleNameSubmit}>Submit</button>
      </div>

      <h3>Score: {s.score}</h3>
      <h3>Tiles Flipped: {s.tilesFlippedCount}</h3>

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
                {!s.photoRevealed && (
                  topic === "Photo" ? (
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
                    s.playerData[topic]
                  )
                )}
                {s.photoRevealed && index === 2 && (
                  <div className="flip-back-arrow">↻</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Uncover;
export { lev };
