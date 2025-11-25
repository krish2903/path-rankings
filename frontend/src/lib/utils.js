import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { kmeans } from 'ml-kmeans';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getDonutScoreBucket(score) {
  const value = Number(score);
  if (Number.isNaN(value)) {
    return {
      key: "unknown",
      label: "No Match",
      donutLabel: "N/A",
      classes: "bg-slate-100 text-slate-700 border border-slate-200",
    };
  }

  if (value >= 80) {
    return {
      key: "best",
      label: "Best Match",
      donutLabel: "Strong",
      classes: "bg-emerald-500/15 text-emerald-800 ring-2 ring-emerald-500/20",
    };
  }
  if (value >= 70) {
    return {
      key: "good",
      label: "Good Match",
      donutLabel: "Good",
      classes: "bg-amber-400/15 text-amber-800 ring-2 ring-amber-400/25",
    };
  }
  if (value >= 50) {
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
  "Weak Match": {
    classes: "bg-red-600/10 text-rose-800 ring-2 ring-red-600/15"
  }
};

function assignGrades(scoresInBucket) {
  const sorted = [...scoresInBucket].sort((a, b) => b.score - a.score);
  const n = sorted.length;
  return sorted.map((item, i) => {
    const pct = (i + 1) / n;
    let grade;
    if (pct <= 0.2) grade = 'A+';
    else if (pct <= 0.4) grade = 'A';
    else if (pct <= 0.6) grade = 'B';
    else if (pct <= 0.8) grade = 'C';
    else grade = 'D';
    return { ...item, grade };
  });
}

export function getBuckets(ranks) {
  if (!ranks || !Array.isArray(ranks) || ranks.length === 0) return [];
  const bucketLabels = ['Best Match', 'Good Match', 'Fair Match', 'Weak Match'];
  const numBuckets = bucketLabels.length;
  const validScores = ranks
    .map((item) => ({
      ...item,
      score: typeof item.score === "number" ? item.score : Number(item.score)
    }))
    .filter((item) => !isNaN(item.score));

  const scoreArr = validScores.map((item) => [item.score]);
  const maxClusters = Math.min(numBuckets, scoreArr.length);

  if (scoreArr.length < 2) {
    return validScores.map(item => ({
      ...item,
      bucket: bucketLabels[0],
      ...bucketStyleMap[bucketLabels[0]],
      grade: "A+"
    }));
  }

  const { clusters, centroids } = kmeans(scoreArr, maxClusters);

  if (!centroids || !clusters) {
    return validScores.map((item, idx) => ({
      ...item,
      bucket: bucketLabels[Math.min(idx, bucketLabels.length - 1)],
      ...bucketStyleMap[bucketLabels[Math.min(idx, bucketLabels.length - 1)]],
      grade: "A"
    }));
  }

  // Sort centroids descending (high = better)
  const sortedCentroidIndices = centroids
    .map((c, i) => ({ i, v: c[0] }))
    .sort((a, b) => b.v - a.v)
    .map(obj => obj.i);

  const clusterToLabel = {};
  sortedCentroidIndices.forEach((centroidIndex, bucketRank) => {
    clusterToLabel[centroidIndex] = bucketLabels[bucketRank] || `Cluster ${bucketRank + 1}`;
  });

  const bucketMap = {};
  validScores.forEach((item, idx) => {
    const bucket = clusterToLabel[clusters[idx]];
    if (!bucketMap[bucket]) bucketMap[bucket] = [];
    bucketMap[bucket].push({ ...item, bucket, ...bucketStyleMap[bucket] });
  });

  let result = [];
  Object.values(bucketMap).forEach(items => {
    result = result.concat(assignGrades(items));
  });

  return result.map(({ country, bucket, grade, score, classes, key, label, donutLabel, ...rest }) => ({
    country,
    bucket,
    grade,
    score,
    classes,
    key,
    label,
    donutLabel,
    ...rest
  }));
}