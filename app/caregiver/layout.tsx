'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useCareConnect } from '@/context/useCareConnect';
import { ShieldAlert } from 'lucide-react';

export default function CaregiverLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser } = useCareConnect();

  useEffect(() => {
    if (currentUser === null) {
      const timer = setTimeout(() => {
        if (currentUser === null) {
          router.push('/login');
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm font-semibold text-slate-500">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (currentUser.role !== 'caregiver') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md bg-white border border-red-100 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Access Denied</h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            This account is registered as a <span className="font-bold capitalize">{currentUser.role}</span>. You do not have permissions to access the Caregiver Portal.
          </p>
          <button
            onClick={() => router.push(currentUser.role === 'user' ? '/user/dashboard' : '/admin/dashboard')}
            className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
          >
            Go to My Portal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50">
      {/* Sidebar Navigation */}
      <Sidebar role="caregiver" />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto px-4 py-6 md:p-8">
        {children}
      </main>
    </div>
  );
}
