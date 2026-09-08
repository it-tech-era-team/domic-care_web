'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCareConnect } from '@/context/useCareConnect';
import { Key, Mail, ShieldAlert, ArrowRight, Loader2, Zap, Clock, MapPin, PhoneCall, ShieldCheck } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login } = useCareConnect();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    try {
      const userProfile = await login(email, password);
      if (userProfile) {
        if (userProfile.role === 'user') router.push('/user/dashboard');
        else if (userProfile.role === 'caregiver') router.push('/caregiver/dashboard');
        else if (userProfile.role === 'admin') router.push('/admin/dashboard');
      } else {
        setError('Invalid login details. Please check your email and password.');
        setIsSubmitting(false);
      }
    } catch {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-slate-950 font-sans">
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
          
          {/* Left Column: Background Hero Banner Details (Matching Screenshot) */}
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
                  <span className="block text-sm font-black text-white tracking-wide">+92 300 000 0000</span>
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
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Log in to your DomicCare portal account.
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-bold text-rose-600 border border-rose-200">
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
                        disabled={isSubmitting}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label htmlFor="pass" className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <a href="#" className="text-[11px] font-bold text-blue-600 hover:underline">
                        Forgot?
                      </a>
                    </div>
                    <div className="relative">
                      <Key className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-slate-400" />
                      <input
                        type="password"
                        id="pass"
                        required
                        disabled={isSubmitting}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-11 pr-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed hover:scale-[1.01]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4.5 w-4.5 animate-spin" />
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <span>Login to Portal</span>
                        <ArrowRight className="h-4.5 w-4.5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    New to Domic Care?{' '}
                    <Link href="/get-started" className="font-extrabold text-blue-600 hover:underline">
                      Get started here
                    </Link>
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
