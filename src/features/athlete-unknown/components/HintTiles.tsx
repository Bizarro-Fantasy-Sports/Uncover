// import React from "react";
// import { HINT_KEYS, HINTS, HintType } from "../config";
// import { PlayerData } from "../types";

// interface HintTilesProps {
//   playerData: PlayerData;
//   hintsUsed: HintType[];
//   onHintClick: (hintKey: HintType) => void;
// }

// export function HintTiles({
//   playerData,
//   hintsUsed,
//   onHintClick,
// }: HintTilesProps): React.ReactElement {
//   return (
//     <>
//       {HINT_KEYS.map((hintKey) => {
//         const playerDataValue = playerData?.[hintKey];
//         if (!playerDataValue) {
//           return null; // just a placeholder until re-design. See below comment
//         }
//         const isFlipped = hintsUsed.includes(hintKey);
//         return (
//           <div
//             className="tile"
//             onClick={() => onHintClick(hintKey)}
//             key={hintKey}
//             // make button disabled instead of return null
//           >
//             <div className={`tile-inner ${isFlipped ? "flipped" : ""}`}>
//               <div className="tile-front">{HINTS[hintKey].label}</div>
//               <div className="tile-back">
//                 <div>{playerDataValue}</div>
//               </div>
//             </div>
//           </div>
//         );
//       })}
//     </>
//   );
// }

export {};
