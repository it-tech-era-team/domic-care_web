'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCareConnect, Role } from '@/context/useCareConnect';
import { Home, Stethoscope, ArrowRight, CheckCircle2, Zap, Clock, MapPin, PhoneCall, ShieldCheck, UserCheck } from 'lucide-react';

export default function GetStarted() {
  const router = useRouter();
  const { signupUser } = useCareConnect();
  
  const [selectedRole, setSelectedRole] = useState<Role>('user');
  const [step, setStep] = useState<1 | 2>(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !password) return;

    const success = await signupUser(fullName, email, phone, password, selectedRole);

    if (success) {
      if (selectedRole === 'user') {
        router.push('/user/dashboard');
      } else {
        router.push('/caregiver/profile');
      }
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
              
              {step === 1 ? (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs mb-1">
                      <UserCheck className="h-6 w-6" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Join DomicCare
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Select your role to help us customize your experience.
                    </p>
                  </div>

                  {/* Role Cards */}
                  <div className="space-y-3.5">
                    <button
                      onClick={() => handleRoleSelect('user')}
                      className="flex w-full items-start gap-4 rounded-2xl border-2 border-slate-100 p-4.5 text-left hover:border-blue-500 hover:bg-blue-50/30 transition-all group cursor-pointer"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Home className="h-5.5 w-5.5" />
                      </div>
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-900 group-hover:text-blue-700 text-xs">
                          Family / User Account
                        </span>
                        <span className="block text-[11px] text-slate-500 leading-relaxed font-medium">
                          Find, coordinate, and book trusted, background-checked caregivers.
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 pt-1">
                          <span>Continue as Family</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => handleRoleSelect('caregiver')}
                      className="flex w-full items-start gap-4 rounded-2xl border-2 border-slate-100 p-4.5 text-left hover:border-blue-500 hover:bg-blue-50/30 transition-all group cursor-pointer"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Stethoscope className="h-5.5 w-5.5" />
                      </div>
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-900 group-hover:text-blue-700 text-xs">
                          Caregiver Provider
                        </span>
                        <span className="block text-[11px] text-slate-500 leading-relaxed font-medium">
                          Offer healthcare & companion services, manage appointments locally.
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 pt-1">
                          <span>Join as Caregiver</span>
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      </div>
                    </button>
                  </div>

                  <div className="text-center pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">
                      Already registered?{' '}
                      <Link href="/login" className="font-extrabold text-blue-600 hover:underline">
                        Log in here
                      </Link>
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <button
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 border-b border-dashed border-slate-300 pb-0.5 cursor-pointer"
                  >
                    ← Back to role selection
                  </button>

                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Create {selectedRole === 'user' ? 'Family' : 'Caregiver'} Account
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">
                      Provide contact details to complete your registration.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-1">
                      <label htmlFor="fullName" className="block text-xs font-bold text-slate-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ahmed Ali"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-xs font-bold text-slate-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="phone" className="block text-xs font-bold text-slate-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                      />
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="password" className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                      <input
                        type="password"
                        id="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a password"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-600/10 transition-all"
                      />
                    </div>

                    <div className="flex items-start gap-2 py-1">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-slate-500 leading-tight">
                        I agree to DomicCare Terms & Conditions and background check audits.
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all cursor-pointer hover:scale-[1.01]"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
