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

export const bucketHeaderStyles = {
  "Best Match": "bg-gradient-to-t from-emerald-500/15 to-emerald-500/10 text-emerald-800",
  "Good Match": "bg-gradient-to-t from-amber-400/15 to-amber-400/10 text-amber-800",
  "Fair Match": "bg-gradient-to-t from-slate-400/15 to-slate-400/10 text-slate-700",
  "Weak Match": "bg-gradient-to-t from-red-600/10 to-red-600/5 text-rose-800",
  "A+": "bg-gradient-to-t from-orange-700/15 to-orange-700/10 text-orange-700",
  "A": "bg-gradient-to-t from-emerald-500/15 to-emerald-500/10 text-emerald-800",
  "B": "bg-gradient-to-t from-amber-400/15 to-amber-400/10 text-amber-800",
  "C": "bg-gradient-to-t from-slate-400/15 to-slate-400/10 text-slate-700",
  "D": "bg-gradient-to-t from-red-600/10 to-red-600/5 text-rose-800",
};

function assignGrades(scoresInBucket) {
  if (!scoresInBucket || scoresInBucket.length === 0) return [];

  const scoreArr = scoresInBucket.map(item => [item.score]);
  const maxGrades = 5; // A+, A, B, C, D
  const k = Math.min(maxGrades, scoreArr.length);

  if (k === 1) {
    return scoresInBucket.map(item => ({ ...item, grade: 'A+' }));
  }

  const { clusters, centroids } = kmeans(scoreArr, k);

  if (!centroids || !clusters) {
    // Fallback: everyone gets U (unknown) if kmeans fails
    return scoresInBucket.map(item => ({ ...item, grade: 'U' }));
  }

  const sortedCentroidIndices = centroids
    .map((c, i) => ({ i, v: c }))
    .sort((a, b) => b.v - a.v)
    .map(obj => obj.i);

  const gradeLabels = ['A+', 'A', 'B', 'C', 'D'];

  const clusterToGrade = {};
  sortedCentroidIndices.forEach((centroidIndex, gradeRank) => {
    clusterToGrade[centroidIndex] = gradeLabels[gradeRank] || 'D';
  });

  return scoresInBucket.map((item, idx) => {
    const clusterIndex = clusters[idx];
    const grade = clusterToGrade[clusterIndex] ?? 'D';
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