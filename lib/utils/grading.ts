export interface GradeInfo {
  min: number;
  max: number;
  grade: string;
  description: string;
  point: number;
}

export const GRADING_SCALE: GradeInfo[] = [
  { min: 70, max: 100, grade: "A", description: "Excellent", point: 6 },
  { min: 65, max: 69, grade: "B", description: "Very Good", point: 5 },
  { min: 60, max: 64, grade: "C", description: "Good", point: 4 },
  { min: 50, max: 59, grade: "D", description: "Satisfactory", point: 3 },
  { min: 40, max: 49, grade: "E", description: "Adequate", point: 2 },
  { min: 20, max: 39, grade: "S", description: "Fair", point: 1 },
  { min: 0, max: 19, grade: "F", description: "Fail", point: 0 },
];

export function calculatePercentage(
  marksObtained: number,
  totalMarks: number
): number {
  if (totalMarks <= 0) return 0;
  return Math.round((marksObtained / totalMarks) * 100 * 100) / 100;
}

export function getGradeFromPercentage(percentage: number): GradeInfo {
  for (const grade of GRADING_SCALE) {
    if (percentage >= grade.min && percentage <= grade.max) {
      return grade;
    }
  }
  return GRADING_SCALE[GRADING_SCALE.length - 1];
}

export function calculateGrade(
  marksObtained: number,
  totalMarks: number
): {
  percentage: number;
  grade: string;
  gradePoint: number;
  description: string;
} {
  const percentage = calculatePercentage(marksObtained, totalMarks);
  const gradeInfo = getGradeFromPercentage(percentage);

  return {
    percentage,
    grade: gradeInfo.grade,
    gradePoint: gradeInfo.point,
    description: gradeInfo.description,
  };
}

export function calculateOverallGrade(grades: number[]): {
  average: number;
  grade: string;
  gradePoint: number;
  description: string;
} {
  if (grades.length === 0) {
    return { average: 0, grade: "F", gradePoint: 0, description: "Fail" };
  }

  const average =
    Math.round((grades.reduce((a, b) => a + b, 0) / grades.length) * 100) / 100;
  const gradeInfo = getGradeFromPercentage(average);

  return {
    average,
    grade: gradeInfo.grade,
    gradePoint: gradeInfo.point,
    description: gradeInfo.description,
  };
}
