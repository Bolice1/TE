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

const leaderboard = [
  { rank: 1, name: "Ineza M.", score: 92 },
  { rank: 2, name: "Kevin N.", score: 89 },
  { rank: 3, name: "Aline U.", score: 87 },
  { rank: 4, name: "Eric H.", score: 85 },
];

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, delay: 0.15 }}
      className="relative mx-auto w-full max-w-5xl"
    >
      <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-primary/20 via-transparent to-primary/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-[24px] border border-border bg-surface shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-2 border-b border-border bg-background/80 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          <span className="ml-2 text-xs font-semibold text-muted-text">TE Analytics Workspace</span>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Class Performance Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-44 pt-0">
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
                  <XAxis dataKey="term" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="average" stroke="#2563EB" strokeWidth={2.5} fill="url(#teTrend)" />
                </AreaChart>
              </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Performers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {leaderboard.map((student) => (
                <div
                  key={student.rank}
                  className="flex items-center justify-between rounded-xl border border-border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {student.rank}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{student.name}</span>
                  </div>
                  <span className="text-sm font-bold text-success">{student.score}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Grade Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-40 pt-0">
              <ChartContainer className="h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gradeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <XAxis dataKey="grade" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
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
