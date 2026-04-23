import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[var(--deep-space-blue)] via-[var(--baltic-blue)] to-[var(--cerulean)] p-4">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
