import React from "react";
import type { TileType } from "@/features/athlete-unknown/config";
import { TOP_TILES } from "@/features/athlete-unknown/config";
import { PlayerData } from "@/features/athlete-unknown/types";
import { HintTile } from "./HintTile";

interface HintTilesProps {
  flippedTiles: TileType[];
  playerData: PlayerData;
  onHintTileClick: (tileName: TileType) => void;
}

export function HintTiles({
  flippedTiles,
  playerData,
  onHintTileClick,
}: HintTilesProps): React.ReactElement {
  return (
    <>
      {TOP_TILES.map((tileName: TileType, index: number) => (
        <HintTile
          key={index}
          tileName={tileName}
          index={index}
          isFlipped={flippedTiles.includes(tileName)}
          playerData={playerData}
          onClick={() => onHintTileClick(tileName)}
        />
      ))}
    </>
  );
}
