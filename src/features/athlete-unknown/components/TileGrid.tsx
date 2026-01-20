import React from "react";
import {
  GRID_TILES,
  PHOTO_GRID,
  TileType,
} from "@/features/athlete-unknown/config";
import { Tile } from "./Tile";
import type { PlayerData } from "@/features/athlete-unknown/types";

interface TileGridProps {
  flippedTiles: TileType[];
  photoRevealed: boolean;
  returningFromPhoto: boolean;
  playerData: PlayerData;
  onTileClick: (tileName: TileType) => void;
}

export function TileGrid({
  flippedTiles,
  photoRevealed,
  returningFromPhoto,
  playerData,
  onTileClick,
}: TileGridProps): React.ReactElement {
  const photoUrl = playerData.photo || "";

  // Calculate background position for photo segments (3x3 grid)
  const getPhotoSegmentStyle = (index: number): React.CSSProperties => {
    const col = index % PHOTO_GRID.COLS;
    const row = Math.floor(index / PHOTO_GRID.COLS);
    const xPos = col * PHOTO_GRID.TILE_WIDTH;
    const yPos = row * PHOTO_GRID.TILE_HEIGHT;

    return {
      backgroundImage: `url(${photoUrl})`,
      backgroundPosition: `-${xPos}px -${yPos}px`,
    };
  };

  return (
    <div className="grid">
      {GRID_TILES.map((tileName: TileType, index: number) => (
        <Tile
          key={index}
          tileName={tileName}
          index={index}
          isFlipped={flippedTiles.includes(tileName)}
          photoRevealed={photoRevealed}
          returningFromPhoto={returningFromPhoto}
          playerData={playerData}
          photoSegmentStyle={
            photoRevealed ? getPhotoSegmentStyle(index) : undefined
          }
          onClick={() => onTileClick(tileName)}
        />
      ))}
    </div>
  );
}
