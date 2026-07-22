'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCareConnect } from '@/context/useCareConnect';
import { Key, Mail, ShieldAlert, ArrowRight } from 'lucide-react';

export default function Login() {
  const router = useRouter();
  const { login } = useCareConnect();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const userProfile = await login(email, password);
    if (userProfile) {
      if (userProfile.role === 'user') router.push('/user/dashboard');
      else if (userProfile.role === 'caregiver') router.push('/caregiver/dashboard');
      else if (userProfile.role === 'admin') router.push('/admin/dashboard');
    } else {
      setError('Invalid login details.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        
        {/* Left Card: Form */}
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 p-8 shadow-xl animate-fade-in">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-slate-500">
                Log in to manage your bookings and messages.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
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
                  <Mail className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label htmlFor="pass" className="block text-xs font-bold text-slate-700">
                    Password
                  </label>
                  <a href="#" className="text-[11px] font-bold text-blue-600 hover:underline">
                    Forgot?
                  </a>
                </div>
                <div className="relative">
                  <Key className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="password"
                    id="pass"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer"
              >
                <span>Login</span>
                <ArrowRight className="h-4.5 w-4.5" />
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-500">
                New to Domic Care?{' '}
                <Link href="/get-started" className="font-bold text-blue-600 hover:underline">
                  Get started here
                </Link>
              </span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
