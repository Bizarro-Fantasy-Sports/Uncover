import React from "react";
import { formatDate } from "../../utils/formatting";

interface RoundInfoProps {
  roundNumber: number;
  playDate?: string;
  theme?: string;
  onRoundStatsClick: () => void;
  onRulesClick: () => void;
}

export const RoundInfo: React.FC<RoundInfoProps> = ({
  roundNumber,
  playDate,
  theme,
  onRoundStatsClick,
  onRulesClick,
}) => {
  return (
    <div className="round-info">
      <span className="round-number">
        Puzzle #{roundNumber}
        {theme && ` - ${theme}`}
      </span>
      {playDate && (
        <>
          <span className="separator">•</span>
          <span className="round-date">{formatDate(playDate)}</span>
        </>
      )}
      <span className="separator">•</span>
      <button className="round-stats-link" onClick={onRoundStatsClick}>
        Today's Stats
      </button>
      <span className="separator">•</span>
      <button className="rules-link" onClick={onRulesClick}>
        Rules
      </button>
    </div>
  );
};
