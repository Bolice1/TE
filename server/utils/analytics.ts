export type PerformanceBand =
  | 'Exceptional'
  | 'Proficient'
  | 'Developing'
  | 'Emerging'
  | 'Needs Support';

export const gradeFromPercentage = (percentage: number) => {
  if (percentage >= 85) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 55) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};

export const performanceBandFromPercentage = (percentage: number): PerformanceBand => {
  if (percentage >= 85) return 'Exceptional';
  if (percentage >= 70) return 'Proficient';
  if (percentage >= 55) return 'Developing';
  if (percentage >= 40) return 'Emerging';
  return 'Needs Support';
};

export const computePercentage = (score: number, maxScore: number) =>
  maxScore > 0 ? (score / maxScore) * 100 : 0;

export const computeGpaLikeScore = (percentage: number) => {
  if (percentage >= 85) return 5;
  if (percentage >= 70) return 4;
  if (percentage >= 55) return 3;
  if (percentage >= 40) return 2;
  return 1;
};

export const buildGradeDistribution = (values: number[]) => {
  const distribution = [
    { grade: 'A', count: 0 },
    { grade: 'B', count: 0 },
    { grade: 'C', count: 0 },
    { grade: 'D', count: 0 },
    { grade: 'F', count: 0 },
  ];

  for (const value of values) {
    const grade = gradeFromPercentage(value);
    const entry = distribution.find((item) => item.grade === grade);
    if (entry) {
      entry.count += 1;
    }
  }

  return distribution;
};

export const rankDeterministically = <
  T extends {
    averagePercentage: number;
    totalScore: number;
    label: string;
    stableId: string;
  },
>(
  items: T[],
) => {
  const sorted = [...items].sort((a, b) => {
    if (b.averagePercentage !== a.averagePercentage) return b.averagePercentage - a.averagePercentage;
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    if (a.label !== b.label) return a.label.localeCompare(b.label);
    return a.stableId.localeCompare(b.stableId);
  });

  let previousKey = '';
  let currentRank = 0;

  return sorted.map((item, index) => {
    const rankKey = `${item.averagePercentage}|${item.totalScore}|${item.label}|${item.stableId}`;
    if (rankKey !== previousKey) {
      currentRank = index + 1;
      previousKey = rankKey;
    }

    const percentile =
      sorted.length <= 1 ? 100 : Number((((sorted.length - currentRank) / (sorted.length - 1)) * 100).toFixed(2));

    return {
      ...item,
      rank: currentRank,
      percentile,
    };
  });
};
