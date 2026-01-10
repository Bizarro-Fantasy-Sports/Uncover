import React from "react";
import type { TileType } from "@/features/athlete-unknown/config";
import { TOP_TILES } from "@/features/athlete-unknown/config";
import { PlayerData } from "@/features/athlete-unknown/types";
import { Tile } from "./Tile";

interface HintTilesProps {
  flippedTiles: TileType[];
  playerData: PlayerData;
  onTileClick: (tileName: TileType) => void;
}

export function HintTiles({
  flippedTiles,
  playerData,
  onTileClick,
}: HintTilesProps): React.ReactElement {
  return (
    <div className="grid">
      <div />
      {TOP_TILES.map((tileName: TileType, index: number) => (
        <Tile
          key={index}
          tileName={tileName}
          index={index}
          isFlipped={flippedTiles.includes(tileName)}
          photoRevealed={false}
          returningFromPhoto={false}
          playerData={playerData}
          onClick={() => onTileClick(tileName)}
        />
      ))}
    </div>
  );
}
