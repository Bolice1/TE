"use client";

import { motion } from "framer-motion";

export function QuoteSection() {
  return (
    <section id="quote" className="scroll-mt-20 py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.blockquote
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl border border-border bg-surface px-6 py-10 text-center shadow-lg shadow-primary/5 sm:px-12 sm:py-14"
        >
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          <p className="font-display text-xl font-semibold leading-snug text-foreground sm:text-2xl lg:text-3xl">
            &ldquo;An education that does not transform your life or the life of others is a waste.&rdquo;
          </p>
          <footer className="mt-6 text-sm font-semibold tracking-wide text-muted-text">
            — Paul Kagame
          </footer>
        </motion.blockquote>
      </div>
    </section>
  );
}
