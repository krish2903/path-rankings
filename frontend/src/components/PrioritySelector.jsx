import React, { useState, useEffect, useContext } from "react";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Info } from "lucide-react";
import { CountryRankingsContext } from "../contexts/CountryRankingsContext";

function LikertGroupCard({ name, description, rating, onChange }) {
  return (
    <div className={`w-full flex flex-col items-center justify-between gap-6 transition-all text-center`}>
      <div className="w-full flex flex-col items-center gap-4">
        <div className="w-full flex items-center gap-2 px-1">
          <span className="text-left font-medium text-xs md:text-sm">{name}</span>
          <Popover>
            <PopoverTrigger className="cursor-pointer"><Info size={16} /></PopoverTrigger>
            <PopoverContent className="text-xs">
              <p>{description}</p>
            </PopoverContent>
          </Popover>
        </div>
        <div className="w-full flex justify-center items-center gap-4">
          <div className="w-full flex flex-col justify-center items-center">
            <Slider
              min={0}
              max={5}
              step={1}
              value={[rating]}
              onValueChange={([val]) => onChange(val)}
            />
            <div className="flex px-1.5 justify-between w-full mt-2 text-xs font-medium text-black/60">
              {[0, 1, 2, 3, 4, 5].map(n => (
                <span key={n}>{n}</span>
              ))}
            </div>
          </div>
          <span className="flex justify-center items-center text-xs sm:text-sm px-4 py-1.5 sm:py-2 rounded-full font-semibold mb-1 bg-orange-600/80 text-white">
            {rating}/5
          </span>
        </div>
      </div>
    </div>
  );
}

export default function PrioritySelector({ groups = [], onWeightChange }) {
  const {
    pendingRatings,
    setPendingRatings,
    setPendingWeights,
  } = useContext(CountryRankingsContext);

  // If ratings for current groups do not exist, initialize them to 0
  useEffect(() => {
    if (groups.length === 0) return;
    let changed = false;
    const initial = { ...pendingRatings };
    for (const g of groups) {
      if (initial[g.id] === undefined) {
        initial[g.id] = 0;
        changed = true;
      }
    }
    if (changed) setPendingRatings(initial);
  }, [groups, pendingRatings, setPendingRatings]);

  // Whenever ratings change, update decimal weights
  useEffect(() => {
    if (!groups.length) return;
    const ratingsArr = groups.map(g => pendingRatings[g.id] || 0);
    const total = ratingsArr.reduce((sum, r) => sum + r, 0);
    let percentWeights;
    if (total === 0) {
      percentWeights = Object.fromEntries(
        groups.map(g => [g.id, 0])
      );
    } else {
      percentWeights = Object.fromEntries(
        groups.map(g => [
          g.id,
          Number((pendingRatings[g.id] / total).toFixed(2))
        ])
      );
    }
    setPendingWeights(percentWeights);
    if (onWeightChange) onWeightChange(percentWeights);
  }, [pendingRatings, setPendingWeights, groups, onWeightChange]);

  function handleRatingChange(id, value) {
    setPendingRatings((prev) => ({
      ...prev,
      [id]: value
    }));
  }

  return (
    <div className="w-full flex flex-col items-center shadow-[inset_0_2px_4px_0_hsl(var(--foreground)/0.05)]">
      <h1 className="font-medium text-center py-2">Rate Importance (1-5)</h1>
      <p className="text-sm text-black/60 mt-1 mb-2 text-center">
        Use the slider to rate <b>every group</b> from 1-5.<br />
        <b>1</b> being not important and <b>5</b> being highly important.<br />
      </p>
      <div className="w-full flex gap-4 py-4 justify-center">
        <img src="https://illustrations.popsy.co/amber/student-going-to-school.svg" className="hidden sm:block max-h-84" />
        <div className="w-full flex flex-col gap-4">
          {groups.map(g => (
            <LikertGroupCard
              key={g.id}
              name={g.name}
              description={g.description}
              rating={pendingRatings[g.id] || 0}
              onChange={val => handleRatingChange(g.id, val)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}