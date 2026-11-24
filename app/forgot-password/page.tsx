'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import {
  KeyRound, Mail, ArrowRight, Loader2, Zap, Clock,
  MapPin, PhoneCall, ShieldAlert, CheckCircle2, ArrowLeft
} from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [hasSentOnce, setHasSentOnce] = useState(false);

  // 60-Second Cooldown Countdown Timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting || cooldown > 0) return;

    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || json.error || 'Failed to dispatch password reset email.');
      }

      setHasSentOnce(true);
      setSuccessMessage('Password reset link dispatched! Please check your email inbox. The link is valid for 60 seconds.');
      // Start 60-second cooldown timer
      setCooldown(60);
    } catch (err: any) {
      setError(err.message || 'Unable to process your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-950 font-sans w-full overflow-x-hidden">
      <Navbar />

      {/* Main Hero Section with Reference Image Background & White Form */}
      <main className="flex-1 relative flex items-center justify-center p-4 sm:p-6 lg:p-12">

        {/* Background Image Layer with Dark Royal Blue Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            src="/hero/admin-hero.jpg"
            alt="Care Background"
            className="w-full h-full object-cover filter brightness-[0.4]"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1600&auto=format&fit=crop&q=80';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/90 to-indigo-950/95 backdrop-blur-[2px]" />
        </div>

        {/* Content Grid */}
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10 py-6">

          {/* Left Column: Background Hero Banner Details */}
          <div className="lg:col-span-7 space-y-6 text-white text-left pr-0 lg:pr-6">

            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 border border-amber-400/40 px-4 py-1.5 text-xs font-extrabold text-amber-300 shadow-sm backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
              <span>Immediate 24/7 Response</span>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
                Need Immediate Care?
              </h1>
              <p className="text-sm sm:text-base text-blue-100/90 max-w-lg leading-relaxed font-medium">
                We're here for you. Get compassionate, certified professional care right at home, whenever you need it most.
              </p>
            </div>

            {/* 3 Glass Info Cards Matching Screenshot */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1.5 shadow-lg">
                <div className="h-9 w-9 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">Caregiver Availability</span>
                  <span className="block text-xs font-black text-white">24/7 Immediate Dispatch</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1.5 shadow-lg">
                <div className="h-9 w-9 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">Average Response Time</span>
                  <span className="block text-xs font-black text-white">Within 30 Minutes</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md space-y-1.5 shadow-lg">
                <div className="h-9 w-9 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-blue-200 uppercase tracking-wider">Nearby Caregivers</span>
                  <span className="block text-xs font-black text-white">Verified & Local To You</span>
                </div>
              </div>

            </div>

            {/* Bottom Hotline Bar & Concentric Radar Badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/15">
              <div className="inline-flex items-center gap-3.5 bg-blue-600/50 border border-blue-400/30 rounded-2xl px-5 py-3 backdrop-blur-md text-white shadow-xl">
                <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-md shrink-0">
                  <PhoneCall className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="block text-sm font-black text-white tracking-wide">089 276 0944</span>
                  <span className="block text-[10px] text-blue-200 font-semibold">Call Now for Immediate Assistance</span>
                </div>
              </div>

              {/* 30 Min Arrival Radar Circle */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="relative h-20 w-20 rounded-full bg-gradient-to-tr from-blue-600 to-sky-400 border-2 border-white/40 flex flex-col items-center justify-center text-center shadow-2xl animate-pulse">
                  <span className="text-xl font-black text-white leading-none">30</span>
                  <span className="text-[8px] font-black uppercase text-blue-100 tracking-wider">Min Arrival</span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Crisp White Form Card */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-100 animate-fade-in text-slate-900">
              <div className="space-y-6">

                <div className="text-center space-y-2">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs mb-1">
                    <KeyRound className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Reset Password
                  </h2>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Enter your account email to receive a secure recovery link. The link is active for 60 seconds.
                  </p>
                </div>

                {successMessage && (
                  <div className="flex items-start gap-2.5 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 animate-fade-in">
                    <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p>{successMessage}</p>
                      {cooldown > 0 && (
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Link expires in: <span className="font-extrabold underline">{cooldown}s</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-bold text-rose-600 border border-rose-200 animate-fade-in">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="email"
                        id="email"
                        required
                        disabled={isSubmitting || cooldown > 0}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Submit / Countdown Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || cooldown > 0}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : cooldown > 0 ? (
                      <>
                        <Clock className="h-4.5 w-4.5 animate-pulse" />
                        <span>Resend Link ({cooldown}s)</span>
                      </>
                    ) : hasSentOnce ? (
                      <>
                        <span>Resend Reset Link</span>
                        <ArrowRight className="h-4.5 w-4.5" />
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                        <ArrowRight className="h-4.5 w-4.5" />
                      </>
                    )}
                  </button>
                </form>

                {/* Back to Login link */}
                <div className="text-center pt-2 border-t border-slate-100">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Back to Sign In</span>
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
