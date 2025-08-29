import React, { useRef, useState, useEffect } from "react";

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export default function CustomSegmentedSlider({
  groups = [],
  weights = {},
  onWeightChange = () => { },
}) {
  const INCREMENT_STEP = 1; // 1% increments
  const sliderRef = useRef(null);
  const draggingThumb = useRef(null);
  const timers = useRef({});

  // Responsive layout state (vertical/mobile if viewport width < 640px)
  const [isVertical, setIsVertical] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    const handleResize = () => setIsVertical(window.innerWidth < 640);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize percentages for mobile controls
  const initialPercentages = groups.map(
    (g) => Math.round((weights[g.id] ?? 0) * 100)
  );
  const [percentages, setPercentages] = useState(
    initialPercentages.length === groups.length
      ? initialPercentages
      : Array(groups.length).fill(Math.round(100 / groups.length))
  );

  // Redistribution logic distributing leftover evenly among other segments
  function normalizeAndDistribute(percs, idx, delta) {
    let newPer = [...percs];
    let target = clamp(newPer[idx] + delta, 0, 100);
    newPer[idx] = target;

    const total = newPer.reduce((a, b) => a + b, 0);
    if (total === 100) return newPer;

    const diff = 100 - total;
    const otherIndices = newPer
      .map((v, i) => (i !== idx ? i : null))
      .filter((v) => v !== null);

    if (otherIndices.length === 0) {
      newPer[idx] = 100;
      return newPer;
    }

    otherIndices.forEach((i) => {
      newPer[i] += diff / otherIndices.length;
    });

    // Clamp all values to [0, 100]
    newPer = newPer.map((v) => clamp(v, 0, 100));

    return newPer.map((v) => Number(v.toFixed(2)));
  }

  function handleAdjust(idx, step) {
    setPercentages((oldPer) => {
      let newPer = normalizeAndDistribute(oldPer, idx, step);

      // Minor correction to ensure sum = 100
      const total = newPer.reduce((a, b) => a + b, 0);
      if (total !== 100) {
        newPer[idx] += 100 - total;
        newPer[idx] = clamp(newPer[idx], 0, 100);
      }

      const weightsResult = {};
      groups.forEach((g, i) => {
        weightsResult[g.id] = newPer[i] / 100;
      });
      onWeightChange(weightsResult);
      return newPer;
    });
  }

  function handlePressAndHold(idx, step, isDown) {
    if (isDown) {
      handleAdjust(idx, step);
      timers.current[idx] = setTimeout(function repeat() {
        handleAdjust(idx, step);
        timers.current[idx] = setTimeout(repeat, 100);
      }, 400);
    } else {
      clearTimeout(timers.current[idx]);
    }
  }

  function handleKeyDown(idx, e) {
    if (e.key === "ArrowUp" || e.key === "+") handleAdjust(idx, INCREMENT_STEP);
    if (e.key === "ArrowDown" || e.key === "-") handleAdjust(idx, -INCREMENT_STEP);
  }

  // Desktop / horizontal slider: original logic unchanged

  const thumbsCount = groups.length - 1;
  const initialPositions = [];
  let cumSum = 0;
  for (let i = 0; i < thumbsCount; i++) {
    cumSum += weights[groups[i].id] * 100;
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

  const handleThumbKeyDown = (thumbIdx, e) => {
    setShowHint(false);
    let delta = 0;
    if (e.key === "ArrowLeft") delta = -1;
    else if (e.key === "ArrowRight") delta = 1;
    if (delta === 0) return;
    let newPositions = [...positions];
    const idx = thumbIdx;
    newPositions[idx] = clampPosition(positions[idx] + delta, idx);
    setPositions(newPositions);

    const newWeights = {};
    groups.forEach((group, i) => {
      newWeights[group.id] = desktopPercentages[i] / 100;
    });
    onWeightChange(newWeights);
  };

  const hintThumbIdx = Math.floor(positions.length / 2);

  // Mobile vertical UI (fixed equal heights, filled container)
  if (isVertical) {
    return (
      <div
        ref={sliderRef}
        className="w-full h-full flex flex-col border border-orange-400 bg-gray-100 rounded-2xl"
        style={{ height: "100%" }} 
      >
        {groups.map((group, idx) => (
          <div
            key={group.id}
            className="flex items-center justify-between border-b border-black/5 px-4"
            style={{
              flexGrow: 1,      
              minHeight: 0,     
              background: percentages[idx] === 0 ? "#f3f3f3" : "transparent",
              transition: "background-color 0.2s cubic-bezier(.4,2,.6,1)",
            }}
          >
            <button
              aria-label={`Increase ${group.name} weight`}
              disabled={percentages[idx] >= 100}
              tabIndex={0}
              className="rounded-full bg-orange-400 text-white font-extrabold text-lg"
              style={{ minWidth: 40, height: 40 }}
              onMouseDown={() => handlePressAndHold(idx, INCREMENT_STEP, true)}
              onMouseUp={() => handlePressAndHold(idx, INCREMENT_STEP, false)}
              onMouseLeave={() => handlePressAndHold(idx, INCREMENT_STEP, false)}
              onTouchStart={() => handlePressAndHold(idx, INCREMENT_STEP, true)}
              onTouchEnd={() => handlePressAndHold(idx, INCREMENT_STEP, false)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
            >
              +
            </button>
            <div className="flex-1 flex flex-col items-center justify-center px-3 py-2">
              <span
                className="block text-xs font-medium text-black/80 truncate"
                title={group.name}
              >
                {group.name}
              </span>
              <span
                className="block bg-white w-16 text-center rounded-full py-1 px-2 mt-px text-xs text-black/80"
                title={`${percentages[idx].toFixed(1)}%`}
              >
                {percentages[idx].toFixed(1)}%
              </span>
            </div>
            <button
              aria-label={`Decrease ${group.name} weight`}
              disabled={percentages[idx] <= 0}
              tabIndex={0}
              className="rounded-full bg-orange-400 text-white font-extrabold text-lg"
              style={{ minWidth: 40, height: 40 }}
              onMouseDown={() => handlePressAndHold(idx, -INCREMENT_STEP, true)}
              onMouseUp={() => handlePressAndHold(idx, -INCREMENT_STEP, false)}
              onMouseLeave={() => handlePressAndHold(idx, -INCREMENT_STEP, false)}
              onTouchStart={() => handlePressAndHold(idx, -INCREMENT_STEP, true)}
              onTouchEnd={() => handlePressAndHold(idx, -INCREMENT_STEP, false)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
            >
              -
            </button>
          </div>
        ))}
      </div>
    );
  }

  // Desktop horizontal original UI unchanged
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
              cursor: "ew-resize",
              zIndex: 2,
              outline: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              width: 48,
              height: 48,
              left: `calc(${pos}% - 16px)`,
              top: 16,
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
            {showHint && idx === Math.floor(positions.length / 2) && (
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