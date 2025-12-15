import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getDonutScoreBucket(score) {
  const value = Number(score);
  if (Number.isNaN(value)) {
    return {
      key: "unknown",
      donutLabel: "N/A",
      classes: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }

  if (value >= 80) {
    return {
      key: "best",
      donutLabel: "Strong",
      classes: "bg-emerald-500/15 text-emerald-800 ring-2 ring-emerald-500/20",
    };
  }
  if (value >= 70) {
    return {
      key: "good",
      donutLabel: "Good",
      classes: "bg-amber-400/15 text-amber-800 ring-2 ring-amber-400/25",
    };
  }
  if (value >= 50) {
    return {
      key: "fair",
      donutLabel: "Fair",
      classes: "bg-slate-400/15 text-slate-700 ring-2 ring-slate-400/20",
    };
  }
  return {
    key: "least",
    donutLabel: "Weak",
    classes: "bg-red-600/10 text-rose-800 ring-2 ring-red-600/15",
  };
}

// Classes style for bucket types
const bucketStyleMap = {
  "Best Match": {
    classes: "bg-emerald-500/15 text-emerald-800 ring-2 ring-emerald-500/20"
  },
  "Good Match": {
    classes: "bg-amber-400/15 text-amber-800 ring-2 ring-amber-400/25"
  },
  "Fair Match": {
    classes: "bg-slate-400/15 text-slate-700 ring-2 ring-slate-400/20"
  },
  "Rest": {
    classes: "bg-red-600/10 text-rose-800 ring-2 ring-red-600/15"
  }
};

export const bucketHeaderStyles = {
  "Best Match": "bg-gradient-to-t from-emerald-500/15 to-emerald-500/10 text-emerald-800",
  "Good Match": "bg-gradient-to-t from-amber-400/15 to-amber-400/10 text-amber-800",
  "Fair Match": "bg-gradient-to-t from-slate-400/15 to-slate-400/10 text-slate-700",
  "Rest": "bg-gradient-to-t from-red-600/10 to-red-600/5 text-rose-800",
};

export function getCountryBuckets(ranks) {
  if (!ranks || !Array.isArray(ranks) || ranks.length === 0) return [];

  // Filter and sort by score descending
  const validScores = ranks
    .map((item) => ({
      ...item,
      score: typeof item.score === "number" ? item.score : Number(item.score)
    }))
    .filter((item) => !isNaN(item.score))
    .sort((a, b) => b.score - a.score);

  return validScores.map((item, idx) => {
    let bucketLabel;
    if (idx < 3) {
      bucketLabel = "Best Match";
    } else if (idx < 9) {
      bucketLabel = "Good Match";
    } else if (idx < 17) {
      bucketLabel = "Fair Match";
    } else {
      bucketLabel = "Rest";
    }

    return {
      ...item,
      bucket: bucketLabel,
      ...bucketStyleMap[bucketLabel]
    };
  });
}

export function getUniBuckets(ranks) {
  if (!ranks || !Array.isArray(ranks) || ranks.length === 0) return [];

  // Filter and sort by score descending
  const validScores = ranks
    .map((item) => ({
      ...item,
      score: typeof item.score === "number" ? item.score : Number(item.score)
    }))
    .filter((item) => !isNaN(item.score))
    .sort((a, b) => b.score - a.score);

  const totalItems = validScores.length;
  let bucketLabel;

  if (totalItems <= 100) {
    // Percentage-based bucketing with Math.ceil rounding up
    const bestMatchCount = Math.ceil(totalItems * 0.1);
    const goodMatchCount = Math.ceil(totalItems * 0.2);
    const fairMatchCount = Math.ceil(totalItems * 0.3);

    return validScores.map((item, idx) => {
      if (idx < bestMatchCount) {
        bucketLabel = "Best Match";
      } else if (idx < bestMatchCount + goodMatchCount) {
        bucketLabel = "Good Match";
      } else if (idx < bestMatchCount + goodMatchCount + fairMatchCount) {
        bucketLabel = "Fair Match";
      } else {
        bucketLabel = "Rest";
      }

      return {
        ...item,
        bucket: bucketLabel,
        ...bucketStyleMap[bucketLabel]
      };
    });
  } else {
    // Fixed thresholds for >100 items
    return validScores.map((item, idx) => {
      if (idx < 10) {
        bucketLabel = "Best Match";
      } else if (idx < 30) {
        bucketLabel = "Good Match";
      } else if (idx < 60) {
        bucketLabel = "Fair Match";
      } else {
        bucketLabel = "Rest";
      }

      return {
        ...item,
        bucket: bucketLabel,
        ...bucketStyleMap[bucketLabel]
      };
    });
  }
}