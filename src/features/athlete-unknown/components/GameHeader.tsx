// import React from "react";
import { useNavigate } from "react-router";
import type { SportType } from "@/features/athlete-unknown/config";
import { config } from "@/config";

interface GameHeaderProps {
  activeSport: SportType;
  onSportChange: (sport: SportType) => void;
  onStatsClick: () => void;
}

export function GameHeader({
  activeSport,
  onSportChange,
  onStatsClick,
}: GameHeaderProps): React.ReactElement {
  const navigate = useNavigate();

  const handleSportClick = (sport: SportType) => {
    onSportChange(sport);
    navigate(`/athlete-unknown/${sport}`);
  };

  return (
    <div className="sports-section">
      <div className="sports-navbar">
        {config.athleteUnknown.sportsList.map((sport) => (
          <div
            key={sport}
            className={`nav-tab ${activeSport === sport ? "active" : ""}`}
            onClick={() => handleSportClick(sport)}
          >
            {sport.toUpperCase()}
          </div>
        ))}
      </div>
      <button className="stats-button" onClick={onStatsClick}>
        User Stats
      </button>
    </div>
  );
}
