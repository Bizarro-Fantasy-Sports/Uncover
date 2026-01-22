import React from "react";
import {
  GRID_TILES,
  PHOTO_GRID,
  TILE_NAMES,
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

  // Calculate SVG path for a curved string between two tile indices
  const getStringPath = (fromIndex: number, toIndex: number) => {
    const TILE_SIZE = 125; // in px
    const GAP = 5; // 0.2rem * 16px
    const CELL_SIZE = TILE_SIZE + GAP;
    const SAG_AMOUNT = 10; // How much the string droops

    const getPin = (index: number) => ({
      x: (index % 3) * CELL_SIZE + TILE_SIZE / 2, // mid-point for x-axis
      y: Math.floor(index / 3) * CELL_SIZE + 4, // top of post-it for y-axis
    });

    const from = getPin(fromIndex);
    const to = getPin(toIndex);

    // Calculate midpoint and perpendicular offset for sag
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;

    // Perpendicular direction (rotate 90 degrees, pointing down for sag)
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    // Control point is offset perpendicular to the line (downward sag)
    const perpX = -dy / length;
    const perpY = dx / length;

    // Sag downward (positive Y is down in screen coords)
    const controlX = midX + perpX * SAG_AMOUNT;
    const controlY = midY + perpY * SAG_AMOUNT;

    return {
      from,
      to,
      controlX,
      controlY,
      path: `M ${from.x} ${from.y} Q ${controlX} ${controlY} ${to.x} ${to.y}`,
    };
  };

  const filteredFlippedTiles: TileType[] = flippedTiles.filter(
    (t) => t !== TILE_NAMES.INITIALS && t !== TILE_NAMES.NICKNAMES // do not draw strings to initials or nickanmes
  );
  const stringConnections: [TileType, TileType][] = filteredFlippedTiles
    .slice(0, -1)
    .map((value, index) => [value, filteredFlippedTiles[index + 1]]);
  const activeStrings = stringConnections.filter(
    ([from, to]) => flippedTiles.includes(from) && flippedTiles.includes(to)
  );
  console.log("AVTVE", stringConnections);

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
      {stringConnections.length > 0 && (
        <svg className="red-string-svg">
          {stringConnections.map(([from, to], i) => {
            const {
              path,
              from: fromPt,
              to: toPt,
            } = getStringPath(GRID_TILES.indexOf(from), GRID_TILES.indexOf(to));
            return (
              <g key={`string-${i}`} className="red-string-group">
                <path d={path} className="red-string-path" />
                <circle
                  cx={fromPt.x}
                  cy={fromPt.y}
                  r="3"
                  className="red-string-pin"
                />
                <circle
                  cx={toPt.x}
                  cy={toPt.y}
                  r="3"
                  className="red-string-pin"
                />
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
