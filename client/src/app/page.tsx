"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("te_token");
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/auth/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="flex flex-col items-center gap-4 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-2">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Academic Intelligence Platform</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-display">
          TE<span className="text-primary font-normal"> (Teacher Emmy)</span>
        </h1>
        <div className="flex items-center gap-2 text-muted-text mt-4 text-sm font-medium">
          <Loader2 className="w-4.5 h-4.5 animate-spin text-primary" />
          <span>Launching workspace environment...</span>
        </div>
      </div>
    </div>
  );
}
