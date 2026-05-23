"use client";

import { BarChart3, BookOpen, FileText, Mail, Medal, School } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { FeatureCard } from "./feature-card";

const features = [
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Monitor class trends, grade distribution, and performance signals in real time.",
  },
  {
    icon: FileText,
    title: "Report Cards",
    description: "Generate official term and annual report cards with structured academic commentary.",
  },
  {
    icon: Medal,
    title: "Rankings & Intervention",
    description: "Identify top performers and students who need support with ranked insights.",
  },
  {
    icon: School,
    title: "Class Analytics",
    description: "Compare classes and courses with CBC-aligned educational intelligence.",
  },
  {
    icon: BookOpen,
    title: "Assignments & Marks",
    description: "Plan assessments, record marks, and align tasks with classroom outcomes.",
  },
  {
    icon: Mail,
    title: "Parent Delivery",
    description: "Send polished PDF report cards directly to parents with one action.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="features-heading"
          eyebrow="Platform capabilities"
          title="Everything teachers need to lead with data"
          description="From classroom analytics to parent-ready report cards, TE keeps your academic operations precise, fast, and professional."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <FeatureCard key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
