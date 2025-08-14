import React, { useRef, useState, useEffect } from "react";

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export default function CustomSegmentedSlider({
  groups = [],
  weights = {},
  onWeightChange = () => { },
}) {
  const thumbsCount = groups.length - 1;

  // Calculate initial positions in % (from weights)
  const initialPositions = [];
  let cumSum = 0;
  for (let i = 0; i < thumbsCount; i++) {
    cumSum += weights[groups[i].id] * 100;
    initialPositions.push(Math.round(cumSum));
  }

  const [positions, setPositions] = useState(initialPositions);
  const sliderRef = useRef(null);
  const draggingThumb = useRef(null);

  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [touchedIdx, setTouchedIdx] = useState(null);

  // Detect if vertical layout based on window width (mobile)
  const [isVertical, setIsVertical] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsVertical(window.innerWidth < 640); 
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Calculate percentages either width or height based on layout
  const percentages = [];
  for (let i = 0; i < groups.length; i++) {
    if (i === 0) {
      percentages.push(positions[0]);
    } else if (i === groups.length - 1) {
      percentages.push(100 - positions[positions.length - 1]);
    } else {
      percentages.push(positions[i] - positions[i - 1]);
    }
  }

  // Clamp position based on neighbors respecting vertical/horizontal
  const clampPosition = (pos, idx) => {
    const min = idx === 0 ? 0 : positions[idx - 1];
    const max = idx === thumbsCount - 1 ? 100 : positions[idx + 1];
    return clamp(pos, min, max);
  };

  const updatePositionFromPointer = (clientX, clientY) => {
    if (!sliderRef.current || draggingThumb.current == null) return;

    const rect = sliderRef.current.getBoundingClientRect();
    let percent;

    if (isVertical) {
      // vertical: top = 0%, bottom = 100%
      const y = clamp(clientY - rect.top, 0, rect.height);
      // Convert y to percent from top
      percent = Math.round((y / rect.height) * 100);
    } else {
      // horizontal
      const x = clamp(clientX - rect.left, 0, rect.width);
      percent = Math.round((x / rect.width) * 100);
    }

    let newPositions = [...positions];
    const idx = draggingThumb.current;
    newPositions[idx] = clampPosition(percent, idx);
    setPositions(newPositions);

    // Compute weights from positions
    const newPercentages = [];
    for (let i = 0; i < groups.length; i++) {
      if (i === 0) {
        newPercentages.push(newPositions[0]);
      } else if (i === groups.length - 1) {
        newPercentages.push(100 - newPositions[newPositions.length - 1]);
      } else {
        newPercentages.push(newPositions[i] - newPositions[i - 1]);
      }
    }
    const newWeights = {};
    groups.forEach((group, i) => {
      newWeights[group.id] = newPercentages[i] / 100;
    });
    onWeightChange(newWeights);
  };

  // Mouse event handlers
  const handleThumbMouseDown = (thumbIdx, e) => {
    e.preventDefault();
    draggingThumb.current = thumbIdx;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (draggingThumb.current == null) return;
    updatePositionFromPointer(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    draggingThumb.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Touch event handlers
  const handleThumbTouchStart = (thumbIdx, e) => {
    e.preventDefault();
    draggingThumb.current = thumbIdx;
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
  };

  const handleTouchMove = (e) => {
    if (draggingThumb.current == null) return;
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updatePositionFromPointer(touch.clientX, touch.clientY);
      e.preventDefault();
    }
  };

  const handleTouchEnd = () => {
    draggingThumb.current = null;
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    document.removeEventListener("touchcancel", handleTouchEnd);
  };

  const handleThumbKeyDown = (thumbIdx, e) => {
    let delta = e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 :
      e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : 0;
    if (delta === 0) return;

    let newPositions = [...positions];
    const idx = thumbIdx;
    newPositions[idx] = clampPosition(positions[idx] + delta, idx);
    setPositions(newPositions);

    const newPercentages = [];
    for (let i = 0; i < groups.length; i++) {
      if (i === 0) {
        newPercentages.push(newPositions[0]);
      } else if (i === groups.length - 1) {
        newPercentages.push(100 - newPositions[newPositions.length - 1]);
      } else {
        newPercentages.push(newPositions[i] - newPositions[i - 1]);
      }
    }
    const newWeights = {};
    groups.forEach((group, i) => {
      newWeights[group.id] = newPercentages[i] / 100;
    });
    onWeightChange(newWeights);
  };

  return (
    <div className="w-full select-none">
      <div
        ref={sliderRef}
        className={`relative bg-gray-100 ${isVertical ? "w-full h-72 rounded-2xl border border-orange-400" : "w-full h-18 flex rounded-full"
          }`}
      >
        {/* Track Segments */}
        {groups.map((group, idx) => (
          <div
            key={group.id}
            className={`bg-transparent flex flex-col items-center justify-center relative border-black/5 px-4 ${isVertical
              ? "border-b border-t first:border-t-0 last:border-b-0"
              : "gap-0.5 border-r border-l"
              }`}
            style={{
              ...(isVertical
                ? { height: `${percentages[idx]}%`, width: "100%", boxSizing: "border-box", transition: "height 0.2s cubic-bezier(.4,2,.6,1)" }
                : { width: `${percentages[idx]}%`, height: "100%", boxSizing: "border-box", transition: "width 0.2s cubic-bezier(.4,2,.6,1)" }),
            }}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <span
              className="block text-sm font-medium text-black/80 leading-wide max-w-full cursor-default truncate"
              title={group.name}
              aria-describedby={`tooltip-${group.id}`}
            >
              {group.name}
            </span>

            {/* Tooltip */}
            {(hoveredIdx === idx || touchedIdx === idx) && group.description && (
              <div
                id={`tooltip-${group.id}`}
                role="tooltip"
                className={`absolute z-50 bg-white border border-gray-300 rounded-lg shadow-lg text-xs text-gray-900 px-3 py-2 pointer-events-none max-w-xs max-h-48 overflow-auto ${isVertical
                  ? "top-full mt-1 left-1/2 transform -translate-x-1/2 origin-top"
                  : "top-full mt-1 left-1/2 transform -translate-x-1/2 origin-top"
                  }`}
                style={{ width: 180 }}
              >
                {group.description}
                <div
                  className={`absolute bg-white border-l border-t border-gray-300 rotate-45 ${isVertical
                    ? "top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-3"
                    : "top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-3"
                    }`}
                  style={{ width: 12, height: 12 }}
                />
              </div>
            )}

            <span
              className="block max-w-full bg-white rounded-full py-1 px-3 mt-px text-xs text-black/80 truncate"
              title={`${percentages[idx].toFixed(1)}%`}
            >
              {percentages[idx].toFixed(1)}%
            </span>
          </div>
        ))}

        {/* Thumbs */}
        {positions.map((pos, idx) => (
          <div
            key={idx}
            tabIndex={0}
            role="slider"
            aria-label={`Adjust ${groups[idx].name} weight`}
            aria-valuemin={idx === 0 ? 0 : positions[idx - 1]}
            aria-valuemax={idx === thumbsCount - 1 ? 100 : positions[idx + 1]}
            aria-valuenow={positions[idx]}
            onMouseDown={(e) => handleThumbMouseDown(idx, e)}
            onTouchStart={(e) => handleThumbTouchStart(idx, e)}
            onKeyDown={(e) => handleThumbKeyDown(idx, e)}
            style={{
              position: "absolute",
              cursor: isVertical ? "ns-resize" : "ew-resize",
              zIndex: 2,
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              width: 32,
              height: 40,
              left: isVertical ? "50%" : `calc(${pos}% - 16px)`,
              top: isVertical ? `calc(${pos}% - 20px)` : 16,
              transform: isVertical ? "translateX(-50%)" : "none",
            }}
          >
            <div
              style={{
                width: isVertical ? 20 : 8,
                height: isVertical ? 8 : 20,
                borderRadius: "50%",
                background: "#f97316",
                border: "4px solid #f97316",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
