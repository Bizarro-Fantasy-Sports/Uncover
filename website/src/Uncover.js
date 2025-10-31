import React, { useState, useEffect } from "react";
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

const normalize = (str) => str.toLowerCase().replace(/\s/g, "");

const Uncover = () => {
  const [playerData, setPlayerData] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [previousCloseGuess, setPreviousCloseGuess] = useState("");
  const [flippedTiles, setFlippedTiles] = useState(Array(9).fill(false));
  const [tilesFlippedCount, setTilesFlippedCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetch("/UncoverBaseballData.json")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Retrieve last played index from localStorage
          const storedIndex = parseInt(
            localStorage.getItem("playerIndex") || "0",
            10
          );

          // Ensure valid index (wrap around if out of range)
          const currentIndex = storedIndex % data.length;
          setPlayerData(data[currentIndex]);

          // Calculate next index and store for next visit
          const nextIndex = (currentIndex + 1) % data.length;
          localStorage.setItem("playerIndex", nextIndex);
        } else {
          console.error("UncoverBaseballData.json is empty or invalid.");
        }
      })
      .catch((err) => console.error("Error loading player data:", err));
  }, []);

  const handleNameSubmit = () => {
    if (!playerData) return;

    const a = normalize(playerName);
    const b = normalize(playerData.Name);
    const distance = lev(a, b);

    if (a === b) {
      setMessage("You guessed it right!");
      setMessageType("success");
    } else if (distance <= 2) {
      if (previousCloseGuess && previousCloseGuess !== a) {
        setMessage(
          `Correct, you were close! Player's name: ${playerData.Name}`
        );
        setMessageType("close");
      } else {
        setMessage("You're close! Off by a few letters.");
        setMessageType("almost");
        setPreviousCloseGuess(a);
      }
    } else {
      setMessage(`Wrong guess: "${playerName}"`);
      setMessageType("error");
    }
  };

  const handleTileClick = (index) => {
    if (!playerData) return;

    if (flippedTiles[index]) {
      // allow re-click only if Photo tile (to open modal)
      if (topics[index] === "Photo") setModalOpen(true);
      return;
    }

    const newFlipped = [...flippedTiles];
    newFlipped[index] = true;
    setFlippedTiles(newFlipped);
    setTilesFlippedCount((prev) => prev + 1);

    if (topics[index] === "Photo") setModalOpen(true);
  };

  if (!playerData) {
    return (
      <div className="uncover-game">
        <p>Loading player data...</p>
      </div>
    );
  }

  return (
    <div className="uncover-game">
      {message && <p className={`guess-message ${messageType}`}>{message}</p>}

      <div className="player-input">
        <input
          type="text"
          placeholder="Enter player name..."
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
        <button onClick={handleNameSubmit}>Submit</button>
      </div>

      <h3>Tiles Flipped: {tilesFlippedCount}</h3>

      <div className="grid">
        {topics.map((topic, i) => (
          <div className="tile" key={i} onClick={() => handleTileClick(i)}>
            <div className={`tile-inner ${flippedTiles[i] ? "flipped" : ""}`}>
              <div className="tile-front">{topic}</div>
              <div className="tile-back">
                {topic === "Photo"
                  ? "Click to view photo"
                  : playerData[topic] || "No data"}
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="modal" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close" onClick={() => setModalOpen(false)}>
              ✕
            </button>
            {playerData.Photo ? (
              <img src={playerData.Photo} alt="Player" className="full-photo" />
            ) : (
              <p>No photo available.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Uncover;
