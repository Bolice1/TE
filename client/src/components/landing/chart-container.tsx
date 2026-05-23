"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

export function ChartContainer({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn("min-h-[160px] min-w-0 w-full", className)}>
      {mounted ? children : <div className="h-full w-full rounded-xl bg-background animate-pulse" />}
    </div>
  );
}
