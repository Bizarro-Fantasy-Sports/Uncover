import React, { useEffect, useState } from "react";
import "./AthleteUnknown.css";
import { type SportType, DEFAULT_SPORT, SPORTS } from "./config";
import { useGameState } from "./hooks/useGameState";
import { useGameLogic } from "./hooks/useGameLogic";
import { useTileFlip } from "./hooks/useTileFlip";
import { useGameData } from "./hooks/useGameData";
import { useGuestSession } from "./hooks/useGuestSession";
import { useShareResults } from "./hooks/useShareResults";
import { STORAGE_KEYS } from "./utils/storage";
import { extractRoundNumber } from "./utils/stringMatching";
import {
  SportsReferenceAttribution,
  GameHeader,
  RoundInfo,
  ScoreDisplay,
  PlayerInput,
  TileGrid,
  ResultsModal,
  RoundStatsModal,
  RulesModal,
  SportsReferenceCredit,
  UserStatsModal,
} from "./components";

const AthleteUnknown: React.FC = () => {
  // Restore previously active sport from localStorage, default to baseball
  const getInitialSport = (): SportType => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_SPORT);
      if (
        saved &&
        (saved === SPORTS.BASEBALL ||
          saved === SPORTS.BASKETBALL ||
          saved === SPORTS.FOOTBALL)
      ) {
        return saved as SportType;
      }
    } catch (error) {
      console.error("Failed to load active sport:", error);
    }
    return DEFAULT_SPORT;
  };

  const [activeSport, setActiveSport] = useState<SportType>(getInitialSport);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isRoundStatsModalOpen, setIsRoundStatsModalOpen] = useState(false);
  const [isUserStatsModalOpen, setIsUserStatsModalOpen] = useState(false);

  // Core state management
  const { state, updateState } = useGameState(activeSport);

  // Data fetching & submission
  // updates the following fields in state
  // isLoading, error, round
  // TODO: rename to useRoundData
  useGameData({ activeSport, state, updateState });

  // Guest session persistence
  // updates the following fields in state
  // playerName, message, messageType, previousCloseGuess, flippedTiles, tilesFlippedCount, score, hint, finalRank
  // incorrectGuesses, lastSubmittedGuess, firstTileFlipped, lastTileFlipped, playerName_saved,tate.finalRank, playerIndex_saved
  // TODO: remove guest? I think this should be the logic for all users because  we don't save in-progress for signed in users either
  useGuestSession({ activeSport, state, updateState });

  // Game logic
  // updates the following fields in state:
  // message, messageType, previousCloseGuess, finalRank, hint, showResultsModal, lastSubmittedGuess
  // TODO: rename to useUserSubmission
  const { handleNameSubmit, handleGiveUp } = useGameLogic({
    state,
    updateState,
  });

  // Tile interactions
  // updates the following fields in state:
  // photoRevealed, returningFromPhoto, flippedTiles, tilesFlippedCount, score, hint, firstTileFlipped, lastTileFlipped
  const { handleTileClick } = useTileFlip({ state, updateState });

  // Share functionality
  // updates the following fields in state:
  // copiedText
  const { handleShare } = useShareResults({ state, updateState });

  // Save active sport to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SPORT, activeSport);
    } catch (error) {
      console.error("Failed to save active sport:", error);
    }
  }, [activeSport]);

  // Show loading state
  if (state.isLoading) {
    return (
      <div className="athlete-unknown-game">
        <p>Loading player data and round statistics...</p>
      </div>
    );
  }

  // Show error state
  if (state.error) {
    return (
      <div className="athlete-unknown-game">
        <div className="error-message">
          <p>Error: {state.error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  // Ensure data is loaded
  if (!state.round) {
    return (
      <div className="athlete-unknown-game">
        <p>Loading game data...</p>
      </div>
    );
  }

  const playDate = state.round?.playDate as string | undefined;
  const roundNumber = extractRoundNumber(state.round.roundId);

  return (
    <div className="athlete-unknown-game">
      <SportsReferenceAttribution activeSport={activeSport} />

      <GameHeader
        activeSport={activeSport}
        onSportChange={setActiveSport}
        onStatsClick={() => setIsUserStatsModalOpen(true)}
      />

      <RoundInfo
        roundNumber={roundNumber}
        playDate={playDate}
        onRoundStatsClick={() => setIsRoundStatsModalOpen(true)}
        onRulesClick={() => setIsRulesModalOpen(true)}
      />

      <ScoreDisplay
        score={state.score}
        message={state.message}
        messageType={state.messageType}
        hint={state.hint}
        finalRank={state.finalRank}
        tilesFlipped={state.tilesFlippedCount}
        incorrectGuesses={state.incorrectGuesses}
      />

      <PlayerInput
        playerName={state.playerName}
        score={state.score}
        finalRank={state.finalRank}
        gaveUp={state.gaveUp}
        onPlayerNameChange={(name) => updateState({ playerName: name })}
        onSubmit={handleNameSubmit}
        onGiveUp={handleGiveUp}
        onViewResults={() => updateState({ showResultsModal: true })}
      />

      <TileGrid
        flippedTiles={state.flippedTiles}
        photoRevealed={state.photoRevealed}
        returningFromPhoto={state.returningFromPhoto}
        playerData={state.round.player}
        onTileClick={handleTileClick}
      />

      <ResultsModal
        isOpen={state.showResultsModal}
        gaveUp={state.gaveUp}
        score={state.score}
        flippedTiles={state.flippedTiles}
        copiedText={state.copiedText}
        roundStats={state.round.stats}
        onClose={() => updateState({ showResultsModal: false })}
        onShare={handleShare}
      />

      <SportsReferenceCredit />

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {state.round.stats && (
        <RoundStatsModal
          isOpen={isRoundStatsModalOpen}
          onClose={() => setIsRoundStatsModalOpen(false)}
          roundStats={{
            ...state.round.stats,
            name:
              state.finalRank || state.gaveUp
                ? state.round.player?.name || "Unknown Player"
                : "???",
          }}
        />
      )}

      {isUserStatsModalOpen && (
        <div
          className="user-stats-modal"
          onClick={() => setIsUserStatsModalOpen(false)}
        >
          <div
            className="user-stats-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-user-stats"
              onClick={() => setIsUserStatsModalOpen(false)}
            >
              ×
            </button>
            <UserStatsModal />
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteUnknown;
