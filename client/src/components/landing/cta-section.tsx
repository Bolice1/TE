"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/lib/brand";

export function CtaSection() {
  return (
    <section className="border-t border-border py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-hover px-6 py-12 text-center text-white sm:px-12"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            Ready to lead with {brand.name}?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base text-white/90">
            Create your teacher workspace and start transforming classroom data into meaningful outcomes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink
              href="/auth/signup"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/95"
            >
              Create Workspace
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink
              href="/auth/login"
              variant="outline"
              size="lg"
              className="w-full sm:w-auto border-white/40 text-white hover:bg-white/10 hover:border-white/60"
            >
              Sign In
            </ButtonLink>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
