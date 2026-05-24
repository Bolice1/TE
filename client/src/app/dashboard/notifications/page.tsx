"use client";
import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function DashboardNotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.notifications.list();
      const data = res.data ?? res;
      setNotifications(Array.isArray(data) ? data : data.data ?? data);
    } catch (err) {
      // ignore
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setNotifications((s) => s.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) { /* ignore */ }
  };

  const markAll = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications((s) => s.map(n => ({ ...n, isRead: true })));
    } catch (err) { /* ignore */ }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div>
          <button onClick={markAll} className="px-3 py-2 border rounded">Mark all read</button>
        </div>
      </div>

      {loading ? <div>Loading…</div> : (
        <div className="space-y-2">
          {notifications.length === 0 && <div className="text-sm text-muted">No notifications</div>}
          {notifications.map((n: any) => (
            <div key={n.id} className={`p-3 border rounded bg-white ${n.isRead ? 'opacity-60' : ''}`}>
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-gray-600">{n.message}</div>
                </div>
                <div>
                  {!n.isRead && <button onClick={()=>markRead(n.id)} className="px-2 py-1 border rounded text-sm">Mark read</button>}
                </div>
              </div>
              <div className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
