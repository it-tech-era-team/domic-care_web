'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useCareConnect } from '@/context/useCareConnect';
import { Heart, User, LogOut, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'Caregivers', href: '/get-started' },
  { label: 'Pricing', href: '#' },
  { label: 'About Us', href: '#' },
];

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
    <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-100 shadow-sm">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative">
              <img
                src="/domic_care_logo_without_text.jpeg"
                alt="DomicCare Logo"
                className="h-9 w-9 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            <span className="font-heading text-xl font-bold tracking-tight text-slate-900">
              Domic<span className="text-blue-600">Care</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href) && link.href !== '#';
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-4 bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
            {/* Resources dropdown stub */}
            <button className="flex items-center gap-1 px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-all duration-200">
              Resources <ChevronDown className="h-3.5 w-3.5 opacity-60" />
            </button>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={navigateToPortal}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all cursor-pointer"
                >
                  <User className="h-4 w-4 text-blue-600" />
                  <span>My Portal</span>
                </button>
                <div className="h-5 w-px bg-slate-200 mx-1" />
                <button
                  onClick={logout}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-500 border border-slate-200 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-50 border border-slate-200 transition-all"
                >
                  Log In
                </Link>
                <Link
                  href="/get-started"
                  className="flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 px-5 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.03] transition-all"
                >
                  Book Care
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            {!currentUser && (
              <Link
                href="/get-started"
                className="rounded-full bg-blue-600 px-4 py-1.5 text-xs font-bold text-white"
              >
                Book Care
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-lg animate-fade-in">
          <div className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="#"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              Resources <ChevronDown className="h-4 w-4 opacity-60" />
            </Link>

            <div className="pt-2 border-t border-slate-100 mt-2">
              {currentUser ? (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => { navigateToPortal(); setMobileMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-xl bg-blue-50 text-blue-700 px-4 py-3 text-sm font-semibold hover:bg-blue-100 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Go to Portal ({currentUser.role})
                  </button>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="flex w-full items-center gap-2 rounded-xl border border-slate-200 text-red-600 px-4 py-3 text-sm font-semibold hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/get-started"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10"
                  >
                    Book Care <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
