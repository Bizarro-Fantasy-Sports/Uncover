import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router";
import "./AthleteUnknown.css";
import {
  type SportType,
  DEFAULT_SPORT,
  SPORTS,
} from "@/features/athlete-unknown/config";
import {
  STORAGE_KEYS,
  extractRoundNumber,
} from "@/features/athlete-unknown/utils";
import {
  useGameState,
  useGameLogic,
  useTileFlip,
  useGameData,
  useShareResults,
} from "@/features/athlete-unknown/hooks";
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
} from "@/features/athlete-unknown/components";
import { athleteUnknownApiService, migrateUserStats } from "@/features";

export function AthleteUnknown(): React.ReactElement {
  const { getAccessTokenSilently, isAuthenticated, user } = useAuth0();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [migrationAttempted, setMigrationAttempted] = useState(false);
  const { sport } = useParams();

  // Extract roles from access token
  useEffect(() => {
    const extractRoles = async () => {
      try {
        const accessToken = await getAccessTokenSilently();

        // Decode JWT to get payload (JWT format: header.payload.signature)
        const base64Url = accessToken.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window.atob(base64));

        const roles = payload["https://statslandfantasy.com/roles"] || [];
        console.log("[AthleteUnknown] Access Token roles:", roles);
        setUserRoles(roles);
      } catch (error) {
        console.error("[AthleteUnknown] Error extracting roles:", error);
        setUserRoles([]);
      }
    };

    extractRoles();
  }, [getAccessTokenSilently]);

  // Set up Auth0 token for API calls
  useEffect(() => {
    athleteUnknownApiService.setGetAccessToken(getAccessTokenSilently);
  }, [getAccessTokenSilently]);

  // Migrate user stats from localStorage to backend after first login
  useEffect(() => {
    const attemptMigration = async () => {
      // Only attempt migration once per session and only for authenticated users
      if (!isAuthenticated || migrationAttempted) {
        return;
      }

      setMigrationAttempted(true);

      try {
        const success = await migrateUserStats(user?.sub, user?.nickname);

        if (success) {
          console.log(
            "[AthleteUnknown] Stats migration completed successfully"
          );
        } else {
          console.warn(
            "[AthleteUnknown] Stats migration failed, will retry on next login"
          );
        }
      } catch (error) {
        console.error("[AthleteUnknown] Error during stats migration:", error);
      }
    };

    attemptMigration();
  }, [isAuthenticated, migrationAttempted, user?.sub, user?.nickname]);

  // Validate and set the active sport from URL params, falling back to DEFAULT_SPORT
  const getValidSport = (sportParam: string | undefined): SportType => {
    if (
      sportParam === SPORTS.BASEBALL ||
      sportParam === SPORTS.BASKETBALL ||
      sportParam === SPORTS.FOOTBALL
    ) {
      return sportParam as SportType;
    }
    return DEFAULT_SPORT;
  };

  const [activeSport, setActiveSport] = useState<SportType>(
    getValidSport(sport)
  );
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isRoundStatsModalOpen, setIsRoundStatsModalOpen] = useState(false);
  const [isUserStatsModalOpen, setIsUserStatsModalOpen] = useState(false);
  const [selectedPlayDate, setSelectedPlayDate] = useState<string | undefined>(
    undefined
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Check if user is a playtester
  const isPlaytester = userRoles.includes("Playtester");

  // Core state management - pass selectedPlayDate to ensure each puzzle has its own state
  const { state, updateState, clearProgress } = useGameState(
    activeSport,
    selectedPlayDate
  );

  // Data fetching & submission
  // updates the following fields in state
  // isLoading, error, round
  // TODO: rename to useRoundData
  useGameData({
    activeSport,
    state,
    updateState,
    playDate: selectedPlayDate,
    isGuest: !isAuthenticated,
  });

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

  useEffect(() => {
    setActiveSport(getValidSport(sport));
  }, [sport, setActiveSport]);

  // Clear localStorage when round is completed
  useEffect(() => {
    if (
      state.showResultsModal &&
      (state.finalRank || state.gaveUp) &&
      state.round
    ) {
      clearProgress();
    }
  }, [
    state.showResultsModal,
    state.finalRank,
    state.gaveUp,
    state.round,
    clearProgress,
  ]);

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

  // Handler for date selection in playtesting mode
  const handleDateSelect = (date: string) => {
    setSelectedPlayDate(date);
    setShowDatePicker(false);
  };

  // Handler for toggling date picker
  const handleTitleClick = () => {
    console.log("[AthleteUnknown] Title clicked! isPlaytester:", isPlaytester);
    if (isPlaytester) {
      console.log(
        "[AthleteUnknown] Toggling date picker. Current state:",
        showDatePicker
      );
      setShowDatePicker(!showDatePicker);
    } else {
      console.log("[AthleteUnknown] User is not a playtester, ignoring click");
    }
  };

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
        theme={state.round.theme}
        onRoundStatsClick={() => setIsRoundStatsModalOpen(true)}
        onRulesClick={() => setIsRulesModalOpen(true)}
        isPlaytester={isPlaytester}
        showDatePicker={showDatePicker}
        selectedPlayDate={selectedPlayDate}
        onTitleClick={handleTitleClick}
        onDateSelect={handleDateSelect}
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
        playerData={state.round.player}
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
            <UserStatsModal
              isOpen={isUserStatsModalOpen}
              onClose={() => setIsUserStatsModalOpen(false)}
              userStats={state.userStats}
            />
          </div>
        </div>
      )}
    </div>
  );
}
