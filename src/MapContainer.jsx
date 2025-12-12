import { useRef, useState } from "react";
import MapOverlay from "./MapOverlay";
import InfoPanel from "./InfoPanel";
import "./globals.css";

export default function MapContainer({ onExit }) {
  const containerRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState(null);
  const [scale, setScale] = useState(1);
  const [lastTouchDistance, setLastTouchDistance] = useState(null);

  const onMouseDown = (e) => {
    setDragging(true);
    setStartPos({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const onMouseMove = (e) => {
    if (!dragging) return;
    setOffset({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y,
    });
  };

  const onMouseUp = () => setDragging(false);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);

    // Calculate the mouse position relative to the container
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate the point in the image that the mouse is over
    const imgX = (mouseX - offset.x) / scale;
    const imgY = (mouseY - offset.y) / scale;

    // Calculate new offset to keep the same point under the mouse
    const newOffsetX = mouseX - imgX * newScale;
    const newOffsetY = mouseY - imgY * newScale;

    setScale(newScale);
    setOffset({ x: newOffsetX, y: newOffsetY });
  };

  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  };

  const onTouchStart = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setLastTouchDistance(distance);
    } else if (e.touches.length === 1) {
      setDragging(true);
      setStartPos({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const onTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const distance = getTouchDistance(e.touches[0], e.touches[1]);

      if (lastTouchDistance) {
        const delta = (distance - lastTouchDistance) * 0.01;
        const newScale = Math.min(Math.max(0.5, scale + delta), 5);

        const center = getTouchCenter(e.touches[0], e.touches[1]);
        const rect = containerRef.current.getBoundingClientRect();
        const touchX = center.x - rect.left;
        const touchY = center.y - rect.top;

        const imgX = (touchX - offset.x) / scale;
        const imgY = (touchY - offset.y) / scale;

        const newOffsetX = touchX - imgX * newScale;
        const newOffsetY = touchY - imgY * newScale;

        setScale(newScale);
        setOffset({ x: newOffsetX, y: newOffsetY });
      }

      setLastTouchDistance(distance);
    } else if (e.touches.length === 1 && dragging) {
      setOffset({
        x: e.touches[0].clientX - startPos.x,
        y: e.touches[0].clientY - startPos.y,
      });
    }
  };

  const onTouchEnd = (e) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(null);
    }
    if (e.touches.length === 0) {
      setDragging(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="map-container"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {onExit && (
        <button
          className="exit-map-btn"
          onClick={(e) => {
            e.stopPropagation();
            onExit();
          }}
        >
          ← Back to Home
        </button>
      )}

      <img
        src="/defunctland-map.png"
        alt="Map"
        className="map-image"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
        draggable={false}
      />

      <MapOverlay
        offset={offset}
        scale={scale}
        onSelect={(region) => setSelected(region)}
      />

      <InfoPanel region={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
