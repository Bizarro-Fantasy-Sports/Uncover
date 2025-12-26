import React from "react";
import { formatDate } from "../../utils/formatting";

interface RoundInfoProps {
  roundNumber: number;
  playDate?: string;
  theme?: string;
  onRoundStatsClick: () => void;
  onRulesClick: () => void;
  isPlaytester?: boolean;
  showDatePicker?: boolean;
  selectedPlayDate?: string;
  onTitleClick?: () => void;
  onDateSelect?: (date: string) => void;
}

export const RoundInfo: React.FC<RoundInfoProps> = ({
  roundNumber,
  playDate,
  theme,
  onRoundStatsClick,
  onRulesClick,
  isPlaytester = false,
  showDatePicker = false,
  selectedPlayDate,
  onTitleClick,
  onDateSelect,
}) => {
  return (
    <div className="round-info">
      <span
        className={`round-number ${isPlaytester ? "playtester-clickable" : ""}`}
        onClick={onTitleClick}
        style={isPlaytester ? { cursor: "default" } : undefined}
      >
        Round #{roundNumber}
        {theme && ` - ${theme}`}        
      </span>
      {showDatePicker && isPlaytester && onDateSelect && (
        <input
          type="date"
          className="date-picker"
          value={selectedPlayDate || ""}
          onChange={(e) => onDateSelect(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
      )}
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
