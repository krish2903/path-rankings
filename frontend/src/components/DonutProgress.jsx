import React, { useState } from "react";

const DonutProgress = ({ value, size = 60, strokeWidth = 6, Icon, tooltip }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  // Local state to track hover, to control tooltip visibility
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex flex-col gap-2 items-center justify-center relative w-max"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={tooltip}
    >
      {/* Donut container with tooltip */}
      <div
        className="relative cursor-default"
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
          aria-hidden="true"
          focusable="false"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-gray-300"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-orange-600 transition-all duration-300 ease-in-out"
          />
        </svg>

        {/* Centered Icon */}
        {Icon && (
          <Icon
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black/80 pointer-events-none"
            size={size / 4}
          />
        )}

        {/* Tooltip */}
        <div
          className={`
            absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
            px-2 py-1 rounded bg-white text-black/80 text-xs whitespace-nowrap
            pointer-events-none select-none
            transition-opacity duration-200 shadow-lg
            ${isHovered ? "opacity-100 visible" : "opacity-0 invisible"}
            z-50
          `}
          role="tooltip"
        >
          {tooltip}
          <svg
            className="absolute top-full left-1/2 -translate-x-1/2 fill-white"
            width="12"
            height="6"
            viewBox="0 0 12 6"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M0 0 L6 6 L12 0 Z" />
          </svg>
        </div>
      </div>

      {/* Percentage text */}
      <div className="flex items-center justify-center">
        <span className="text-xs font-bold text-orange-600 select-none">
          {value}%
        </span>
      </div>
    </div>
  );
};

export default DonutProgress;
