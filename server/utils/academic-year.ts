export const getCurrentAcademicYear = () => new Date().getFullYear();

export const isHistoricalAcademicYear = (year: string) => {
  const parsed = Number(year);
  if (!Number.isInteger(parsed)) {
    return false;
  }

  return parsed < getCurrentAcademicYear();
};
