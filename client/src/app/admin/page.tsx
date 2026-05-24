"use client";

import React, { useEffect, useState } from 'react';
import { fetchAuthenticated } from '@/services/api';

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchAuthenticated('/api/admin/dashboard');
        if (!res.ok) throw new Error('Failed');
        const json = await res.json();
        if (mounted) setStats(json);
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Platform Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border rounded">Total Coaches: <strong>{stats?.totalCoaches ?? 0}</strong></div>
        <div className="p-4 bg-white border rounded">Active Coaches: <strong>{stats?.activeCoaches ?? '-'}</strong></div>
        <div className="p-4 bg-white border rounded">Total Students: <strong>{stats?.totalStudents ?? 0}</strong></div>
      </div>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Recent activity</h2>
        <div className="mt-2 text-sm text-muted-text">Activity feed coming soon.</div>
      </section>
    </div>
  );
}
