import React from "react";
import { formatDate } from "@/utils";
import { SportType } from "@/config";
import { getSportEmoji } from "../utils/strings";

interface RoundInfoProps {
  roundNumber: string;
  playDate: string;
  theme?: string;
  sport: SportType;
  onRoundResultsClick: () => void;
  onRulesClick: () => void;
  onRoundHistoryClick: () => void;
}

export function RoundInfo({
  roundNumber,
  playDate,
  theme,
  sport,
  // onRoundResultsClick,
  // onRulesClick,
  // onRoundHistoryClick,
}: RoundInfoProps): React.ReactElement {
  return (
    <div className="au-round-info-container">
      <div
        className="au-round-info-container-top"
        style={{ width: theme ? "100%" : "75%" }}
      >
        <span className="au-round-number">
          <p>{`Case #${getSportEmoji(sport)}${roundNumber}`}</p>
          {/* <p>{theme && ` - ${theme}`}</p> */}
        </span>
        <span className="au-separator">•</span>
        <span className="au-round-date">
          <p>{formatDate(playDate)}</p>
        </span>
      </div>
      <div className="au-round-info-container-bottom">
        <p>{theme}</p>
      </div>
      {/* <div className="au-round-info-container-bottom">
        <button className="au-round-stats-link" onClick={onRoundResultsClick}>
          <p>Case Stats</p>
        </button>
        <span className="au-separator">•</span>
        <button className="au-rules-link" onClick={onRulesClick}>
          <p>How to Play</p>
        </button>
        <span className="au-separator">•</span>
        <button className="au-history-link" onClick={onRoundHistoryClick}>
          <p>Case History</p>
        </button>
      </div> */}
    </div>
  );
}
