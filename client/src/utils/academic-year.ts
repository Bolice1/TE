export const getCurrentAcademicYear = () => new Date().getFullYear().toString();

export const getAcademicYearOptions = (pastYears = 4, futureYears = 0) => {
  const currentYear = new Date().getFullYear();
  const years: string[] = [];

  for (let year = currentYear + futureYears; year >= currentYear - pastYears; year -= 1) {
    years.push(String(year));
  }

  return years;
};
