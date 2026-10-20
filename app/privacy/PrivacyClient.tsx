'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  Lock,
  Database,
  Server,
  UserCheck,
  Eye,
  Mail,
  Printer,
  Share2,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Check,
  HelpCircle,
  FileText,
  ChevronRight,
  AlertCircle,
  Cpu,
  Scale,
  Building2,
  User,
  HeartPulse,
  BadgeCheck,
  PhoneCall
} from 'lucide-react';

interface SectionNav {
  id: string;
  title: string;
  badge?: string;
  isNewOrUpdated?: boolean;
}

const SECTIONS: SectionNav[] = [
  { id: 'section-1', title: '1. Introduction' },
  { id: 'section-2', title: '2. Information We Collect' },
  { id: 'section-3', title: '3. Data Responsibilities & Technical Providers', badge: 'Updated 3.1–3.5', isNewOrUpdated: true },
  { id: 'section-4', title: '4. How We Use Your Information' },
  { id: 'section-5', title: '5. Disclosure of Information' },
  { id: 'section-6', title: '6. Data Security Measures' },
  { id: 'section-7', title: '7. User Data Rights' },
  { id: 'section-8', title: '8. Contact Information' },
];

export default function PrivacyClient() {
  const [activeSection, setActiveSection] = useState<string>('section-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showPlainSummary, setShowPlainSummary] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Track scroll progress and active section
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setScrollProgress(Math.min(100, Math.max(0, progress)));

      // Detect active section
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 180) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const matchesSearch = (text: string) => {
    if (!searchQuery.trim()) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Scroll Progress Bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-400 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-blue-950 to-blue-900 text-white border-b border-blue-900/40">
          {/* Subtle Grid and Glow Background */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage: 'radial-gradient(rgba(191,219,254,0.9) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              maskImage: 'radial-gradient(ellipse 70% 80% at 50% 0%, black 30%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 80% at 50% 0%, black 30%, transparent 75%)',
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-36 left-1/2 h-72 w-[65%] -translate-x-1/2 rounded-full bg-blue-500/25 blur-3xl"
          />

          <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-14 sm:px-6 sm:pt-20 sm:pb-16 lg:px-8">
            <div className="max-w-3xl">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2.5 mb-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 px-3.5 py-1 text-xs font-semibold text-blue-200 backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                  LEGAL · PRIVACY
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-400/10 border border-blue-300/20 px-3 py-1 text-xs font-medium text-blue-200">
                  <Lock className="h-3.5 w-3.5 text-blue-300" />
                  Official Legal Policy
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/15 px-3 py-1 text-xs font-medium text-slate-300">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  Last Updated: October 12, 2026
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-xs font-medium text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  Effective Date: October 12, 2026
                </span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-5xl text-white">
                Privacy Policy
              </h1>
              <p className="mt-4 text-base leading-relaxed text-blue-100 sm:text-lg max-w-2xl">
                Learn how DomicCare collects, uses, discloses, and safeguards information when you use our Platform.
              </p>

              <div className="mt-4 p-3.5 rounded-xl bg-blue-900/40 border border-blue-700/40 text-xs text-blue-200/90 leading-relaxed max-w-2xl">
                Please read this Privacy Policy carefully. It describes DomicCare’s information practices and the respective responsibilities of DomicCare and authorised technical service providers.
              </div>

              {/* Action Toolbar */}
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-all backdrop-blur-sm cursor-pointer shadow-sm hover:shadow"
                >
                  <Printer className="h-3.5 w-3.5 text-blue-200" />
                  Print / Save PDF
                </button>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-xs font-semibold text-white transition-all backdrop-blur-sm cursor-pointer shadow-sm hover:shadow"
                >
                  {copiedLink ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5 text-blue-200" />}
                  {copiedLink ? 'Link Copied!' : 'Share Policy Link'}
                </button>
                <button
                  onClick={() => setShowPlainSummary(!showPlainSummary)}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all border cursor-pointer ${
                    showPlainSummary
                      ? 'bg-blue-600 border-blue-400 text-white shadow-md shadow-blue-600/30'
                      : 'bg-white/10 border-white/20 text-slate-200 hover:bg-white/20'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                  {showPlainSummary ? 'Summary Notes: ON' : 'Summary Notes: OFF'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Layout */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[18rem_minmax(0,1fr)] gap-8 lg:gap-12">
            
            {/* Sidebar Sticky Nav */}
            <aside className="lg:block">
              <div className="lg:sticky lg:top-24 space-y-5">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search clauses, roles..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Table of Contents */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Sections
                    </span>
                    <span className="text-[11px] font-medium text-slate-400">
                      8 Total
                    </span>
                  </div>

                  <nav className="space-y-1">
                    {SECTIONS.map((sec) => {
                      const isActive = activeSection === sec.id;
                      return (
                        <button
                          key={sec.id}
                          onClick={() => scrollToSection(sec.id)}
                          className={`w-full text-left flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
                              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                          }`}
                        >
                          <span className="truncate pr-2">{sec.title}</span>
                          {sec.badge && (
                            <span className="shrink-0 rounded-md bg-amber-100 text-amber-800 px-1.5 py-0.5 text-[10px] font-bold border border-amber-200">
                              {sec.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Related Links Card */}
                <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-4.5 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Legal Documentation</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Review our operational terms governing user accounts and caregiver directory access.
                  </p>
                  <Link
                    href="/terms"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View Terms of Service
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                {/* Quick Contact Card */}
                <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Privacy Desk</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Have questions regarding your data privacy or technical provider boundaries?
                  </p>
                  <a
                    href="mailto:legal@domiccare.com"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:underline"
                  >
                    <Mail className="h-3 w-3" />
                    legal@domiccare.com
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Content Sections */}
            <div className="space-y-12">
              
              {/* Executive Overview Pill Banner */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5 sm:p-6 text-slate-800">
                <div className="flex items-center gap-2.5 mb-3">
                  <Sparkles className="h-5 w-5 text-blue-600 shrink-0" />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-blue-900">
                    Key Highlights at a Glance
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-blue-100/80 shadow-xs">
                    <span className="font-bold text-slate-900 block mb-1">Data Controller</span>
                    <span className="text-slate-600">DomicCare determines processing purposes and means under applicable law.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-blue-100/80 shadow-xs">
                    <span className="font-bold text-slate-900 block mb-1">Technical Providers</span>
                    <span className="text-slate-600">External developers process data strictly as authorized under written agreements.</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-blue-100/80 shadow-xs">
                    <span className="font-bold text-slate-900 block mb-1">User Data Rights</span>
                    <span className="text-slate-600">Full access, rectification, and deletion rights supported upon verified request.</span>
                  </div>
                </div>
              </div>

              {/* SECTION 1 */}
              {matchesSearch('Introduction Agreement domiccare.com consent platform') && (
                <article id="section-1" className="scroll-mt-28 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                      1
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      1. Introduction
                    </h2>
                  </div>

                  {showPlainSummary && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Summary Note: </strong>
                        This policy explains how DomicCare handles your personal information when using our website and care directory services. Using the platform signifies your consent to these practices.
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700">
                    <p>
                      <strong>DomicCare</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects the privacy of our users (&quot;User&quot; or &quot;you&quot;). This Privacy Policy explains how we collect, store, use, disclose, and safeguard your personal information when you visit <strong className="text-slate-900 font-semibold">domiccare.com</strong> (the &quot;Platform&quot;).
                    </p>
                    <p>
                      Please read this Privacy Policy carefully. By using our Platform, you consent to the data practices described in this policy.
                    </p>
                  </div>
                </article>
              )}

              {/* SECTION 2 */}
              {matchesSearch('Information We Collect direct account care requirement details caregiver credentials technical usage data') && (
                <article id="section-2" className="scroll-mt-28 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                      2
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      2. Information We Collect
                    </h2>
                  </div>

                  {showPlainSummary && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Summary Note: </strong>
                        We only collect what is necessary: profile details for bookings, care requirements for matching, verified credentials for caregivers, and standard technical data for website reliability.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 1 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <User className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Direct Account Information</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Name, email address, physical address, national identity numbers (where required for Caregiver verification), date of birth, and telephone numbers.
                      </p>
                    </div>

                    {/* Card 2 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                          <HeartPulse className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Care Requirement Details</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Type of home care required (e.g., elderly companionship, palliative support, post-operative assistance), scheduled hours, patient emergency contact information, and non-clinical care preferences.
                      </p>
                    </div>

                    {/* Card 3 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                          <BadgeCheck className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Caregiver Professional Credentials</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Diplomas, nursing licenses, employment histories, national identification documents, and background verification records.
                      </p>
                    </div>

                    {/* Card 4 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                          <Server className="h-4 w-4" />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Technical and Usage Data</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        IP addresses, operating system, browser configuration, access timestamps, and analytical browsing patterns collected via standard log files and cookies.
                      </p>
                    </div>
                  </div>
                </article>
              )}

              {/* SECTION 3 - UPDATED COMPREHENSIVE SAFE HARBOR & DATA RESPONSIBILITIES */}
              {matchesSearch('Allocation of Data Responsibilities Technical Service Provider Data Controller developers safe harbor security liability 3.1 3.2 3.3 3.4 3.5') && (
                <article id="section-3" className="scroll-mt-28 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 text-white font-bold text-xs shadow-sm">
                        3
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        3. Allocation of Data Responsibilities & Technical Service Provider
                      </h2>
                    </div>
                    <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-900">
                      UPDATED SECTION · 3.1–3.5
                    </span>
                  </div>

                  {showPlainSummary && (
                    <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Plain-English Legal Summary: </strong>
                        DomicCare decides what data is processed and remains the legal Data Controller. External developers and IT contractors only touch data when necessary to build and maintain the platform under strict contracts. External technical providers are not automatically blamed for third-party cyberattacks, but retain responsibility for their own contracted duties.
                      </div>
                    </div>
                  )}

                  {/* Section Preface Box */}
                  <div className="rounded-2xl border-l-4 border-l-amber-500 border border-slate-200 bg-white p-6 shadow-sm space-y-3">
                    <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                      <Scale className="h-4 w-4 text-amber-600" />
                      Core Principles of Data Processing Governance
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      DomicCare determines the purposes and means of processing personal data for the Platform. External technical providers may access or process data when necessary for authorised technical services, subject to the applicable written agreement and applicable law. No blanket exemption removes responsibilities that cannot legally be excluded.
                    </p>
                  </div>

                  {/* Subsection 3.1 to 3.5 Cards */}
                  <div className="space-y-4">
                    {/* 3.1 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-600" />
                          <h3 className="text-sm font-bold text-slate-900">3.1. Data Controller</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          Platform Role
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        DomicCare determines the purposes and means of processing personal data for the Platform and is responsible for its data-controller obligations under applicable law.
                      </p>
                    </div>

                    {/* 3.2 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-indigo-600" />
                          <h3 className="text-sm font-bold text-slate-900">3.2. Role of Technical Service Providers</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                          Authorized Scope
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        External developers, software engineers and IT contractors provide technical services under the applicable written agreement. Where they access or process personal data to provide those services, they shall do so only as authorised, for the agreed purposes and in accordance with applicable contractual instructions and legal requirements. They shall not use personal data for their own independent purposes unless separately authorised and legally permitted.
                      </p>
                    </div>

                    {/* 3.3 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-rose-600" />
                          <h3 className="text-sm font-bold text-slate-900">3.3. Allocation of Security and Liability Responsibilities</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                          Fair Liability Allocation
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        DomicCare is responsible for its business operations, user-facing privacy commitments, lawful collection of personal data, and controller obligations assigned to it by applicable law. Each technical service provider is responsible for the services it performs, the security measures assigned to it under the applicable written agreement, and its own acts, omissions and legal obligations.
                      </p>
                      <div className="mt-2.5 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 leading-relaxed">
                        <strong className="text-slate-800">Balanced Assessment: </strong>
                        A technical service provider shall not be automatically liable solely because a cyberattack, third-party act or system failure occurs. Responsibility shall depend on the facts, the provider’s role and control, the applicable agreement, and applicable law. Nothing in this Policy excludes liability that cannot legally be excluded, including liability arising from a provider’s own breach or negligence where applicable.
                      </div>
                    </div>

                    {/* 3.4 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-teal-600" />
                          <h3 className="text-sm font-bold text-slate-900">3.4. Technical Access and Cooperation</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          Least Privilege
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        Access to production systems and personal or patient data shall be limited to authorised personnel and the minimum access reasonably necessary for approved technical work. Security incident reporting, investigation, cooperation, data handling and deletion or return requirements shall be governed by the applicable written agreement and applicable law.
                      </p>
                    </div>

                    {/* 3.5 */}
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <h3 className="text-sm font-bold text-slate-900">3.5. Written Agreement</h3>
                        </div>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                          Contractual Governance
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        The applicable development, services and data-processing agreements shall define the technical provider’s scope of work, access permissions, confidentiality, security responsibilities, incident reporting and liability allocation. These agreements govern the relationship between their parties to the extent permitted by applicable law. Nothing in this Policy removes any mandatory legal obligation.
                      </p>
                    </div>
                  </div>
                </article>
              )}

              {/* SECTION 4 */}
              {matchesSearch('How We Use Your Information match bookings verify caregiver credentials fraud regulatory standards') && (
                <article id="section-4" className="scroll-mt-28 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                      4
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      4. How We Use Your Information
                    </h2>
                  </div>

                  {showPlainSummary && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Summary Note: </strong>
                        Information is used solely to facilitate reliable care matching, verify qualified staff, secure payments, prevent fraudulent abuse, and meet regulatory standards.
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <ul className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                      <li className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>To match Clients with verified Caregivers based on service requirements and geographic location.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>To manage bookings, verify caregiver credentials, and process authorized service payments.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>To detect and prevent fraudulent transactions, identity theft, and platform abuse.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="p-1 rounded-full bg-blue-100 text-blue-600 shrink-0 mt-0.5">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>To comply with statutory obligations, judicial orders, or regulatory healthcare standards.</span>
                      </li>
                    </ul>
                  </div>
                </article>
              )}

              {/* SECTION 5 */}
              {matchesSearch('Disclosure of Information Service Match Delivery Infrastructure cloud AWS GCP Legal compliance subpoena') && (
                <article id="section-5" className="scroll-mt-28 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                      5
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      5. Disclosure of Information
                    </h2>
                  </div>

                  {showPlainSummary && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Summary Note: </strong>
                        We do not sell personal data. We disclose data only to matched caregivers to perform care, vetted enterprise cloud partners under strict contracts, or when lawfully required by a court order.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-900">Service Match Delivery</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Pertinent client requirements (e.g., home address, care timing, and patient preferences) are shared with the assigned Caregiver to fulfill booked sessions.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-indigo-600" />
                        <h3 className="text-sm font-bold text-slate-900">Infrastructure Providers</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Data may be securely transferred to enterprise cloud hosting providers (e.g., AWS, GCP), database engines, and transactional email providers operating under strict confidentiality and processing agreements.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <Scale className="h-4 w-4 text-slate-700" />
                        <h3 className="text-sm font-bold text-slate-900">Legal Compliance</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        We may disclose data if mandated by law, court subpoena, or investigative agencies in response to lawful inquiries.
                      </p>
                    </div>
                  </div>
                </article>
              )}

              {/* SECTION 6 */}
              {matchesSearch('Data Security Measures SSL TLS encryption at rest safeguards immune compromise') && (
                <article id="section-6" className="scroll-mt-28 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                      6
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      6. Data Security Measures
                    </h2>
                  </div>

                  {showPlainSummary && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Summary Note: </strong>
                        We use standard encryption in transit (SSL/TLS) and at rest. However, no internet transmission can be 100% risk-free.
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 text-sm leading-relaxed text-slate-700">
                    <p>
                      We deploy commercially reasonable administrative, physical, and technical safeguards—including SSL/TLS data encryption in transit and standard encryption at rest—to secure personal records against unauthorized access or alteration.
                    </p>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-600 leading-relaxed flex items-start gap-3">
                      <AlertCircle className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-slate-800">Internet Architecture Notice: </strong>
                        No electronic transmission over the internet or storage architecture can be guaranteed to be 100% immune from unauthorized compromise. Users and providers are encouraged to exercise vigilance regarding credential security.
                      </div>
                    </div>
                  </div>
                </article>
              )}

              {/* SECTION 7 */}
              {matchesSearch('User Data Rights Request access rectification deletion de-identification') && (
                <article id="section-7" className="scroll-mt-28 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                      7
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      7. User Data Rights
                    </h2>
                  </div>

                  {showPlainSummary && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                      <Sparkles className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-semibold">Summary Note: </strong>
                        You have the right to inspect, update, or ask for the removal of your personal information subject to statutory healthcare record retention rules.
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-900">Right of Access</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Request access to the personal records maintained about you across DomicCare systems.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-900">Right to Rectification</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Request the rectification of incorrect, incomplete, or outdated data associated with your profile.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-600" />
                        <h3 className="text-sm font-bold text-slate-900">Right to Deletion</h3>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Request the deletion or de-identification of your user profile, subject to retention requirements imposed by regulatory or taxation laws.
                      </p>
                    </div>
                  </div>
                </article>
              )}

              {/* SECTION 8 */}
              {matchesSearch('Contact Information legal@domiccare.com Administrative Legal Operations') && (
                <article id="section-8" className="scroll-mt-28 space-y-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-700 font-bold text-xs">
                      8
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      8. Contact Information
                    </h2>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                    <p className="text-sm text-slate-700 leading-relaxed">
                      For legal inquiries, regulatory notices, or privacy access requests regarding these policies, please reach out to:
                    </p>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-3">
                      <div className="font-bold text-slate-900 text-sm">
                        DomicCare Administrative & Legal Operations
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="font-semibold text-slate-800">Website:</span>
                          <a
                            href="https://domiccare.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            https://domiccare.com
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <span className="font-semibold text-slate-800">Email:</span>
                          <a
                            href="mailto:legal@domiccare.com"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            legal@domiccare.com
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-xs text-slate-400 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <span>© DomicCare · Privacy Policy</span>
                      <span>Last updated October 12, 2026</span>
                    </div>
                  </div>
                </article>
              )}

              {/* Bottom Support Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-1.5 text-center sm:text-left">
                  <h3 className="text-base sm:text-lg font-bold">
                    Need Clarification on Data Practices?
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
                    Our compliance desk can assist you with exercising user data rights or clarifying technical provider scope.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href="mailto:legal@domiccare.com"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-blue-900 hover:bg-blue-50 transition-all shadow-md"
                  >
                    <Mail className="h-3.5 w-3.5 text-blue-600" />
                    Email Privacy Desk
                  </a>
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-800/60 border border-blue-500/40 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-800 transition-all"
                  >
                    <HelpCircle className="h-3.5 w-3.5 text-blue-200" />
                    Visit FAQs
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
