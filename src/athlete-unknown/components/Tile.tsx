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

  // Show tooltip for flipped tiles (not in photo reveal mode, and not for photo tile)
  const tooltipText = isFlipped && !photoRevealed && tileName !== "photo" ? camelCaseToTitleCase(tileName) : "";

  // Determine tooltip position based on tile index
  // Grid is 3x3: [0,1,2], [3,4,5], [6,7,8]
  const getTooltipPosition = () => {
    const row = Math.floor(index / 3);
    const col = index % 3;

    // Right column (2,5,8): show right
    if (col === 2) return "right";
    // Left column (0,3,6): show left
    if (col === 0) return "left";
    // Bottom row (7): show below
    if (row === 2) return "bottom";
    // Top row (1): show above (default for remaining)
    return "top";
  };

  return (
    <div className="tile" onClick={onClick} data-tooltip={tooltipText} data-tooltip-position={getTooltipPosition()}>
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
                fontSize: "0.85rem",
                lineHeight: "1.4",
                padding: "8px",
                color: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
                height: "100%",
              }}
            >
              {tileContent}
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
