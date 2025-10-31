import React, { useState } from "react";
import "./Uncover.css";

const playerData = {
  Name: "Jimmy McJamz",
  Bio: "DOB: Nov 3, 2024 & in Arcadia, CA",
  "Player Information": "5'6 & 130lbs & Pitcher",
  "Draft Information": "Drafted 2024",
  "Years Active": "1999–2023",
  "Teams Played On": "Los Angeles",
  "Jersey Numbers": "14 & 67 & 32",
  "Career Stats": "Hit %: 32 & Catch %: 88",
  "Personal Achievements": "MVP & GOAT & Best Player",
  Photo: ["https://via.placeholder.com/300"],
};

// HELPER FUNCTION: Approximate string matching (up to 4 letters off)
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

const Uncover = () => {
  const [playerName, setPlayerName] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [previousCloseGuess, setPreviousCloseGuess] = useState("");
  const [flippedTiles, setFlippedTiles] = useState(Array(9).fill(false));
  const [tilesFlippedCount, setTilesFlippedCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const handleNameSubmit = () => {
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
                {topic === "Photo" ? "Click to view photo" : playerData[topic]}
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
            <img
              src={playerData.Photo[0]}
              alt="Player"
              className="full-photo"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Uncover;
