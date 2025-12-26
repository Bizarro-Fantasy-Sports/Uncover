import React from "react";
import { camelCaseToTitleCase } from "../../utils/formatting";
import type { PlayerData } from "../types/api";

interface TileProps {
  tileName: string;
  index: number;
  isFlipped: boolean;
  photoRevealed: boolean;
  returningFromPhoto: boolean;
  playerData: PlayerData;
  photoSegmentStyle?: React.CSSProperties;
  onClick: () => void;
}

export const Tile: React.FC<TileProps> = ({
  tileName,
  index,
  isFlipped,
  photoRevealed,
  returningFromPhoto,
  playerData,
  photoSegmentStyle,
  onClick,
}) => {
  const photoUrl = playerData.photo || "";
  const tileContent = String(playerData[tileName] || "");

  // Show tooltip for flipped tiles (not in photo reveal mode)
  const tooltipText = isFlipped && !photoRevealed ? camelCaseToTitleCase(tileName) : "";

  // Debug logging
  React.useEffect(() => {
    if (isFlipped && !photoRevealed) {
      console.log(`Tile ${tileName} (index ${index}):`, {
        tileName,
        isFlipped,
        photoRevealed,
        tileContent,
        playerDataKeys: Object.keys(playerData),
        playerDataValue: playerData[tileName]
      });
    }
  }, [isFlipped, photoRevealed, tileName, index, tileContent, playerData]);

  return (
    <div className="tile" onClick={onClick} data-tooltip={tooltipText}>
      <div
        className={`tile-inner ${
          photoRevealed
            ? "photo-reveal"
            : returningFromPhoto
              ? isFlipped
                ? "flipped no-slide-anim returning-from-photo"
                : "returning-from-photo"
              : isFlipped
                ? "flipped"
                : ""
        }`}
      >
        <div className="tile-front">{camelCaseToTitleCase(tileName)}</div>
        <div
          className={`tile-back ${photoRevealed ? "photo-segment" : ""}`}
          style={photoRevealed ? photoSegmentStyle : {}}
        >
          {!photoRevealed && tileName === "photo" && (
            <img
              src={photoUrl}
              alt="Player"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          )}
          {!photoRevealed && tileName !== "photo" && (
            <div
              style={{
                fontSize: "0.8rem",
                lineHeight: "1.4",
                padding: "5px",
                color: "#000",
                backgroundColor: "#FFD700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
                height: "100%",
                border: "2px solid red",
              }}
            >
              {tileContent || `[${tileName}: NO DATA]`}
            </div>
          )}
          {photoRevealed && index === 2 && (
            <div className="flip-back-arrow">↻</div>
          )}
        </div>
      </div>
    </div>
  );
};
