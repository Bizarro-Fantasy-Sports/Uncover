import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faBriefcase,
  faChartLine,
  faUserSecret,
  faVolumeHigh,
  faVolumeXmark,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

interface UserAndSettingsProps {
  onStatsClick: () => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onVolumeClick: () => void;
  volume: number;
  onRoundResultsClick: () => void;
  onRulesClick: () => void;
  onRoundHistoryClick: () => void;
}

const PLAYLIST = [
  { id: 1, title: "Closed Curtains", url: "/AU-Closed_Curtains.mp3" },
  { id: 2, title: "Sleek Panther", url: "/AU-Sleek_Panther.mp3" },
  { id: 3, title: "Smoky Lounge", url: "/AU-Smoky_Lounge.mp3" },
];

export function UserAndSettings({
  onStatsClick,
  audioRef,
  onVolumeClick,
  volume,
  onRoundHistoryClick,
  onRulesClick,
  onRoundResultsClick,
}: UserAndSettingsProps): React.ReactElement {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [audioRef, volume]);

  // Play the next track when currentTrackIndex changes (after user interaction)
  useEffect(() => {
    if (hasInteracted && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrackIndex, audioRef, hasInteracted]);

  const handleVolumeClick = () => {
    if (!hasInteracted && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setHasInteracted(true);
    }
    onVolumeClick();
  };

  const handleTrackEnd = () => {
    const nextIndex =
      currentTrackIndex < PLAYLIST.length - 1 ? currentTrackIndex + 1 : 0;
    setCurrentTrackIndex(nextIndex);
  };

  const currentTrack = PLAYLIST[currentTrackIndex];

  const icon = volume === 0 ? faVolumeXmark : faVolumeHigh;
  return (
    <div className="au-user-settings-container">
      <FontAwesomeIcon icon={faBookOpen} size="lg" onClick={onRulesClick} />
      <FontAwesomeIcon
        icon={faChartLine}
        size="lg"
        onClick={onRoundResultsClick}
      />
      <FontAwesomeIcon
        icon={faBriefcase}
        size="lg"
        onClick={onRoundHistoryClick}
      />
      <FontAwesomeIcon icon={faUserSecret} size="lg" onClick={onStatsClick} />
      {/* <div className="au-user-identity-container">
        <button className="au-user-identity-button" onClick={onStatsClick}>
          <img src={TestUnknownPerson} alt="profile-image" />
        </button>
      </div> */}
      <div className="au-settings-container">
        <audio
          ref={audioRef}
          src={currentTrack?.url}
          onEnded={handleTrackEnd}
          loop={false}
        />
        <button className="au-volume-button" onClick={handleVolumeClick}>
          <FontAwesomeIcon icon={icon} size="lg" className="au-settings-icon" />
        </button>
      </div>
    </div>
  );
}
