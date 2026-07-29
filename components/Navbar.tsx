'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCareConnect } from '@/context/useCareConnect';
import { Heart, User, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, logout } = useCareConnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateToPortal = () => {
    if (!currentUser) return;
    if (currentUser.role === 'user') router.push('/user/dashboard');
    else if (currentUser.role === 'caregiver') router.push('/caregiver/dashboard');
    else if (currentUser.role === 'admin') router.push('/admin/dashboard');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
                <Heart className="h-5.5 w-5.5 fill-white" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight text-slate-900">
                Domic<span className="text-blue-600">Care</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/get-started" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Find Caregivers
            </Link>
            <Link href="/#how-it-works" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link href="/#for-caregivers" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              For Caregivers
            </Link>
          </div>

          {/* Action Buttons / Auth State */}
          <div className="hidden md:flex items-center gap-4">


            {currentUser ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={navigateToPortal}
                  className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <User className="h-4 w-4" />
                  <span>My Portal</span>
                </button>
                <button
                  onClick={logout}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/get-started"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white py-4 px-4 space-y-3 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            href="/get-started"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Caregivers
          </Link>
          <Link
            href="/#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            How It Works
          </Link>
          <Link
            href="/#for-caregivers"
            onClick={() => setMobileMenuOpen(false)}
            className="block rounded-lg px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            For Caregivers
          </Link>
          <hr className="border-slate-100" />
          
          {currentUser ? (
            <div className="space-y-2">
              <button
                onClick={() => {
                  navigateToPortal();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg bg-blue-50 text-blue-700 px-4 py-2.5 text-sm font-semibold hover:bg-blue-100"
              >
                <User className="h-4.5 w-4.5" />
                Go to Portal ({currentUser.role})
              </button>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg border border-slate-200 text-red-600 px-4 py-2.5 text-sm font-semibold hover:bg-red-50"
              >
                <LogOut className="h-4.5 w-4.5" />
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                href="/get-started"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
      

    </nav>
  );
}
