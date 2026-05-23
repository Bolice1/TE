"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { api } from "@/services/api";
import { Loader2, Mail, Lock, User, School, MapPin, Phone, CheckCircle, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const { signup, isSigningUp } = useAuth(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  // Profile data
  const [name, setName] = useState("");
  const [coachingName, setCoachingName] = useState("");
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.auth.requestOtp(email);
      setSuccess("Verification OTP code sent to your email.");
      setStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to request OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.verifyOtp(email, otp);
      if (res.verified) {
        setSuccess("OTP Code verified successfully!");
        setStep(3);
      } else {
        setError("Invalid OTP code. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !coachingName || !address || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    try {
      await signup({
        name,
        email,
        coachingName,
        address,
        phoneNumber: phoneNumber || undefined,
        password,
        otp,
      });
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative premium background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="mb-6 text-center">
          <Link href="/" className="text-sm font-semibold text-primary hover:text-primary-hover">
            ← Back to TE home
          </Link>
        </div>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground font-display">
            TE<span className="text-primary font-normal"> (Teacher Emmy)</span>
          </h1>
          <p className="text-muted-text mt-2 text-sm">
            Create your teacher workspace.
          </p>
        </div>

        <div className="bg-surface border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Create Workspace</h2>
            <span className="text-xs font-semibold px-2.5 py-1 bg-background border border-border rounded-full text-muted-text">
              Step {step} of 3
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-danger/5 border border-danger/20 text-danger text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-success/5 border border-success/20 text-success text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="teacher@school.rw"
                    autoComplete="email"
                    autoFocus
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-muted-text mt-1.5">
                  A verification code will be sent to confirm your email.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="000000"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  disabled={loading}
                  className="w-full tracking-[0.5em] text-center font-mono py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-lg transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify Verification Code</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-center text-xs text-primary font-semibold hover:underline cursor-pointer"
              >
                Back to Email
              </button>
            </form>
          )}

          {/* STEP 3: DETAILS */}
          {step === 3 && (
            <form onSubmit={handleCompleteRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Mutesi Emmy"
                    autoComplete="name"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  School Name (Coaching Name)
                </label>
                <div className="relative">
                  <School className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="text"
                    value={coachingName}
                    onChange={(e) => setCoachingName(e.target.value)}
                    placeholder="Kigali Academic Academy"
                    autoComplete="organization"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  School Physical Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Gasabo, Kigali, Rwanda"
                    autoComplete="street-address"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+250788000000"
                    autoComplete="tel"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-1">
                  Create Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                    required
                  />
                </div>
                <p className="text-xs text-muted-text mt-1">
                  Must be at least 8 characters.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Workspace...</span>
                  </>
                ) : (
                  <span>Register & Open Workspace</span>
                )}
              </button>
            </form>
          )}

          <div className="mt-6 text-center border-t border-border pt-6 text-xs text-muted-text">
            Already have an active teacher workspace?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:underline font-semibold"
            >
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
