"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface FilterContextType {
  academicYear: string;
  term: string;
  className: string;
  courseId: string;
  setAcademicYear: (year: string) => void;
  setTerm: (term: string) => void;
  setClassName: (cls: string) => void;
  setCourseId: (course: string) => void;
  availableClasses: string[];
  setAvailableClasses: (classes: string[]) => void;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const [academicYear, setAcademicYear] = useState<string>("2026");
  const [term, setTerm] = useState<string>("TERM 1");
  const [className, setClassName] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<string[]>(["S1", "S2", "S3", "P4", "P5", "P6"]);

  // Attempt to restore from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedYear = localStorage.getItem("te_filter_year");
      const storedTerm = localStorage.getItem("te_filter_term");
      const storedClass = localStorage.getItem("te_filter_class");
      const storedCourse = localStorage.getItem("te_filter_course");

      if (storedYear) setAcademicYear(storedYear);
      if (storedTerm) setTerm(storedTerm);
      if (storedClass) setClassName(storedClass);
      if (storedCourse) setCourseId(storedCourse);
    }
  }, []);

  const handleSetAcademicYear = (val: string) => {
    setAcademicYear(val);
    localStorage.setItem("te_filter_year", val);
  };

  const handleSetTerm = (val: string) => {
    setTerm(val);
    localStorage.setItem("te_filter_term", val);
  };

  const handleSetClassName = (val: string) => {
    setClassName(val);
    localStorage.setItem("te_filter_class", val);
  };

  const handleSetCourseId = (val: string) => {
    setCourseId(val);
    localStorage.setItem("te_filter_course", val);
  };

  return (
    <FilterContext.Provider
      value={{
        academicYear,
        term,
        className,
        courseId,
        setAcademicYear: handleSetAcademicYear,
        setTerm: handleSetTerm,
        setClassName: handleSetClassName,
        setCourseId: handleSetCourseId,
        availableClasses,
        setAvailableClasses,
      }}
    >
      {children}
    </FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (context === undefined) {
    throw new Error("useFilters must be used within a FilterProvider");
  }
  return context;
}
