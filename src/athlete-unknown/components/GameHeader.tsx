import React from "react";
import type { SportType } from "../config";
import { SPORT_LIST } from "../config";

interface GameHeaderProps {
  activeSport: SportType;
  onSportChange: (sport: SportType) => void;
  onStatsClick: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  activeSport,
  onSportChange,
  onStatsClick,
}) => {
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
};
