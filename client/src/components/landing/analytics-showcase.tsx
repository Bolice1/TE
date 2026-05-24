"use client";

import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "./chart-container";
import { SectionHeading } from "./section-heading";

// Example data for demonstration - will be replaced with actual teacher data in dashboard
const exampleClassPerformance = [
  { className: "Class A", average: 76 },
  { className: "Class B", average: 81 },
  { className: "Class C", average: 73 },
  { className: "Class D", average: 88 },
];

const exampleCompetencyTrend = [
  { week: "W1", mastery: 62 },
  { week: "W2", mastery: 68 },
  { week: "W3", mastery: 74 },
  { week: "W4", mastery: 79 },
];

const exampleClassCards = [
  { name: "Class B - Subject A", average: 84, band: "Proficient", students: 32 },
  { name: "Class D - Subject B", average: 79, band: "Developing", students: 28 },
  { name: "Class A - Subject C", average: 71, band: "Emerging", students: 30 },
];

export function AnalyticsShowcase() {
  return (
    <section id="analytics" className="py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Educational intelligence"
          title="Analytics built for classroom decisions"
          description="Preview the analytical depth teachers use daily—performance trends, class comparisons, and competency signals in one view."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="lg:col-span-2"
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Class Performance Overview</CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-0">
                <ChartContainer className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={exampleClassPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="className" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#2563EB" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
          >
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Competency Mastery Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-64 pt-0">
                <ChartContainer className="h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={exampleCompetencyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                    <XAxis dataKey="week" tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#64748B", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="mastery" stroke="#16A34A" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {exampleClassCards.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              whileHover={{ y: -3 }}
            >
              <Card className="h-full hover:border-primary/25 hover:shadow-md hover:shadow-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-text">Average</p>
                      <p className="text-3xl font-extrabold text-foreground">{item.average}%</p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                      {item.band}
                    </span>
                  </div>
                  <p className="text-sm text-muted-text">{item.students} students tracked</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
