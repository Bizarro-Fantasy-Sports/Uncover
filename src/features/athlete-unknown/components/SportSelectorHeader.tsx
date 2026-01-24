// import React from "react";
import { useNavigate } from "react-router";
import type { SportType } from "@/features/athlete-unknown/config";
import { config } from "@/config";

interface SportSelectorHeaderProps {
  activeSport: SportType;
  onSportChange: (sport: SportType) => void;
}
//TODO: rename to sport selector header
export function SportSelectorHeader({
  activeSport,
  onSportChange,
}: SportSelectorHeaderProps): React.ReactElement {
  const navigate = useNavigate();

  const handleSportClick = (sport: SportType) => {
    onSportChange(sport);
    navigate(`/athlete-unknown/${sport}`);
  };

  return (
    <div className="au-sports-section">
      <div className="au-sports-navbar">
        {config.athleteUnknown.sportsList.map((sport) => (
          <div
            key={sport}
            className={`au-nav-tab ${activeSport === sport ? "active" : ""}`}
            onClick={() => handleSportClick(sport)}
          >
            <span>{sport.toUpperCase()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
