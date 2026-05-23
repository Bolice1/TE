"use client";

import { BarChart3, BookOpen, ClipboardList, FileText, Mail, Users } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { FeatureCard } from "./feature-card";

const features = [
  {
    icon: Users,
    title: "Student Directory",
    description: "Register learners, manage class rosters, and keep parent contact details organized.",
  },
  {
    icon: BookOpen,
    title: "Assignments & Marks",
    description: "Plan assessments, record marks, and align tasks with classroom outcomes.",
  },
  {
    icon: BarChart3,
    title: "Class Insights",
    description: "View performance trends and grade distribution to guide teaching decisions.",
  },
  {
    icon: FileText,
    title: "Report Cards",
    description: "Generate official term and annual report cards with structured commentary.",
  },
  {
    icon: ClipboardList,
    title: "Competency Reporting",
    description: "Document strengths, focus areas, and CBC-aligned learner progress.",
  },
  {
    icon: Mail,
    title: "Parent Delivery",
    description: "Send polished PDF report cards directly to parents with one action.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 border-t border-border bg-background py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Platform capabilities"
          title="Built for everyday classroom leadership"
          description="Every tool in TE supports a clear teacher workflow — from student records to parent-ready reports."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
