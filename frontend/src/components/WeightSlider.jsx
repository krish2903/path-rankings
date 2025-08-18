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

  // Initial positions from weights
  const initialPositions = [];
  let cumSum = 0;
  for (let i = 0; i < thumbsCount; i++) {
    cumSum += weights[groups[i].id] * 100;
    initialPositions.push(Math.round(cumSum));
  }

  const [positions, setPositions] = useState(initialPositions);
  const sliderRef = useRef(null);
  const draggingThumb = useRef(null);

  // Always show hint on load until user interacts
  const [showHint, setShowHint] = useState(true);

  // Layout (mobile vertical)
  const [isVertical, setIsVertical] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsVertical(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Percentages for segments
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
      const y = clamp(clientY - rect.top, 0, rect.height);
      percent = Math.round((y / rect.height) * 100);
    } else {
      const x = clamp(clientX - rect.left, 0, rect.width);
      percent = Math.round((x / rect.width) * 100);
    }

    let newPositions = [...positions];
    const idx = draggingThumb.current;
    newPositions[idx] = clampPosition(percent, idx);
    setPositions(newPositions);

    // Update weights
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

  // Mouse
  const handleThumbMouseDown = (thumbIdx, e) => {
    e.preventDefault();
    setShowHint(false); // Hide hint
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

  // Touch
  const handleThumbTouchStart = (thumbIdx, e) => {
    e.preventDefault();
    setShowHint(false); // Hide hint
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

  // Keyboard
  const handleThumbKeyDown = (thumbIdx, e) => {
    setShowHint(false); // Hide hint
    let delta =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? -1
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? 1
          : 0;
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

  // Show hint on middle thumb
  const hintThumbIdx = Math.floor(positions.length / 2);

  return (
    <div className="w-full select-none">
      <div
        ref={sliderRef}
        className={`relative bg-gray-100 ${isVertical
            ? "w-full h-72 rounded-2xl border border-orange-400"
            : "w-full h-18 flex rounded-full"
          }`}
      >
        {/* Segments */}
        {groups.map((group, idx) => (
          <div
            key={group.id}
            className={`bg-transparent flex flex-col items-center justify-center relative border-black/5 px-4 ${isVertical
                ? "border-b border-t first:border-t-0"
                : "gap-0.5 border-r border-l first:border-l-0 last:border-r-0"
              }`}
            style={{
              ...(isVertical
                ? { height: `${percentages[idx]}%` }
                : { width: `${percentages[idx]}%` }),
              boxSizing: "border-box",
              transition: isVertical
                ? "height 0.2s cubic-bezier(.4,2,.6,1)"
                : "width 0.2s cubic-bezier(.4,2,.6,1)",
            }}
          >
            <span
              className="block min-w-0 w-full text-center text-sm font-medium text-black/80 truncate"
              title={group.name}
            >
              {group.name}
            </span>
            <span
              className="block min-w-0 bg-white rounded-full py-1 px-3 mt-px text-xs text-black/80 truncate"
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
                height: isVertical ? 10 : 20,
                borderRadius: "50%",
                background: "#f97316",
                border: "4px solid #f97316",
              }}
            />
            {showHint && idx === hintThumbIdx && (
              <div
                className={`hint-arrow-circle ${isVertical ? "vertical" : "horizontal"
                  }`}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="12" cy="12" r="12" fill="#666" />
                  {isVertical ? (
                    <path
                      d="M12 16 L12 8 M8 12 L12 8 L16 12"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : (
                    <path
                      d="M8 12 L16 12 M12 8 L16 12 L12 16"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}