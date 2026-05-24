"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { teacher, isLoading: isAuthLoading, logout } = useAuth(true);
  const pathname = usePathname();

  if (isAuthLoading || !teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Opening workspace…</div>
      </div>
    );
  }

  const menu = [
    { name: "Overview", href: "/dashboard" },
    { name: "Students", href: "/dashboard/students" },
    { name: "Assignments", href: "/dashboard/assignments" },
    { name: "Marks", href: "/dashboard/marks" },
    { name: "Reports", href: "/dashboard/reports" },
    { name: "Notifications", href: "/dashboard/notifications" },
    { name: "Profile", href: "/dashboard/profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold">Teacher Emmy</div>
            <nav className="flex gap-2">
              {menu.map((m) => (
                <Link key={m.href} href={m.href} className={`text-sm px-3 py-1 rounded ${pathname === m.href ? 'bg-primary text-white' : 'text-gray-700 hover:bg-gray-100'}`}>
                  {m.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-700">{teacher.name}</div>
            <button onClick={logout} className="text-sm text-red-600">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        <div className="bg-white border rounded-lg p-6 shadow-sm">
          {children}
        </div>
      </main>
    </div>
  );
}
