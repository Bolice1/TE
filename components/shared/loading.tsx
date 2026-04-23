"use client";

import { Spinner } from "@/components/ui/spinner";

interface LoadingProps {
  text?: string;
}

export function Loading({ text = "Loading..." }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <Spinner className="h-8 w-8" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}
