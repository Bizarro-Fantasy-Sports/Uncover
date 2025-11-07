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
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
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

const Uncover = () => {
  const [playersList, setPlayersList] = useState(null);
  const [playerData, setPlayerData] = useState(null);

  const [playerName, setPlayerName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [previousCloseGuess, setPreviousCloseGuess] = useState("");

  const [flippedTiles, setFlippedTiles] = useState(Array(9).fill(false));
  const [tilesFlippedCount, setTilesFlippedCount] = useState(0);

  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  const [score, setScore] = useState(100);
  const [hint, setHint] = useState("");
  const [finalRank, setFinalRank] = useState("");

  // Load players JSON sequentially
  useEffect(() => {
    fetch("/UncoverBaseballData.json")
      .then((res) => res.json())
      .then((data) => {
        setPlayersList(data);

        const storedIndex = parseInt(
          localStorage.getItem("playerIndex") || "0"
        );
        const index = storedIndex % data.length;
        setPlayerData(data[index]);
        localStorage.setItem("playerIndex", (index + 1) % data.length);
      })
      .catch((err) => console.error("Error loading player data:", err));
  }, []);

  const evaluateRank = (points) => {
    if (points >= 95) return "Amazing";
    if (points >= 90) return "Elite";
    if (points >= 80) return "Solid";
    return "";
  };

  const handleNameSubmit = () => {
    if (!playerData) return;

    const a = normalize(playerName);
    const b = normalize(playerData.Name);
    const distance = lev(a, b);

    if (a === b) {
      setMessage("You guessed it right!");
      setMessageType("success");
      setPreviousCloseGuess("");

      const rank = evaluateRank(score);
      setFinalRank(rank);

      setHint("");
      return;
    }

    setScore((prev) => {
      const newScore = prev - 2;
      if (newScore < 70 && !hint) {
        const initials = playerData.Name.split(" ")
          .map((w) => w[0])
          .join(".");
        setHint(initials);
      }
      return newScore;
    });

    if (distance <= 2) {
      if (previousCloseGuess && previousCloseGuess !== a) {
        setMessage(
          `Correct, you were close! Player's name: ${playerData.Name}`
        );
        setMessageType("close");
        setPreviousCloseGuess("");
      } else {
        setMessage("You're close! Off by a few letters.");
        setMessageType("almost");
        setPreviousCloseGuess(a);
      }
      return;
    }

    if (distance <= 4) {
      setMessage(`Correct, you were close! Player's name: ${playerData.Name}`);
      setMessageType("close");
      setPreviousCloseGuess("");
      return;
    }

    setMessage(`Wrong guess: "${playerName}"`);
    setMessageType("error");
  };

  const handleTileClick = (index) => {
    if (flippedTiles[index]) {
      if (topics[index] === "Photo") setPhotoModalOpen(true);
      return;
    }

    const updated = [...flippedTiles];
    updated[index] = true;
    setFlippedTiles(updated);
    setTilesFlippedCount((prev) => prev + 1);

    setScore((prev) => {
      const loss = topics[index] === "Photo" ? 6 : 3;
      const newScore = prev - loss;
      if (newScore < 70 && !hint) {
        const initials = playerData.Name.split(" ")
          .map((w) => w[0])
          .join(".");
        setHint(initials);
      }
      return newScore;
    });

    if (topics[index] === "Photo") {
      setTimeout(() => setPhotoModalOpen(true), 350);
    }
  };

  if (!playerData) return <p>Loading player data...</p>;

  const photoUrl = playerData.Photo[0];

  return (
    <div className="uncover-game">
      {message && <p className={`guess-message ${messageType}`}>{message}</p>}
      <div className="guess-and-rank">
        {hint && !finalRank && (
          <p className="guess-message hint">Hint: Player Initials — {hint}</p>
        )}

        {finalRank && <p className="final-rank">Your Rank: {finalRank}</p>}
      </div>

      <div className="player-input">
        <input
          type="text"
          placeholder="Enter player name..."
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={handleNameSubmit}>Submit</button>
      </div>

      <h3>Score: {score}</h3>
      <h3>Tiles Flipped: {tilesFlippedCount}</h3>

      <div className="grid">
        {topics.map((topic, index) => (
          <div
            className="tile"
            key={index}
            onClick={() => handleTileClick(index)}
          >
            <div
              className={`tile-inner ${flippedTiles[index] ? "flipped" : ""}`}
            >
              <div className="tile-front">{topic}</div>
              <div className="tile-back">
                {topic === "Photo" ? (
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
                  playerData[topic]
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {photoModalOpen && (
        <div className="modal" onClick={() => setPhotoModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setPhotoModalOpen(false)}>
              ✕
            </button>
            <img src={photoUrl} alt="Player" className="full-photo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Uncover;
