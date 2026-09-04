'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useCareConnect } from '@/context/useCareConnect';
import { ShieldAlert } from 'lucide-react';

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, authLoading } = useCareConnect();

  useEffect(() => {
    if (!authLoading && currentUser === null) {
      router.push('/login');
    }
  }, [authLoading, currentUser, router]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070814]">
        <div className="text-center space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-400">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  if (currentUser.role !== 'caregiver') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#070814] p-4">
        <div className="max-w-md glass-panel border border-red-500/20 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-extrabold text-white">Access Denied</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            This account is registered as a <span className="font-bold capitalize text-white">{currentUser.role}</span>. You do not have permissions to access the Caregiver Portal.
          </p>
          <button
            onClick={() => router.push(currentUser.role === 'user' ? '/user/dashboard' : '/admin/dashboard')}
            className="w-full rounded-xl nav-pill-active py-2.5 text-xs font-bold text-white cursor-pointer"
          >
            Go to My Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#08091a] text-white">
      {/* Sidebar Navigation */}
      <Sidebar role="caregiver" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto px-4 py-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
