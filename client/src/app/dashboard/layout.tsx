"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useFilters } from "@/features/courses/filter-context";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  BookOpen,
  Edit3,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  Sparkles,
  School,
  Calendar,
  Layers,
  ChevronDown,
} from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { teacher, isLoading: isAuthLoading, logout } = useAuth(true);
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    academicYear,
    term,
    className,
    courseId,
    setAcademicYear,
    setTerm,
    setClassName,
    setCourseId,
    availableClasses,
  } = useFilters();

  // Load courses dynamically based on className and academicYear
  const { data: coursesData } = useQuery({
    queryKey: ["courses-list", className, academicYear],
    queryFn: () => api.courses.list({ className: className || undefined, year: academicYear }),
    enabled: !!teacher,
  });

  const courses = coursesData?.courses || [];

  // Reset courseId if selected course is no longer in the loaded courses list
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const exists = courses.some((c) => c._id === courseId);
      if (!exists) {
        setCourseId("");
      }
    }
  }, [courses, courseId, setCourseId]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background">
        <Sparkles className="w-10 h-10 text-primary animate-pulse mb-3" />
        <p className="text-sm text-muted-text font-medium animate-pulse">
          Retrieving academic session...
        </p>
      </div>
    );
  }

  const menuItems = [
    { name: "Overview Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "CBC Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Student Directory", href: "/dashboard/students", icon: Users },
    { name: "Assignments Planner", href: "/dashboard/assignments", icon: BookOpen },
    { name: "Marks Spreadsheet", href: "/dashboard/marks", icon: Edit3 },
    { name: "Report Cards", href: "/dashboard/reports", icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* 1. LEFT SIDEBAR - DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-surface shrink-0 z-30">
        <div className="p-6 border-b border-border flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-primary/20">
            TE
          </div>
          <div>
            <h1 className="font-extrabold text-foreground tracking-tight font-display leading-none">
              Teacher Emmy
            </h1>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider">
              Educational SaaS
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-primary text-white shadow-md shadow-primary/10"
                    : "text-muted-text hover:bg-background hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Teacher Profile Footer Card */}
        <div className="p-4 border-t border-border bg-background/50 m-4 rounded-xl border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
              {teacher?.name?.slice(0, 2).toUpperCase() || "TR"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-foreground truncate">
                {teacher?.name || "Educator"}
              </p>
              <p className="text-[10px] text-muted-text truncate flex items-center gap-1">
                <School className="w-3 h-3 shrink-0" />
                {teacher?.coachingName || "School Workspace"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-danger hover:bg-danger/5 border border-danger/10 hover:border-danger/20 rounded-lg transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Workspace</span>
          </button>
        </div>
      </aside>

      {/* MOBILE NAV OVERLAY */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="w-64 h-full bg-surface flex flex-col z-50 border-r border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white font-extrabold text-lg">
                  TE
                </div>
                <h1 className="font-extrabold text-foreground tracking-tight font-display">
                  Teacher Emmy
                </h1>
              </div>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-5 h-5 text-muted-text" />
              </button>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-1.5">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-primary text-white shadow-md shadow-primary/10"
                        : "text-muted-text hover:bg-background hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-border bg-background/50 m-4 rounded-xl border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  {teacher?.name?.slice(0, 2).toUpperCase() || "TR"}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground truncate">
                    {teacher?.name}
                  </p>
                  <p className="text-[10px] text-muted-text truncate">
                    {teacher?.coachingName || "School Workspace"}
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-danger hover:bg-danger/5 border border-danger/10 rounded-lg transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 2. MAIN WORKSPACE CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* STICKY TOP CONTEXTUAL FILTER BAR */}
        <header className="sticky top-0 z-20 bg-surface/80 backdrop-blur-md border-b border-border px-4 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-2 rounded-lg border border-border hover:bg-background cursor-pointer"
            >
              <Menu className="w-5 h-5 text-foreground" />
            </button>
            <div>
              <h2 className="text-lg font-bold text-foreground leading-tight">
                {menuItems.find((i) => pathname === i.href)?.name || "Workspace"}
              </h2>
              <p className="text-xs text-muted-text">
                Active Year: {academicYear} • Term: {term}
              </p>
            </div>
          </div>

          {/* Persistent synchronized filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Academic Year */}
            <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-text mr-1.5 shrink-0" />
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="bg-transparent border-none text-foreground font-semibold focus:outline-none pr-2 cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>
            </div>

            {/* Term */}
            <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5">
              <Layers className="w-3.5 h-3.5 text-muted-text mr-1.5 shrink-0" />
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="bg-transparent border-none text-foreground font-semibold focus:outline-none pr-2 cursor-pointer"
              >
                <option value="TERM 1">Term 1</option>
                <option value="TERM 2">Term 2</option>
                <option value="TERM 3">Term 3</option>
              </select>
            </div>

            {/* Class Name */}
            <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5">
              <Users className="w-3.5 h-3.5 text-muted-text mr-1.5 shrink-0" />
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="bg-transparent border-none text-foreground font-semibold focus:outline-none pr-2 cursor-pointer"
              >
                <option value="">All Classes</option>
                {availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    Class {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selector (Loaded Dynamically) */}
            <div className="flex items-center bg-background border border-border rounded-xl px-2.5 py-1.5">
              <BookOpen className="w-3.5 h-3.5 text-muted-text mr-1.5 shrink-0" />
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="bg-transparent border-none text-foreground font-semibold focus:outline-none pr-2 cursor-pointer max-w-[140px] truncate"
              >
                <option value="">All Courses</option>
                {courses.map((course: any) => (
                  <option key={course._id} value={course._id}>
                    {course.name} ({course.className})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* WORKSPACE SUB-PAGE BODY */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
