"use client";

import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpen, FileText, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "./chart-container";

const trendData = [
  { term: "T1", average: 68 },
  { term: "T2", average: 74 },
  { term: "T3", average: 81 },
];

const gradeData = [
  { grade: "A", count: 18 },
  { grade: "B", count: 24 },
  { grade: "C", count: 12 },
  { grade: "D", count: 6 },
];

const summaryStats = [
  { label: "Students", value: "128", icon: Users },
  { label: "Courses", value: "12", icon: BookOpen },
  { label: "Reports", value: "96", icon: FileText },
];

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.15 }}
      className="relative w-full"
    >
      <div className="absolute -inset-3 rounded-[28px] bg-gradient-to-br from-primary/15 via-transparent to-primary/5 blur-2xl sm:-inset-4" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-primary/10 sm:rounded-[24px]">
        <div className="flex items-center gap-2 border-b border-border bg-background/90 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          <span className="ml-2 truncate text-xs font-semibold text-muted-text">
            TE Teacher Workspace
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 border-b border-border bg-background/50 p-4 sm:gap-4">
          {summaryStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-border bg-surface px-3 py-3 text-center sm:px-4 sm:py-3.5"
              >
                <Icon className="mx-auto mb-1.5 h-4 w-4 text-primary" />
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-text sm:text-xs">
                  {stat.label}
                </p>
                <p className="mt-0.5 font-display text-lg font-extrabold text-foreground sm:text-xl">
                  {stat.value}
                </p>
              </div>
            );
          })}
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-2">
          <Card className="border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Class Performance Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-40 pt-0 sm:h-44">
              <ChartContainer className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="teTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="#2563EB" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="term"
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="average"
                      stroke="#2563EB"
                      strokeWidth={2.5}
                      fill="url(#teTrend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/80">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-40 pt-0 sm:h-44">
              <ChartContainer className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis
                      dataKey="grade"
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#64748B", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563EB" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
