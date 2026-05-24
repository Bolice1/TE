"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role, isLoading, user } = useAuth(true);
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (role !== 'SUPER_ADMIN') {
      router.replace('/dashboard');
    }
  }, [role, isLoading, router]);

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r hidden md:block">
        <div className="px-6 py-8">
          <h3 className="text-xl font-bold">Admin</h3>
          <p className="text-sm text-muted-text">{user?.name || 'Super Admin'}</p>
        </div>
        <nav className="px-4">
          <ul className="space-y-1">
            <li>
              <Link href="/admin" className="block px-4 py-2 rounded hover:bg-gray-100">Dashboard</Link>
            </li>
            <li>
              <Link href="/admin/coaches" className="block px-4 py-2 rounded hover:bg-gray-100">Coaches</Link>
            </li>
            <li>
              <Link href="/admin/notifications" className="block px-4 py-2 rounded hover:bg-gray-100">Notifications</Link>
            </li>
            <li>
              <Link href="/admin/settings" className="block px-4 py-2 rounded hover:bg-gray-100">Settings</Link>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
