"use client";

import React, { useState } from 'react';
import { api } from '@/services/api';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setStatus(null);
    try {
      await api.admin.sendNotification({ title, message });
      setStatus('Notification sent (enqueued)');
      setTitle(''); setMessage('');
    } catch (err: any) {
      setStatus(err?.message || 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Send Notification</h1>
      <form onSubmit={handleSend} className="space-y-3 max-w-xl">
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Title" className="w-full p-2 border rounded" required />
        <textarea value={message} onChange={(e)=>setMessage(e.target.value)} placeholder="Message" className="w-full p-2 border rounded" rows={6} required />
        <div>
          <button type="submit" disabled={sending} className="px-4 py-2 bg-primary text-white rounded">Send</button>
        </div>
      </form>
      {status && <div className="mt-3 text-sm">{status}</div>}
    </div>
  );
}
