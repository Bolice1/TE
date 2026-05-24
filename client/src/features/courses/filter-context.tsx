"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentAcademicYear } from "@/utils/academic-year";
import { api } from "@/services/api";

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
  isLoadingClasses: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const currentAcademicYear = getCurrentAcademicYear();
  const [academicYear, setAcademicYear] = useState<string>(currentAcademicYear);
  const [term, setTerm] = useState<string>("TERM 1");
  const [className, setClassName] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  // Fetch teacher's classes on mount
  useEffect(() => {
    const loadClasses = async () => {
      try {
        setIsLoadingClasses(true);
        const classes = await api.teacher.getClasses();
        setAvailableClasses(classes || []);
      } catch (error) {
        console.error("Error loading teacher classes:", error);
        setAvailableClasses([]);
      } finally {
        setIsLoadingClasses(false);
      }
    };

    loadClasses();
  }, []);

  // Attempt to restore from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedYear = localStorage.getItem("te_filter_year");
      const storedTerm = localStorage.getItem("te_filter_term");
      const storedClass = localStorage.getItem("te_filter_class");
      const storedCourse = localStorage.getItem("te_filter_course");

      if (storedYear && storedYear >= currentAcademicYear) {
        setAcademicYear(storedYear);
      } else {
        localStorage.setItem("te_filter_year", currentAcademicYear);
      }
      if (storedTerm) setTerm(storedTerm);
      if (storedClass) setClassName(storedClass);
      if (storedCourse) setCourseId(storedCourse);
    }
  }, [currentAcademicYear]);

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
        isLoadingClasses,
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
