'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCareConnect, Role } from '@/context/useCareConnect';
import { Heart, Home, Stethoscope, ArrowRight, CheckCircle2 } from 'lucide-react';

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
        router.push('/caregiver/profile'); // Caregivers go to fill profile builder
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        {/* Background visual shapes */}
        <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-teal-100/40 blur-3xl" />

        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-100 p-8 shadow-xl animate-fade-in">
          {step === 1 ? (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  How do you want to use Domic Care?
                </h1>
                <p className="text-sm text-slate-500">
                  Select your role to help us customize your experience.
                </p>
              </div>

              {/* Selection cards */}
              <div className="space-y-4">
                {/* Family Option */}
                <button
                  onClick={() => handleRoleSelect('user')}
                  className="flex w-full items-start gap-4 rounded-2xl border-2 border-slate-100 p-5 text-left hover:border-blue-500 hover:bg-blue-50/20 active:bg-blue-50/40 hover:-translate-y-0.5 transition-all group cursor-pointer"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                    <Home className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Family / User
                    </span>
                    <span className="block text-xs text-slate-500 leading-relaxed">
                      I want to find, coordinate, and book trusted, background-checked caregivers for my elderly family members.
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 pt-1">
                      <span>Continue as Family</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>

                {/* Caregiver Option */}
                <button
                  onClick={() => handleRoleSelect('caregiver')}
                  className="flex w-full items-start gap-4 rounded-2xl border-2 border-slate-100 p-5 text-left hover:border-blue-500 hover:bg-blue-50/20 active:bg-blue-50/40 hover:-translate-y-0.5 transition-all group cursor-pointer"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200">
                    <Stethoscope className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="block font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                      Caregiver
                    </span>
                    <span className="block text-xs text-slate-500 leading-relaxed">
                      I am a professional nurse or companion helper looking to offer services and schedule care bookings locally.
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 pt-1">
                      <span>Join as Caregiver</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </button>
              </div>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-500">
                  Already have an account?{' '}
                  <Link href="/login" className="font-bold text-blue-600 hover:underline">
                    Log in here
                  </Link>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back to Step 1 */}
              <button
                onClick={() => setStep(1)}
                className="text-xs font-bold text-slate-500 hover:text-slate-900 inline-flex items-center gap-1 border-b border-dashed border-slate-300 pb-0.5 cursor-pointer"
              >
                ← Back to role selection
              </button>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Create your {selectedRole === 'user' ? 'Family' : 'Caregiver'} account
                </h2>
                <p className="text-xs text-slate-500">
                  Please provide your contact details to complete registration.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
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
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10 transition-all"
                  />
                </div>

                <div className="flex items-start gap-2.5 py-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-teal-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-500 leading-normal">
                    I agree to the Domic Care Terms of Service and understand caregivers undergo strict database background checks.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer"
                >
                  <span>Create Account</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
