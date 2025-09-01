import React, { useRef, useState, useEffect } from "react";

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

export default function CustomSegmentedSlider({
  groups = [],
  weights = {},
  onWeightChange = () => { },
}) {
  // --- CONFIG ---
  const CONTAINER_HEIGHT = 350;
  const MIN_SEGMENT_HEIGHT = 40; 
  const INCREMENT_STEP = 0.5; 
  const sliderRef = useRef(null);
  const draggingThumb = useRef(null);
  const timers = useRef({});
  const [isVertical, setIsVertical] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsVertical(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- State Setup ---
  const initialPercentages = groups.map(g =>
    Math.round((weights[g.id] ?? 0) * 100)
  );
  const [percentages, setPercentages] = useState(
    initialPercentages.length === groups.length
      ? initialPercentages
      : Array(groups.length).fill(Math.round(100 / groups.length))
  );

  // --- DESKTOP STATE ---
  const thumbsCount = groups.length - 1;
  const initialPositions = [];
  let cumSum = 0;
  for (let i = 0; i < thumbsCount; i++) {
    cumSum += (weights[groups[i].id] ?? 0) * 100;
    initialPositions.push(Math.round(cumSum));
  }
  const [positions, setPositions] = useState(initialPositions);

  const desktopPercentages = [];
  for (let i = 0; i < groups.length; i++) {
    if (i === 0) desktopPercentages.push(positions[0]);
    else if (i === groups.length - 1)
      desktopPercentages.push(100 - positions[positions.length - 1]);
    else desktopPercentages.push(positions[i] - positions[i - 1]);
  }
  const clampPosition = (pos, idx) => {
    const min = idx === 0 ? 0 : positions[idx - 1];
    const max = idx === thumbsCount - 1 ? 100 : positions[idx + 1];
    return clamp(pos, min, max);
  };

  const updatePositionFromPointer = (clientX) => {
    if (!sliderRef.current || draggingThumb.current == null) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const percent = Math.round((x / rect.width) * 100);
    let newPositions = [...positions];
    const idx = draggingThumb.current;
    newPositions[idx] = clampPosition(percent, idx);
    setPositions(newPositions);

    const newWeights = {};
    groups.forEach((group, i) => {
      newWeights[group.id] = desktopPercentages[i] / 100;
    });
    onWeightChange(newWeights);
  };

  // --- Mouse/Touch ---
  const handleThumbMouseDown = (thumbIdx, e) => {
    e.preventDefault();
    setShowHint(false);
    draggingThumb.current = thumbIdx;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (draggingThumb.current == null) return;
    updatePositionFromPointer(e.clientX);
  };
  const handleMouseUp = () => {
    draggingThumb.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const handleThumbTouchStart = (thumbIdx, e) => {
    e.preventDefault();
    setShowHint(false);
    draggingThumb.current = thumbIdx;
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
    document.addEventListener("touchcancel", handleTouchEnd);
  };
  const handleTouchMove = (e) => {
    if (draggingThumb.current == null) return;
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      updatePositionFromPointer(touch.clientX);
      e.preventDefault();
    }
  };
  const handleTouchEnd = () => {
    draggingThumb.current = null;
    document.removeEventListener("touchmove", handleTouchMove);
    document.removeEventListener("touchend", handleTouchEnd);
    document.removeEventListener("touchcancel", handleTouchEnd);
  };

  const hintThumbIdx = Math.floor(positions.length / 2);

  // --- VERTICAL HEIGHT CALC ---
  function calculateProportionalHeights(inputPercentages) {
    let desired = inputPercentages.map(
      pct => (pct / 100) * CONTAINER_HEIGHT
    );
    let minHeights = desired.map(h => Math.max(MIN_SEGMENT_HEIGHT, h));
    let overflow = sum(minHeights) - CONTAINER_HEIGHT;

    if (overflow > 0) {
      let flexIndices = [];
      let flexHeights = 0;
      minHeights.forEach((h, i) => {
        if (desired[i] > MIN_SEGMENT_HEIGHT) {
          flexIndices.push(i);
          flexHeights += desired[i];
        }
      });
      if (flexIndices.length > 0) {
        let ratio = (flexHeights - overflow) / flexHeights;
        minHeights = minHeights.map((h, i) =>
          flexIndices.includes(i)
            ? Math.max(MIN_SEGMENT_HEIGHT, desired[i] * ratio)
            : h
        );
      }
    }
    return minHeights;
  }

  // --- MOBILE ---
  function renderVertical() {
    const heights = calculateProportionalHeights(percentages);

    function handleBoundaryAdjust(idx, direction) {
      setPercentages(oldPer => {
        let newPer = [...oldPer];
        if (direction === "up") {
          if (oldPer[idx + 1] > 0) {
            newPer[idx] = clamp(newPer[idx] + INCREMENT_STEP, 0, 100);
            newPer[idx + 1] = clamp(newPer[idx + 1] - INCREMENT_STEP, 0, 100);
          }
        } else if (direction === "down") {
          if (oldPer[idx] > 0) {
            newPer[idx] = clamp(newPer[idx] - INCREMENT_STEP, 0, 100);
            newPer[idx + 1] = clamp(newPer[idx + 1] + INCREMENT_STEP, 0, 100);
          }
        }

        const tot = sum(newPer);
        if (tot !== 100) {
          const diff = 100 - tot;
          let maxIdx = newPer.reduce(
            (max, n, i, arr) => (n > arr[max] ? i : max),
            0
          );
          newPer[maxIdx] = clamp(newPer[maxIdx] + diff, 0, 100);
        }

        const weightsResult = {};
        groups.forEach((g, i) => {
          weightsResult[g.id] = newPer[i] / 100;
        });
        onWeightChange(weightsResult);
        return newPer;
      });
    }

    function handleBoundaryPressAndHold(idx, direction, isDown) {
      const key = `${idx}-${direction}`;
      if (isDown) {
        handleBoundaryAdjust(idx, direction);
        timers.current[key] = setTimeout(function repeat() {
          handleBoundaryAdjust(idx, direction);
          timers.current[key] = setTimeout(repeat, 100);
        }, 400);
      } else {
        clearTimeout(timers.current[key]);
      }
    }

    return (
      <div
        ref={sliderRef}
        className="w-full"
        style={{
          height: CONTAINER_HEIGHT,
          minHeight: CONTAINER_HEIGHT,
          maxHeight: CONTAINER_HEIGHT,
          display: "flex",
          flexDirection: "column",
          border: "1px solid #f97316",
          background: "#f9fafb",
          borderRadius: "1.5rem",
          overflow: "hidden",
        }}
      >
        {groups.map((group, idx) => (
          <React.Fragment key={group.id}>
            {/* Segment */}
            <div
              className="flex items-center justify-center border-b border-black/5 px-8"
              style={{
                transition: "height 0.2s cubic-bezier(.4,2,.6,1)",
                height: `${heights[idx]}px`,
                minHeight: `${MIN_SEGMENT_HEIGHT}px`,
                background:
                  percentages[idx] === 0 ? "#f3f3f3" : "transparent",
                color: percentages[idx] === 0 ? "#aaa" : "inherit",
              }}
            >
              <div className="flex-1 flex items-center justify-between gap-8 px-8 py-2">
                <span
                  className="block text-xs font-medium"
                  title={group.name}
                  style={{ color: percentages[idx] === 0 ? "#aaa" : "inherit" }}
                >
                  {group.name}
                </span>
                <span
                  className="block bg-white text-center rounded-full py-1 px-2 mt-px text-xs"
                  title={`${percentages[idx].toFixed(1)}%`}
                  style={{ color: percentages[idx] === 0 ? "#aaa" : "inherit" }}
                >
                  {percentages[idx].toFixed(1)}%
                </span>
              </div>
            </div>
            {/* Boundary controls */}
            {idx < groups.length - 1 && (
              <div className="relative flex justify-between items-center select-none">
                <button
                  aria-label={`Move weight from ${groups[idx + 1].name} to ${groups[idx].name}`}
                  className="absolute -top-4 left-4 rounded-full bg-orange-400 text-white font-bold text-lg h-8 w-8"
                  disabled={percentages[idx + 1] <= 0}
                  onMouseDown={() =>
                    handleBoundaryPressAndHold(idx, "up", true)
                  }
                  onMouseUp={() =>
                    handleBoundaryPressAndHold(idx, "up", false)
                  }
                  onMouseLeave={() =>
                    handleBoundaryPressAndHold(idx, "up", false)
                  }
                  onTouchStart={() =>
                    handleBoundaryPressAndHold(idx, "up", true)
                  }
                  onTouchEnd={() =>
                    handleBoundaryPressAndHold(idx, "up", false)
                  }
                >
                  ↓
                </button>
                <button
                  aria-label={`Move weight from ${groups[idx].name} to ${groups[idx + 1].name}`}
                  className="absolute -top-4 right-4 rounded-full bg-orange-400 text-white font-bold text-lg h-8 w-8"
                  disabled={percentages[idx] <= 0}
                  onMouseDown={() =>
                    handleBoundaryPressAndHold(idx, "down", true)
                  }
                  onMouseUp={() =>
                    handleBoundaryPressAndHold(idx, "down", false)
                  }
                  onMouseLeave={() =>
                    handleBoundaryPressAndHold(idx, "down", false)
                  }
                  onTouchStart={() =>
                    handleBoundaryPressAndHold(idx, "down", true)
                  }
                  onTouchEnd={() =>
                    handleBoundaryPressAndHold(idx, "down", false)
                  }
                >
                  ↑
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // --- DESKTOP ---
  function renderDesktop() {
    return (
      <div className="w-full select-none">
        <div
          ref={sliderRef}
          className="relative bg-gray-100 w-full h-18 flex rounded-full"
        >
          {groups.map((group, idx) => (
            <div
              key={group.id}
              className="bg-transparent flex-col gap-0.5 border-r border-l first:border-l-0 last:border-r-0 flex items-center justify-center relative border-black/5 px-4"
              style={{
                width: `${desktopPercentages[idx]}%`,
                boxSizing: "border-box",
                transition: "width 0.2s cubic-bezier(.4,2,.6,1)",
              }}
            >
              <span
                className="block min-w-0 w-full text-center text-sm font-medium text-black/80 truncate"
                title={group.name}
              >
                {group.name}
              </span>
              <span
                className="block min-w-16 text-center bg-white rounded-full py-1 px-3 mt-px text-xs text-black/80 truncate"
                title={`${desktopPercentages[idx].toFixed(1)}%`}
              >
                {desktopPercentages[idx].toFixed(1)}%
              </span>
            </div>
          ))}
          {positions.map((pos, idx) => (
            <div
              key={idx}
              onMouseDown={(e) => handleThumbMouseDown(idx, e)}
              onTouchStart={(e) => handleThumbTouchStart(idx, e)}
              style={{
                position: "absolute",
                cursor: "ew-resize",
                zIndex: 2,
                outline: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "none",
                width: 48,
                height: 48,
                left: `calc(${pos}% - 24px)`,
                top: 12,
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 20,
                  borderRadius: "50%",
                  background: "#f97316",
                  border: "4px solid #f97316",
                }}
              />
              {showHint && idx === hintThumbIdx && (
                <div className="hint-arrow-circle horizontal">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="12" fill="#666" />
                    <path
                      d="M8 12 L16 12 M12 8 L16 12 L12 16"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return isVertical ? renderVertical() : renderDesktop();
}