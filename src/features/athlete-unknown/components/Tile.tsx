import React, { useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleInfo } from "@fortawesome/free-solid-svg-icons";
import { camelCaseToTitleCase } from "@/utils";
import { PlayerData } from "@/features/athlete-unknown/types";
import {
  REFERENCE_URLS,
  SportType,
  TILE_NAMES,
  TILES,
  TileType,
} from "@/features/athlete-unknown/config";

interface TileProps {
  tileName: TileType;
  index: number;
  isFlipped: boolean;
  photoRevealed: boolean;
  returningFromPhoto: boolean;
  playerData: PlayerData;
  photoSegmentStyle?: React.CSSProperties;
  onClick: () => void;
}

export function Tile({
  tileName,
  index,
  isFlipped,
  photoRevealed,
  returningFromPhoto,
  playerData,
  photoSegmentStyle,
  onClick,
}: TileProps): React.ReactElement {
  const photoUrl = playerData.photo || "";
  const tileContent = String(playerData[tileName] || "");

  // Show tooltip for flipped tiles (not in photo reveal mode, and not for photo tile)
  const tooltipText =
    isFlipped && !photoRevealed && tileName !== TILE_NAMES.PHOTO
      ? camelCaseToTitleCase(tileName)
      : "";

  // Determine tooltip position based on tile index
  // Grid is 3x3: [0,1,2], [3,4,5], [6,7,8]
  const getTooltipPosition = () => {
    const row = Math.floor(index / 3);
    const col = index % 3;

    // Right column (2,5,8): show right
    if (col === 2) {
      return "right";
    }
    // Left column (0,3,6): show left
    if (col === 0) {
      return "left";
    }
    // Bottom row (7): show below
    if (row === 2) {
      return "bottom";
    }
    // Top row (1): show above (default for remaining)
    return "top";
  };

  const getAdvancedStatsUrl = useCallback((sport: SportType) => {
    return REFERENCE_URLS[sport];
  }, []);

  return (
    <div
      className="tile"
      onClick={onClick}
      data-tooltip={tooltipText}
      data-tooltip-position={getTooltipPosition()}
    >
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
        <div className="tile-front evidence-tag">
          <div className="reinforcement-ring"></div>
          <p className="evidence-tag-text">{TILES[tileName].label}</p>
        </div>

        <div
          className={`tile-back ${photoRevealed ? "photo-segment" : ""}`}
          style={photoRevealed ? photoSegmentStyle : {}}
        >
          {!photoRevealed && tileName === TILE_NAMES.PHOTO && (
            <img src={photoUrl} alt="Player" className="tile-mini-photo" />
          )}
          {!photoRevealed && tileName !== TILE_NAMES.PHOTO && (
            <div>
              <span>
                {tileContent}
                {tileName === TILE_NAMES.CAREER_STATS && isFlipped && (
                  <a
                    href={getAdvancedStatsUrl(playerData.sport)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tile-info-link"
                    onClick={(e) => e.stopPropagation()}
                    title="Learn about advanced stats"
                  >
                    <FontAwesomeIcon icon={faCircleInfo} />
                  </a>
                )}
              </span>
            </div>
          )}
          {/* {photoRevealed && index === 2 && (
            <div className="flip-back-arrow">
              <FontAwesomeIcon icon={faArrowRotateLeft} />
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
}
