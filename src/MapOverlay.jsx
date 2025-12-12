import { hotspots } from "./Hotspot.js";
import Hotspot from "./Hotspot.jsx";

export default function MapOverlay({ offset, scale, onSelect }) {
  return (
    <svg
      className="map-overlay"
      viewBox="0 0 1703 1317"
      preserveAspectRatio="xMidYMid meet"
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: "0 0",
      }}
    >
      {hotspots.map((h) => (
        <Hotspot key={h.id} data={h} onSelect={onSelect} />
      ))}
    </svg>
  );
}
