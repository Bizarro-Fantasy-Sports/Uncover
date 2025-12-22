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

  return (
    <div className="tile" onClick={onClick}>
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
          {!photoRevealed &&
            (tileName === "photo" ? (
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
            ) : (
              playerData[tileName]
            ))}
          {photoRevealed && index === 2 && (
            <div className="flip-back-arrow">↻</div>
          )}
        </div>
      </div>
    </div>
  );
};
