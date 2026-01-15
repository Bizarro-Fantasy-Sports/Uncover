import React from "react";
import { PlayerData } from "@/features/athlete-unknown/types";
import { TILES, TileType } from "@/features/athlete-unknown/config";

interface HintTileProps {
  tileName: TileType;
  index: number;
  isFlipped: boolean;
  playerData: PlayerData;
  onClick: () => void;
}

export function HintTile({
  tileName,
  isFlipped,
  playerData,
  onClick,
}: HintTileProps): React.ReactElement {
  const tileContent = String(playerData[tileName] || "");

  return (
    <div className="au-hint-tile-container" onClick={onClick}>
      <span className="au-hint-tile-label">{TILES[tileName].label}</span>
      <div className="au-hint-tile-size au-hint-tile-wrapper">
        <div className="au-hint-tile-flipped">{tileContent}</div>
        <div
          className={`au-hint-tile-unflipped ${isFlipped ? "au-hint-tile-peeled" : ""}`}
        >
          {`-${TILES[tileName].penalty} Pts`}
        </div>
      </div>
    </div>
  );
}
