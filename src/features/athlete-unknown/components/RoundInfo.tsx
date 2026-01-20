import React from "react";
import { formatDate } from "@/utils";

interface RoundInfoProps {
  roundNumber: string;
  playDate?: string;
  theme?: string;
  onRoundResultsClick: () => void;
  onRulesClick: () => void;
  onRoundHistoryClick: () => void;
}

export function RoundInfo({
  roundNumber,
  playDate,
  theme,
  onRoundResultsClick,
  onRulesClick,
  onRoundHistoryClick,
}: RoundInfoProps): React.ReactElement {
  return (
    <div className="round-info">
      <span className="round-number">
        Round #{roundNumber}
        {theme && ` - ${theme}`}
      </span>
      {playDate && (
        <>
          <span className="separator">•</span>
          <span className="round-date">{formatDate(playDate)}</span>
        </>
      )}
      <span className="separator">•</span>
      <button className="round-stats-link" onClick={onRoundResultsClick}>
        Today's Stats
      </button>
      <span className="separator">•</span>
      <button className="rules-link" onClick={onRulesClick}>
        Rules
      </button>
      <span className="separator">•</span>
      <button className="history-link" onClick={onRoundHistoryClick}>
        History
      </button>
    </div>
  );
}
