"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/cn";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#analytics", label: "Analytics" },
  { href: "#quote", label: "Vision" },
];

export function LandingNavbar() {
  const [open, setOpen] = useState(false);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    setHasSession(Boolean(localStorage.getItem("te_token")));
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border/80 bg-surface/85 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-white shadow-md shadow-primary/20">
            {brand.name}
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-extrabold text-foreground">{brand.name}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
              {brand.fullName}
            </div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-muted-text hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {hasSession ? (
            <ButtonLink href="/dashboard" size="md">
              Open Dashboard
            </ButtonLink>
          ) : (
            <>
              <ButtonLink href="/auth/login" variant="ghost" size="md">
                Sign In
              </ButtonLink>
              <ButtonLink href="/auth/signup" size="md">
                Get Started
              </ButtonLink>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div
        className={cn(
          "border-t border-border bg-surface md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            {hasSession ? (
              <ButtonLink href="/dashboard" className="w-full">
                Open Dashboard
              </ButtonLink>
            ) : (
              <>
                <ButtonLink href="/auth/login" variant="secondary" className="w-full">
                  Sign In
                </ButtonLink>
                <ButtonLink href="/auth/signup" className="w-full">
                  Get Started
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
