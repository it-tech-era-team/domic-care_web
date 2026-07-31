'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCareConnect } from '@/context/useCareConnect';
import { Heart, User, LogOut, Menu, X, ArrowRight } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, logout } = useCareConnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateToPortal = () => {
    if (!currentUser) return;
    if (currentUser.role === 'user') router.push('/user/dashboard');
    else if (currentUser.role === 'caregiver') router.push('/caregiver/dashboard');
    else if (currentUser.role === 'admin') router.push('/admin/dashboard');
  };

  return (
    <nav className="sticky top-3 z-50 w-full px-3 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl rounded-3xl sm:rounded-full bg-gradient-to-r from-blue-50/95 via-indigo-50/80 to-blue-50/95 backdrop-blur-xl border border-blue-100/80 px-4 py-2 sm:px-6 sm:py-2.5 shadow-lg shadow-blue-500/10 transition-all duration-300">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <img
                src="/domic_care_logo_without_text.jpeg"
                alt="Domic Care Logo"
                className="h-9 w-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
              <span className="font-heading text-xl font-bold tracking-tight text-slate-900">
                Domic<span className="text-blue-600">Care</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-sm font-semibold transition-colors relative py-1 ${
                pathname === '/'
                  ? 'text-blue-600 font-bold after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-blue-600 after:rounded-full'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/get-started"
              className={`text-sm font-semibold transition-colors relative py-1 ${
                pathname === '/get-started'
                  ? 'text-blue-600 font-bold after:absolute after:-bottom-1.5 after:left-1/2 after:-translate-x-1/2 after:w-4 after:h-0.5 after:bg-blue-600 after:rounded-full'
                  : 'text-slate-600 hover:text-blue-600'
              }`}
            >
              Find Caregivers
            </Link>
            <Link
              href="/#how-it-works"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1"
            >
              How It Works
            </Link>
            <Link
              href="/#for-caregivers"
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors py-1"
            >
              For Caregivers
            </Link>
          </div>

          {/* Action Buttons / Auth State */}
          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={navigateToPortal}
                  className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-white/60 transition-all cursor-pointer"
                >
                  <User className="h-4 w-4 text-blue-600" />
                  <span>My Portal</span>
                </button>
                <div className="h-5 w-[1px] bg-blue-200/80 mx-1" />
                <button
                  onClick={logout}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100/70 hover:bg-blue-200/80 border border-blue-200/60 text-blue-600 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-white/60 transition-all"
                >
                  Login
                </Link>
                <div className="h-5 w-[1px] bg-blue-200/80 mx-1" />
                <Link
                  href="/get-started"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all"
                  title="Get Started"
                >
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-1.5 text-slate-600 hover:bg-white/60 cursor-pointer"
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
