"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45 }}
      className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "text-left")}
    >
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary mb-3">{eyebrow}</p>
      <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 text-muted-text text-base sm:text-lg leading-relaxed">{description}</p>
      ) : null}
    </motion.div>
  );
}
