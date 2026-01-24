import React from "react";
import { useParams } from "react-router";
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
  const { sport } = useParams();

  if (!isOpen) {
    return null;
  }

  const handleFolderClick = (playDate: string) => {
    if (onRoundSelect) {
      onRoundSelect(playDate);
      onClose();
    }
  };

  return (
    <div className="au-round-history-modal" onClick={onClose}>
      <div
        className="au-file-cabinet-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="au-file-cabinet-drawer">
          <button className="au-file-cabinet-close" onClick={onClose}>
            ×
          </button>

          <div className="au-drawer-interior">
            {isLoading && (
              <div className="au-drawer-message">Loading case files...</div>
            )}

            {error && (
              <div className="au-drawer-message au-drawer-error">
                Error: {error}
              </div>
            )}

            {!isLoading && !error && roundHistory.length === 0 && (
              <div className="au-drawer-message">No case files available.</div>
            )}

            {!isLoading && !error && roundHistory.length > 0 && (
              <div className="au-folders-container">
                {roundHistory.map((round: RoundSummary, index: number) => {
                  const userRound = userRoundHistory.find(
                    (ur: RoundHistory) => ur.playDate === round.playDate
                  );
                  const zIndex = roundHistory.length - index;
                  const tabPosition = index % 4;
                  const tabLeftPercent = tabPosition * 25;
                  const hasScore = userRound?.score !== undefined;

                  return (
                    <div
                      key={round.roundId}
                      className="au-file-cabinet-folder"
                      style={{ zIndex }}
                      onClick={() => handleFolderClick(round.playDate)}
                    >
                      <div
                        className="au-file-cabinet-folder-tab"
                        style={{
                          left: `${tabLeftPercent}%`,
                          transform: "none",
                        }}
                      >
                        {`Case #${round.roundId.split("#")[1]}`}
                      </div>
                      <div className="au-file-cabinet-folder-body">
                        <div
                          className={`au-folder-score ${hasScore ? "au-folder-score--solved" : ""}`}
                          style={{
                            left: `calc(${tabLeftPercent}% + 2.75rem)`,
                          }}
                        >
                          {hasScore ? userRound?.score : "Unsolved"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="au-drawer-front" onClick={onClose}>
            <div className="au-drawer-nameplate">
              {sport}
              <br />
              Case History
            </div>
            <div className="au-drawer-handle"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { RoundHistoryModal };
