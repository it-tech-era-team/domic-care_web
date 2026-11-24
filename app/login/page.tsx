'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCareConnect } from '@/context/useCareConnect';
import { Key, Mail, ShieldAlert, ArrowRight, Loader2, Zap, Clock, MapPin, PhoneCall, ShieldCheck, CheckCircle2, X } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useCareConnect();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [bannerNotice, setBannerNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password & resend state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  const [resendStatus, setResendStatus] = useState<{ message: string; isError: boolean } | null>(null);
  const [isResendLoading, setIsResendLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('confirmed') === 'true') {
      setBannerNotice('Your email has been successfully confirmed! You can now log in.');
    } else if (searchParams.get('reset') === 'success') {
      setBannerNotice('Password reset successful. Please log in with your new password.');
    }
  }, [searchParams]);

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

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || isForgotLoading) return;

    setIsForgotLoading(true);
    setForgotStatus(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setForgotStatus({
          message: data.data?.message || 'Password reset link sent to your email.',
          isError: false,
        });
      } else {
        setForgotStatus({
          message: data.error?.message || 'Failed to send reset email.',
          isError: true,
        });
      }
    } catch {
      setForgotStatus({ message: 'Network error. Please try again.', isError: true });
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError('Please enter your email address above first to resend confirmation.');
      return;
    }
    setIsResendLoading(true);
    setResendStatus(null);
    try {
      const res = await fetch('/api/auth/resend-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setResendStatus({
          message: data.data?.message || 'Confirmation email resent! Please check your inbox.',
          isError: false,
        });
      } else {
        setResendStatus({
          message: data.error?.message || 'Unable to resend confirmation email.',
          isError: true,
        });
      }
    } catch {
      setResendStatus({ message: 'Network error. Please try again.', isError: true });
    } finally {
      setIsResendLoading(false);
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
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Welcome Back
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Log in to your DomicCare portal account.
                  </p>
                </div>

                {bannerNotice && (
                  <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
                    <span>{bannerNotice}</span>
                  </div>
                )}

                {error && (
                  <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-3.5 text-xs font-bold text-rose-600 border border-rose-200">
                    <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {resendStatus && (
                  <div className={`flex items-center gap-2 rounded-2xl p-3.5 text-xs font-bold border ${resendStatus.isError ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                    <span>{resendStatus.message}</span>
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
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setForgotStatus(null);
                          setShowForgotModal(true);
                        }}
                        className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot Password?
                      </button>
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

                {/* Google Sign-in */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-3 text-slate-400 font-semibold uppercase">Or continue with</span>
                  </div>
                </div>

                <a
                  href="/api/auth/google"
                  className="w-full flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
                >
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </a>

                {/* Resend confirmation email helper */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={isResendLoading}
                    className="text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    {isResendLoading ? 'Resending...' : "Didn't receive confirmation email? Resend"}
                  </button>
                </div>

                <div className="text-center pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    New to Domic Care?{' '}
                    <Link href="/get-started" className="font-extrabold text-blue-600 hover:underline">
                      Get started here
                    </Link>
                  </span>
                </div>

                {/* Forgot Password Modal */}
                {showForgotModal && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
                    <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 relative space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-black text-slate-900">Reset Password</h3>
                        <button
                          type="button"
                          onClick={() => setShowForgotModal(false)}
                          className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700"
                        >
                          <X className="h-4.5 w-4.5" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-500 leading-relaxed font-medium">
                        Enter your registered email address to receive password reset instructions.
                      </p>

                      {forgotStatus && (
                        <div className={`p-3 rounded-2xl text-xs font-bold border ${forgotStatus.isError ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                          {forgotStatus.message}
                        </div>
                      )}

                      <form onSubmit={handleForgotPassword} className="space-y-3">
                        <input
                          type="email"
                          required
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-blue-600 focus:bg-white focus:outline-none"
                        />
                        <button
                          type="submit"
                          disabled={isForgotLoading}
                          className="w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-70 cursor-pointer"
                        >
                          {isForgotLoading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                      </form>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
