import React from "react";
import "./RulesModal.css";
import { RoundHistory, RoundSummary } from "@/features/athlete-unknown/types";

interface RoundHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  error: string | null;
  roundHistory: RoundSummary[];
  userRoundHistory: RoundHistory[];
  onRoundSelect?: (playDate: string) => void;
}

function RoundHistoryModal({
  isOpen,
  onClose,
  isLoading,
  error,
  roundHistory,
  userRoundHistory,
  onRoundSelect,
}: RoundHistoryModalProps): React.ReactElement | null {
  const handleRowClick = (playDate: string) => {
    if (onRoundSelect) {
      onRoundSelect(playDate);
      onClose();
    }
  };
  if (!isOpen) {
    return null;
  }

  return (
    <div className="rules-modal-overlay" onClick={onClose}>
      <div className="rules-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-rules-button" onClick={onClose}>
          ×
        </button>

        <h2 className="rules-title">Round History</h2>

        <div className="rules-body">
          {isLoading && <p>Loading rounds...</p>}

          {error && (
            <div className="error-message">
              <p>Error: {error}</p>
            </div>
          )}

          {!isLoading && !error && roundHistory.length === 0 && (
            <p>No round history available.</p>
          )}

          {!isLoading && !error && roundHistory.length > 0 && (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Play Date
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Round ID
                  </th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>
                    Score
                  </th>
                </tr>
              </thead>
              <tbody>
                {roundHistory.map((round: RoundSummary) => {
                  const roundPlayDate = round.playDate;
                  const hasUserPlayedThisRoundArray = userRoundHistory.filter(
                    (userRound: RoundHistory) => {
                      return roundPlayDate === userRound.playDate;
                    }
                  );
                  const hasUserPlayedThisRound =
                    hasUserPlayedThisRoundArray.length > 0;
                  return (
                    <tr
                      key={round.roundId}
                      onClick={() => handleRowClick(round.playDate)}
                      style={{ cursor: "pointer" }}
                    >
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {round.playDate}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {round.roundId}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {hasUserPlayedThisRound
                          ? hasUserPlayedThisRoundArray?.[0].score
                          : "Play Now!"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export { RoundHistoryModal };
