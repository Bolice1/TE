"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { DashboardMockup } from "./dashboard-mockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-10 pb-16 sm:pt-14 sm:pb-20 lg:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-18%] left-[-8%] h-[420px] w-[420px] rounded-full bg-primary/10 blur-[110px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[460px] w-[460px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Rwanda CBC-aligned classroom intelligence
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            >
              Transform teaching with{" "}
              <span className="text-primary">{brand.fullName}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-muted-text sm:text-lg"
            >
              {brand.tagline}. Track performance, generate premium report cards, and deliver
              parent-ready insights from one teacher-first workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <ButtonLink href="/auth/signup" size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/auth/login" variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign In
              </ButtonLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mt-8 flex flex-wrap items-center gap-4 text-sm text-muted-text"
            >
              <span className="inline-flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                Live analytics
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Report cards & PDF delivery
              </span>
            </motion.div>

          </div>

          <DashboardMockup />
        </div>
      </div>
    </section>
  );
}
