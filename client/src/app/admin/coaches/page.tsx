"use client";

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', coachingName: '', address: '', phoneNumber: '' });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.admin.listCoaches();
      const data = res.data ?? res;
      setCoaches(Array.isArray(data) ? data : data.data ?? data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setMessage(null);
    try {
      const res = await api.admin.createCoach(form);
      setMessage('Coach created. Onboarding email sent.');
      setShowCreate(false);
      setForm({ name: '', email: '', coachingName: '', address: '', phoneNumber: '' });
      await load();
    } catch (err: any) {
      setMessage(err?.message || 'Failed to create coach');
    } finally { setSubmitting(false); }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    const ok = window.confirm(`Are you sure you want to ${currentlyActive ? 'deactivate' : 'reactivate'} this coach?`);
    if (!ok) return;
    try {
      if (currentlyActive) await api.admin.deactivateCoach(id);
      else await api.admin.reactivateCoach(id);
      await load();
    } catch (err) {
      alert('Action failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Coaches</h1>
        <button onClick={()=>setShowCreate(true)} className="px-3 py-2 bg-primary text-white rounded">Create Coach</button>
      </div>

      {message && <div className="mb-3 text-sm">{message}</div>}

      {showCreate && (
        <div className="mb-4 bg-white border p-4 rounded max-w-xl">
          <h3 className="font-semibold mb-2">Create Coach</h3>
          <form onSubmit={handleCreate} className="space-y-2">
            <input required placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="w-full p-2 border rounded" />
            <input required placeholder="Email" type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="w-full p-2 border rounded" />
            <input required placeholder="School Name" value={form.coachingName} onChange={e=>setForm({...form,coachingName:e.target.value})} className="w-full p-2 border rounded" />
            <input required placeholder="Address" value={form.address} onChange={e=>setForm({...form,address:e.target.value})} className="w-full p-2 border rounded" />
            <input placeholder="Phone" value={form.phoneNumber} onChange={e=>setForm({...form,phoneNumber:e.target.value})} className="w-full p-2 border rounded" />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="px-3 py-2 bg-primary text-white rounded">{submitting ? 'Creating...' : 'Create'}</button>
              <button type="button" onClick={()=>setShowCreate(false)} className="px-3 py-2 border rounded">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div>Loading coaches…</div> : (
        <div className="bg-white border rounded">
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">School</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {coaches.map((c: any) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.email}</td>
                  <td className="p-3">{c.coachingName}</td>
                  <td className="p-3">{c.isActive ? 'Active' : 'Inactive'}</td>
                  <td className="p-3">
                    <button onClick={()=>handleToggleActive(c.id, c.isActive)} className="px-2 py-1 border rounded text-sm">{c.isActive ? 'Deactivate' : 'Reactivate'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
