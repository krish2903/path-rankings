import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getScoreBucket(score) {
  const value = Number(score);
  if (Number.isNaN(value)) {
    return {
      key: "unknown",
      label: "No Match",
      donutLabel: "N/A",
      classes: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }

  if (value >= 60) {
    return {
      key: "best",
      label: "Best Match",
      donutLabel: "Strong",
      classes: "bg-emerald-500/15 text-emerald-800 ring-2 ring-emerald-500/20",
    };
  }
  if (value >= 50) {
    return {
      key: "good",
      label: "Good Match",
      donutLabel: "Good",
      classes: "bg-amber-400/15 text-amber-800 ring-2 ring-amber-400/25",
    };
  }
  if (value >= 40) {
    return {
      key: "fair",
      label: "Fair Match",
      donutLabel: "Fair",
      classes: "bg-slate-400/15 text-slate-700 ring-2 ring-slate-400/20",
    };
  }
  return {
    key: "least",
    label: "Weak Match",
    donutLabel: "Weak",
    classes: "bg-red-600/10 text-rose-800 ring-2 ring-red-600/15",
  };
}