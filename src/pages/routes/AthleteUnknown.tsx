import React, { useCallback, useEffect, useRef, useState } from "react";
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
  UserStatsModal,
  HintTiles,
  RoundHistoryModal,
  UserAndSettings,
  Button,
  PreviousGuesses,
} from "@/features/athlete-unknown/components";
import {
  athleteUnknownApiService,
  migrateUserStats,
  UserSportStats,
} from "@/features";
import { getValidSport } from "@/features/athlete-unknown/utils/strings";
import { config } from "@/config";
import { Navbar } from "@/components";
import PlaceholderLogo from "@/features/athlete-unknown/assets/placeholder-logo.png";

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
  const [isRoundHistoryModalOpen, setIsRoundHistoryModalOpen] = useState(false);
  const [selectedPlayDate, setSelectedPlayDate] = useState<string | undefined>(
    undefined
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const onHandleVolumeClick = useCallback(() => {
    if (volume === 0) {
      setVolume(0.5);
    } else {
      setVolume(0);
    }
  }, [setVolume, volume]);

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
  const { handleTileClick, handleHintTileClick } = useTileFlip({
    state,
    updateState,
  });

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
  const playDate = state.round.playDate;
  const [, roundNumber] = state.round.roundId.split("#");

  const userRoundHistoryArray = state.userStats?.sports.filter(
    (userSport: UserSportStats) => {
      return userSport.sport === activeSport;
    }
  );

  // console.log("STATE AU", state);

  return (
    <div className="au-container">
      <div className="au-header-container">
        <Navbar />
        <img
          src={PlaceholderLogo}
          alt="Athlete Unknown Logo"
          className="au-placeholder-logo"
        />
        <div>
          <UserAndSettings
            onStatsClick={() => setIsUserStatsModalOpen(true)}
            audioRef={audioRef}
            onVolumeClick={onHandleVolumeClick}
            volume={volume}
          />
        </div>
      </div>
      <div className="au-body-container">
        <div className="au-information-container">
          <GameHeader
            activeSport={activeSport}
            onSportChange={setActiveSport}
          />
          <RoundInfo
            roundNumber={roundNumber}
            playDate={playDate}
            theme={state.round.theme}
            sport={activeSport}
            onRoundResultsClick={() => setIsRoundResultsModalOpen(true)}
            onRulesClick={() => setIsRulesModalOpen(true)}
            onRoundHistoryClick={() => setIsRoundHistoryModalOpen(true)}
          />
        </div>
        <div className="au-paper-container">
          <div className="au-player-guess-container">
            <PlayerInput
              playerName={state.playerName}
              isCompleted={state.isCompleted}
              onPlayerNameChange={(name) => updateState({ playerName: name })}
            />
            <PreviousGuesses
              guesses={state.previousGuesses}
              correctName={state.round.player.name}
            />
          </div>
        </div>
        <div className="au-game-container au-bulletin-board">
          <div className="au-scoring-container">
            <div className="au-scoring-buttons-container">
              <Button
                onClick={handleNameSubmit}
                size="lg"
                variant={state.isCompleted ? "ghost" : "primary"}
                disabled={state.isCompleted || state.playerName === ""}
              >
                Submit
              </Button>
              <Button
                onClick={handleGiveUp}
                size="lg"
                variant={state.isCompleted ? "ghost" : "danger"}
                disabled={state.isCompleted}
              >
                Give Up
              </Button>
            </div>
            <ScoreDisplay score={state.score} />
            <div className="au-hints-container">
              <HintTiles
                flippedTiles={state.flippedTiles}
                playerData={state.round.player}
                onHintTileClick={handleHintTileClick}
              />
            </div>
          </div>
          <div className="au-tile-grid-container">
            <TileGrid
              flippedTiles={state.flippedTiles}
              photoRevealed={state.photoRevealed}
              returningFromPhoto={state.returningFromPhoto}
              playerData={state.round.player}
              onTileClick={handleTileClick}
            />
          </div>
        </div>
        {/* <Typewriter
          playerName={state.playerName}
          isCompleted={state.isCompleted}
          onPlayerNameChange={(name) => updateState({ playerName: name })}
          guesses={state.previousGuesses}
          correctName={state.round.player.name}
        /> */}
      </div>
      <div className="au-footer-container">
        <SportsReferenceAttribution activeSport={activeSport} />
        <div>Credits</div>
      </div>

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

      <RulesModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <UserStatsModal
        isOpen={isUserStatsModalOpen}
        onClose={() => setIsUserStatsModalOpen(false)}
        userStats={state.userStats}
        isLoading={state.isLoading}
        error={state.error}
      />

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
