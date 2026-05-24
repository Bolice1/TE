"use client";

import { motion } from "framer-motion";
import { ArrowRight, FileText, Sparkles, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { DashboardMockup } from "./dashboard-mockup";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pt-16 lg:pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-[-18%] left-[-8%] h-[380px] w-[380px] rounded-full bg-primary/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[400px] w-[400px] rounded-full bg-primary/5 blur-[110px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary"
            >
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              Rwanda CBC-aligned classroom platform
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="mt-6 font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]"
            >
              Teach with clarity using{" "}
              <span className="text-primary">{brand.fullName}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-5 text-base leading-relaxed text-muted-text sm:text-lg"
            >
              {brand.tagline}. Manage students, record marks, and deliver professional report cards
              from one focused teacher workspace.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
            >
              <ButtonLink href="/auth/signup" size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/auth/login" variant="secondary" size="lg" className="w-full sm:w-auto">
                Sign In
              </ButtonLink>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.22 }}
              className="mt-8 flex flex-col gap-3 text-sm text-muted-text sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start"
            >
              <li className="inline-flex items-center justify-center gap-2 lg:justify-start">
                <Users className="h-4 w-4 shrink-0 text-primary" />
                Student & class management
              </li>
              <li className="inline-flex items-center justify-center gap-2 lg:justify-start">
                <FileText className="h-4 w-4 shrink-0 text-primary" />
                Report cards & parent delivery
              </li>
            </motion.ul>
          </div>

          <div className="w-full lg:pt-2">
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
