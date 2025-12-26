// import React from "react";
import type { SportType } from "@/features/athlete-unknown/config";
import { SPORT_LIST } from "@/features/athlete-unknown/config";

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
  return (
    <div className="sports-section">
      <div className="sports-navbar">
        {SPORT_LIST.map((sport) => (
          <div
            key={sport}
            className={`nav-tab ${activeSport === sport ? "active" : ""}`}
            onClick={() => onSportChange(sport)}
          >
            {sport.toUpperCase()}
          </div>
        ))}
      </div>
      <button className="stats-button" onClick={onStatsClick}>
        Stats
      </button>
    </div>
  );
}
