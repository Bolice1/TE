"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Loader2, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const { login, isLoggingIn } = useAuth(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await login({ email, password });
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold">Teacher Emmy (TE)</h1>
          <p className="text-sm text-muted-text mt-1">Sign in to your workspace</p>
        </div>

        <div className="bg-white border border-border rounded-lg p-6 shadow-sm">
          {error && (
            <div className="mb-4 p-3 rounded text-sm bg-danger/5 border border-danger/20 text-danger">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full p-2 border rounded" placeholder="you@school.edu" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full p-2 border rounded" placeholder="Password" required />
            </div>
            <button type="submit" disabled={isLoggingIn} className="w-full py-2 bg-primary text-white rounded">
              {isLoggingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-muted-text">Contact your Super Admin to create accounts.</div>
        </div>
      </div>
    </div>
  );
}
