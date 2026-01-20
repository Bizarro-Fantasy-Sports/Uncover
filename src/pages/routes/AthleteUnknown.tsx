import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useParams } from "react-router";
import "./AthleteUnknown.css";
import type { SportType } from "@/features/athlete-unknown/config";
import {
  useGameState,
  useGuessSubmission,
  useTileFlip,
  useGameData,
  useShareResults,
  useRoundHistory,
  useUserStats,
} from "@/features/athlete-unknown/hooks";
import {
  SportsReferenceAttribution,
  GameHeader,
  RoundInfo,
  ScoreDisplay,
  PlayerInput,
  TileGrid,
  RoundResultsModal,
  RulesModal,
  SportsReferenceCredit,
  UserStatsModal,
  UsernameModal,
  HintTiles,
  RoundHistoryModal,
} from "@/features/athlete-unknown/components";
import {
  athleteUnknownApiService,
  migrateUserStats,
  UserSportStats,
} from "@/features";
import { getValidSport } from "@/features/athlete-unknown/utils/stringMatching";
import { config } from "@/config";

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

  const [activeSport, setActiveSport] = useState<SportType>(
    getValidSport(sport, config.athleteUnknown.sportsList[0])
  );
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isRoundResultsModalOpen, setIsRoundResultsModalOpen] = useState(false);
  const [isUserStatsModalOpen, setIsUserStatsModalOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [isRoundHistoryModalOpen, setIsRoundHistoryModalOpen] = useState(false);
  const [selectedPlayDate, setSelectedPlayDate] = useState<string | undefined>(
    undefined
  );

  // Check if user is a playtester
  const isPlaytester = userRoles.includes("Playtester");

  // Core state management - pass selectedPlayDate to ensure each puzzle has its own state
  const { state, updateState, clearProgress, clearMockData } = useGameState(
    activeSport,
    selectedPlayDate
  );

  // Data fetching & submission
  // updates the following fields in state
  // isLoading, error, round
  useGameData({
    activeSport,
    state,
    updateState,
    playDate: selectedPlayDate,
    isGuest: !isAuthenticated,
  });

  // Game logic
  // updates the following fields in state:
  // message, messageType, previousCloseGuess, isCompleted, lastSubmittedGuess
  const { handleNameSubmit, handleGiveUp } = useGuessSubmission({
    state,
    updateState,
  });

  // Tile interactions
  // updates the following fields in state:
  // photoRevealed, returningFromPhoto, flippedTiles, score
  const { handleTileClick } = useTileFlip({ state, updateState });

  // User Stats
  // updates the following fields in state:
  // userStats
  const { handleFetchUserStats } = useUserStats({ updateState });

  // Round History
  // updates the following fields in state
  // roundHistory
  const { handleFetchRoundHistory } = useRoundHistory({ updateState });

  // Share functionality
  // updates the following fields in state:
  // copiedText
  const { handleShare } = useShareResults({ state, updateState });

  useEffect(() => {
    setActiveSport(getValidSport(sport));
  }, [sport, setActiveSport]);

  // Clear localStorage when round is completed
  useEffect(() => {
    if (state.isCompleted && state.round) {
      setIsRoundResultsModalOpen(true);
      clearProgress();
      clearMockData();
    }
  }, [
    state.isCompleted,
    state.round,
    clearProgress,
    clearMockData,
    setIsRoundResultsModalOpen,
  ]);

  // Fetch roundHistory when the modal is opened
  useEffect(() => {
    if (isRoundHistoryModalOpen) {
      handleFetchRoundHistory(activeSport, isPlaytester);
    }
  }, [
    activeSport,
    isPlaytester,
    isRoundHistoryModalOpen,
    handleFetchRoundHistory,
  ]);

  // Fetch user stats when the modal is opened
  useEffect(() => {
    if (isUserStatsModalOpen) {
      handleFetchUserStats();
    }
  }, [isUserStatsModalOpen, handleFetchUserStats]);

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

  //TODO memoize these
  const playDate = state.round?.playDate as string | undefined;
  const [, roundNumber] = state.round.roundId.split("#");

  const userRoundHistoryArray = state.userStats?.sports.filter(
    (userSport: UserSportStats) => {
      return userSport.sport === activeSport;
    }
  );

  // console.log("STATE AU", state);

  // Handler for opening username modal
  const handleEditUsername = () => {
    setIsUsernameModalOpen(true);
  };

  // Handler for username update - refresh user stats
  const handleUsernameUpdated = (newUsername: string) => {
    // Update the username in the current userStats state
    if (state.userStats) {
      updateState({
        userStats: {
          ...state.userStats,
          userName: newUsername,
        },
      });
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
        onRoundResultsClick={() => setIsRoundResultsModalOpen(true)}
        onRulesClick={() => setIsRulesModalOpen(true)}
        onRoundHistoryClick={() => setIsRoundHistoryModalOpen(true)}
      />

      <ScoreDisplay
        score={state.score}
        message={state.message}
        messageType={state.messageType}
        tilesFlippedCount={state.flippedTiles.length}
        incorrectGuesses={state.incorrectGuesses}
      />

      <PlayerInput
        playerName={state.playerName}
        isCompleted={state.isCompleted}
        onPlayerNameChange={(name) => updateState({ playerName: name })}
        onSubmit={handleNameSubmit}
        onGiveUp={handleGiveUp}
      />

      <HintTiles
        flippedTiles={state.flippedTiles}
        playerData={state.round.player}
        onTileClick={handleTileClick}
      />

      <TileGrid
        flippedTiles={state.flippedTiles}
        photoRevealed={state.photoRevealed}
        returningFromPhoto={state.returningFromPhoto}
        playerData={state.round.player}
        onTileClick={handleTileClick}
      />

      <RoundResultsModal
        isOpen={isRoundResultsModalOpen}
        score={state.score}
        flippedTiles={
          state.isCompleted
            ? state.flippedTilesUponCompletion
            : state.flippedTiles
        }
        copiedText={state.copiedText}
        roundStats={state.round.stats}
        playerData={state.round.player}
        onClose={() => setIsRoundResultsModalOpen(false)}
        onShare={handleShare}
        isCompleted={state.isCompleted}
      />

      <SportsReferenceCredit />

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <UserStatsModal
        isOpen={isUserStatsModalOpen}
        onClose={() => setIsUserStatsModalOpen(false)}
        userStats={state.userStats}
        onEditUsername={isAuthenticated ? handleEditUsername : undefined}
        isLoading={state.isLoading}
        error={state.error}
      />

      {isAuthenticated && state.userStats && (
        <UsernameModal
          isOpen={isUsernameModalOpen}
          onClose={() => setIsUsernameModalOpen(false)}
          currentUsername={state.userStats.userName}
          onUsernameUpdated={handleUsernameUpdated}
        />
      )}

      <RoundHistoryModal
        isOpen={isRoundHistoryModalOpen}
        onClose={() => setIsRoundHistoryModalOpen(false)}
        isLoading={state.isLoading}
        error={state.error}
        roundHistory={state.roundHistory}
        userRoundHistory={userRoundHistoryArray?.[0]?.history ?? []}
        onRoundSelect={(playDate) => setSelectedPlayDate(playDate)}
      />
    </div>
  );
}
