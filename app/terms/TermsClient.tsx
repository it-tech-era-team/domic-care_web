'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  ShieldCheck,
  AlertTriangle,
  Scale,
  Server,
  Lock,
  Building2,
  PhoneCall,
  Printer,
  Share2,
  Search,
  ChevronRight,
  CheckCircle2,
  FileText,
  Clock,
  Sparkles,
  ArrowUpRight,
  Check,
  HelpCircle,
  Activity,
  Layers,
  ChevronDown
} from 'lucide-react';

interface SectionNav {
  id: string;
  title: string;
  badge?: string;
  isNewOrUpdated?: boolean;
}

const SECTIONS: SectionNav[] = [
  { id: 'section-1', title: '1. Agreement to Terms' },
  { id: 'section-2', title: '2. Marketplace Model & Roles' },
  { id: 'section-3', title: '3. Medical Emergency Disclaimer' },
  { id: 'section-4', title: '4. Software Developers & Safe Harbor', badge: 'Updated 4.1–4.6', isNewOrUpdated: true },
  { id: 'section-5', title: '5. Account, Security & Data Lifecycle', badge: 'Updated 5.2, 5.6', isNewOrUpdated: true },
  { id: 'section-6', title: '6. Verification & Caregiver Disclaimers' },
  { id: 'section-7', title: '7. Limitation of Liability', badge: 'Updated 7.1–7.3', isNewOrUpdated: true },
  { id: 'section-8', title: '8. Governing Law & Dispute Resolution' },
];

export default function TermsClient() {
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
                Terms of Service
              </h1>
              <p className="mt-4 text-base leading-relaxed text-blue-100 sm:text-lg max-w-2xl">
                Please read these terms carefully before accessing or using DomicCare. This agreement defines the legal rights, boundaries, and safeguards for Clients, independent Caregivers, and Technical Providers.
              </p>

              {/* Action Toolbar */}
              <div className="mt-8 flex flex-wrap items-center gap-3">
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
                  {showPlainSummary ? 'Easy Explanations: ON' : 'Easy Explanations: OFF'}
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
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    placeholder="Search terms or clauses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-11 pl-10 pr-4 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer font-bold"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Table of Contents */}
                <nav className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm" aria-label="Terms of Service Index">
                  <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Layers className="h-3.5 w-3.5 text-blue-600" />
                      Table of Contents
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{SECTIONS.length} Sections</span>
                  </div>
                  <ul className="space-y-1">
                    {SECTIONS.map((sec) => {
                      const isActive = activeSection === sec.id;
                      return (
                        <li key={sec.id}>
                          <button
                            onClick={() => scrollToSection(sec.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-between gap-2 group cursor-pointer ${
                              isActive
                                ? 'bg-blue-50 text-blue-700 shadow-sm font-bold'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span className="truncate">{sec.title}</span>
                            {sec.badge && (
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold tracking-tight shrink-0 ${
                                  isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-blue-100 text-blue-700 group-hover:bg-blue-200'
                                }`}
                              >
                                {sec.badge}
                              </span>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </nav>

                {/* Quick Help Box */}
                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 shadow-sm text-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-900">Legal Representation</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Registered in Pleven, Bulgaria. For formal inquiries or dispute notices:
                  </p>
                  <a
                    href="mailto:helpcarepulse@gmail.com"
                    className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    helpcarepulse@gmail.com
                    <ArrowUpRight className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </aside>

            {/* Main Terms Content */}
            <div className="min-w-0 space-y-12">
              
              {/* Section 1 */}
              <article
                id="section-1"
                className={`scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 ${
                  matchesSearch('agreement binding platform entity') ? 'block' : 'opacity-40'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      1
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Agreement to Terms
                    </h2>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-sm sm:text-base leading-relaxed text-slate-700 space-y-4">
                  <p>
                    These Terms of Service (&ldquo;<strong>Terms</strong>&rdquo;) constitute a legally binding agreement between you—whether personally or on behalf of an entity (&ldquo;<strong>User</strong>,&rdquo; &ldquo;<strong>Client</strong>,&rdquo; &ldquo;<strong>Caregiver</strong>,&rdquo; or &ldquo;<strong>you</strong>&rdquo;)—and <strong>DomicCare</strong> (&ldquo;<strong>Company</strong>,&rdquo; &ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>&rdquo;), concerning your access to and use of the <strong>domiccare.com</strong> website, applications, and associated digital services (collectively, the &ldquo;<strong>Platform</strong>&rdquo;).
                  </p>
                  <p>
                    By accessing or using the Platform, you acknowledge that you have read, understood, and agreed to be bound by all of these Terms. If you do not agree with all of these Terms, you are expressly prohibited from using the Platform and must discontinue use immediately.
                  </p>
                </div>
              </article>

              {/* Section 2 */}
              <article
                id="section-2"
                className={`scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 ${
                  matchesSearch('marketplace independent contractor listings') ? 'block' : 'opacity-40'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      2
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Description of the Platform &amp; Marketplace Model
                    </h2>
                  </div>
                </div>

                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
                  {/* 2.1 */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      2.1. Nature of the Platform and DomicCare&rsquo;s Role
                    </h3>
                    <ul className="space-y-3.5 pl-4 border-l-2 border-slate-200">
                      <li>
                        <strong className="text-slate-900">Technology Intermediary:</strong> DomicCare operates an online directory and discovery platform providing digital tools for listing care services, communicating, and coordinating schedules. The platform enables Clients to discover and contact independent Caregivers. Except where expressly stated otherwise in these Terms, DomicCare does not itself provide the care services arranged between Clients and Caregivers.
                      </li>
                      <li>
                        <strong className="text-slate-900">Independent Listings and Client Choice:</strong> Caregivers are solely responsible for the accuracy and completeness of their listings, including descriptions of services offered, availability, qualifications, and pricing. Clients review available profiles and choose which Caregiver to contact or engage. DomicCare does not automatically assign Caregivers or guarantee suitability for a particular Client&rsquo;s specific requirements.
                      </li>
                      <li>
                        <strong className="text-slate-900">Independent Service Relationship:</strong> Unless the actual arrangement or applicable law dictates otherwise, Caregivers deliver services independently and are not employees or agents of DomicCare solely by reason of using the platform. Their service agreement is executed directly between Client and Caregiver. DomicCare does not direct or control the day-to-day delivery of care services.
                      </li>
                      <li>
                        <strong className="text-slate-900">Platform Safety and Compliance:</strong> DomicCare may take reasonable steps to verify information, enforce platform policies, investigate reported concerns, or suspend accounts where appropriate. Such steps do not constitute an absolute guarantee of Caregiver suitability or service outcomes.
                      </li>
                    </ul>
                  </div>

                  {/* 2.2 */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      2.2. Independent Contractor Status
                    </h3>
                    <ul className="space-y-3.5 pl-4 border-l-2 border-slate-200">
                      <li>
                        <strong className="text-slate-900">Independent Service Providers:</strong> Caregivers are independent contractors and retain absolute commercial independence to determine how they deliver services within the scope of their qualifications and authorizations.
                      </li>
                      <li>
                        <strong className="text-slate-900">Pricing and Services Offered:</strong> Caregivers maintain complete commercial independence to set their own pricing, rates, and service offerings. They are solely responsible for ensuring that all advertised services and pricing schedules are truthful, accurate, and within legal authorizations.
                      </li>
                      <li>
                        <strong className="text-slate-900">No Clinical Authorization:</strong> DomicCare does not establish, inspect, or approve clinical care protocols, nor does it practice medicine or clinical diagnostics.
                      </li>
                      <li>
                        <strong className="text-slate-900">Fee Transparency:</strong> Software access fees or transaction processing fees charged by DomicCare will be itemized and disclosed separately from the Caregiver&rsquo;s professional fees prior to booking confirmation.
                      </li>
                      <li>
                        <strong className="text-slate-900">Taxes &amp; Insurance:</strong> Caregivers are responsible for fulfilling all tax, registration, licensing, and professional liability insurance requirements applicable to their services under governing law.
                      </li>
                      <li>
                        <strong className="text-slate-900">No Exclusion of Mandatory Rights:</strong> Nothing in this Section excludes or restricts rights, duties, or liabilities that cannot lawfully be waived under applicable mandatory law.
                      </li>
                    </ul>
                  </div>

                  {/* 2.3 */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5">
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      2.3. No Direct Healthcare Services
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      DomicCare is a technology platform and is not a licensed hospital, clinic, or direct healthcare provider. The Platform does not render professional nursing judgments or clinical diagnosis. Clinical services are provided independently by third-party healthcare professionals using the Platform.
                    </p>
                  </div>
                </div>
              </article>

              {/* Section 3: Medical Emergency Disclaimer */}
              <article
                id="section-3"
                className={`scroll-mt-24 rounded-3xl border-2 border-rose-200 bg-rose-50/60 p-6 sm:p-8 shadow-sm transition-all duration-200 ${
                  matchesSearch('medical emergency 911 112 999 hospital trauma') ? 'block' : 'opacity-40'
                }`}
              >
                <div className="flex items-center gap-3 border-b border-rose-200/80 pb-4 mb-5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white font-bold">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-rose-950">
                      3. Medical Emergency Disclaimer
                    </h2>
                    <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
                      Critical Life-Safety Protocol
                    </span>
                  </div>
                </div>

                <div className="space-y-4 text-sm sm:text-base leading-relaxed text-rose-950 font-medium">
                  <p className="font-bold text-rose-900 text-base sm:text-lg">
                    THE PLATFORM IS NOT DESIGNED, INTENDED, OR LICENSED FOR MEDICAL EMERGENCIES.
                  </p>
                  <p>
                    If you or the person under your care experiences an acute medical emergency, severe trauma, sudden chest pain, breathing difficulty, or any life-threatening condition, <strong>immediately contact your local emergency services dispatch</strong>:
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
                    <div className="rounded-xl bg-white border border-rose-200 p-3 text-center shadow-xs">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Europe / Bulgaria</p>
                      <p className="text-xl font-extrabold text-rose-600">112</p>
                    </div>
                    <div className="rounded-xl bg-white border border-rose-200 p-3 text-center shadow-xs">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">United Kingdom</p>
                      <p className="text-xl font-extrabold text-rose-600">999</p>
                    </div>
                    <div className="rounded-xl bg-white border border-rose-200 p-3 text-center shadow-xs">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">North America</p>
                      <p className="text-xl font-extrabold text-rose-600">911</p>
                    </div>
                    <div className="rounded-xl bg-white border border-rose-200 p-3 text-center shadow-xs">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Other Regions</p>
                      <p className="text-xs font-bold text-slate-800 pt-1">Local Hospital ER</p>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-rose-900">
                    Do not submit urgent medical requests through DomicCare chat or booking systems. Proceed immediately to the nearest hospital emergency department or dispatch.
                  </p>
                </div>
              </article>

              {/* Section 4: Software Developers & Safe Harbor (UPDATED) */}
              <article
                id="section-4"
                className={`scroll-mt-24 rounded-3xl border-2 border-blue-200 bg-white p-6 sm:p-8 shadow-md shadow-blue-500/5 transition-all duration-200 ${
                  matchesSearch('technical developers safe harbor independent contractor indemnity circumvention signed agreement') ? 'block' : 'opacity-40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-sm shadow-sm">
                      <Server className="h-4 w-4" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                        4. Third-Party Software Developers &amp; Technical Service Providers (Safe Harbor)
                      </h2>
                      <p className="text-xs text-blue-600 font-semibold">
                        Updated Legal Framework &bull; Technical Contractor Boundaries &bull; Sections 4.1–4.6
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                    <Sparkles className="h-3 w-3 text-blue-600" />
                    Updated Clause
                  </span>
                </div>

                {/* Important Safe Harbor Header Banner */}
                <div className="rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-900 p-4 sm:p-5 text-white mb-6 shadow-sm">
                  <p className="text-xs uppercase font-extrabold tracking-wider text-blue-300">
                    Legal Notice: Technical Contractor Independence &amp; Allocation of Responsibilities
                  </p>
                  <p className="mt-1 text-sm sm:text-base font-medium text-blue-50 leading-relaxed">
                    The Technical Development Providers operate solely as independent technical vendors under signed contract. All caregiving operations, clinical oversight, client–caregiver relationships, and commercial operations reside with DomicCare.
                  </p>
                </div>

                {/* 4.1 & 4.2 */}
                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        4.1. Independent Technical Service Provider Designation
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Updated 4.1
                      </span>
                    </div>
                    <p>
                      You expressly acknowledge, understand, and agree that the software development agency, freelance engineers, database architects, system administrators, cloud infrastructure architects, and interface designers who designed, authored, implemented, tested, deployed, or maintain the source code and software infrastructure of DomicCare (collectively, the &ldquo;<strong>Technical Development Providers</strong>&rdquo; or &ldquo;<strong>Technical Team</strong>&rdquo;) act strictly as <strong>independent technical service providers</strong> under separate contractual engagement with DomicCare management.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        4.2. Complete Separation of Operational &amp; Caregiving Responsibilities
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Updated 4.2
                      </span>
                    </div>
                    <p>
                      The Technical Development Providers have no operational ownership, equity stake, clinical oversight, medical supervisory authority, administrative control, or day-to-day management responsibilities regarding DomicCare or the services arranged through the Platform.
                    </p>
                    <p>
                      <strong>All core business operations, caregiving practices, clinical decisions, caregiver screening protocols, and client–caregiver relationships remain solely and exclusively the responsibility of DomicCare</strong>, unless a separate, validly signed written agreement expressly assigns a specific operational task to the technical team.
                    </p>

                    {showPlainSummary && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block mb-0.5">
                            Easy Words Explanation (Sections 4.1 &amp; 4.2):
                          </span>
                          &ldquo;Hum software banate aur maintain karte hain. DomicCare ka business ya caregiving operate nahi karte.&rdquo; (The development team builds and maintains the technology; DomicCare exclusively operates the business, clinical standards, and caregiving services).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4.3 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        4.3. Technical Team Liability &amp; Governing Standards
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Updated 4.3
                      </span>
                    </div>
                    <p>
                      The liability of the Technical Development Providers is governed strictly by their signed agreement with DomicCare and applicable law:
                    </p>
                    <ul className="space-y-2.5 pl-4 border-l-2 border-slate-200 text-sm">
                      <li>
                        <strong className="text-slate-900">Third-Party and Caregiver Conduct:</strong> Technical Providers do not provide clinical services, medical advice, or direct caregiving. To the fullest extent permitted by law, Technical Providers disclaim all liability for any personal injury, bodily harm, medical malpractice, patient neglect, emotional distress, or wrongful death resulting from the acts or omissions of any Caregiver, Client, or third party, as well as private disputes or financial arrangements arising between Users.
                      </li>
                      <li>
                        <strong className="text-slate-900">Software &amp; Infrastructure Safeguards:</strong> Technical Providers maintain commercially reasonable standards regarding software functionality, uptime, and security. Subject to non-waivable statutory duties, Technical Providers disclaim liability for indirect losses, temporary third-party hosting outages, algorithmic variations, or external unauthorized cyber intrusions where industry-standard safeguards were maintained.
                      </li>
                      <li>
                        <strong className="text-slate-900">Preservation of Fault-Based Responsibility (No Blanket Immunity):</strong> This safe harbor provision does not grant blanket immunity or relieve the technical team of accountability. The Technical Development Providers remain accountable for their own proven gross negligence, intentional misconduct, material contractual breach of their signed agreement, or direct statutory violations under applicable law.
                      </li>
                      <li>
                        <strong className="text-slate-900">Monetary Liability Cap:</strong> In no event shall any aggregate monetary liability of the Technical Providers to an end user under or relating to the Platform exceed the total fees paid by such user to DomicCare in the twelve (12) months preceding the incident (or $100 USD if no fees have been paid), subject to non-waivable mandatory consumer statutes.
                      </li>
                    </ul>

                    {showPlainSummary && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block mb-0.5">
                            Easy Words Explanation (Section 4.3):
                          </span>
                          &ldquo;Hum har caregiver ya platform action ke automatically responsible nahi honge, lekin apni ghalti ki responsibility se exempt bhi nahi honge.&rdquo; (Technical providers are not liable for caregiver actions or third-party acts, but retain accountability for their own direct fault or breach).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4.4 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        4.4. Indemnification &amp; Handling of Claims
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Updated 4.4
                      </span>
                    </div>
                    <p>
                      Indemnity and claim management between DomicCare and the Technical Development Providers are defined exclusively in accordance with their bilateral signed agreement:
                    </p>
                    <ul className="space-y-2.5 pl-4 border-l-2 border-slate-200 text-sm">
                      <li>
                        <strong className="text-slate-900">Separation of Burdens:</strong> Each party remains strictly responsible for its own respective negligence, breaches, and statutory obligations. The financial or legal burden of DomicCare&rsquo;s independent commercial activities, clinical policies, or caregiving liabilities shall not automatically transfer to the development team.
                      </li>
                      <li>
                        <strong className="text-slate-900">User Indemnity:</strong> To the maximum extent permitted by applicable law, you agree to defend, indemnify, and hold harmless DomicCare, its technical contractors, and hosting providers from third-party claims arising out of your misuse of the Platform, violation of these Terms, or disputes with other Users, excluding claims resulting directly from the indemnified party&rsquo;s own fraud or gross negligence.
                      </li>
                    </ul>

                    {showPlainSummary && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block mb-0.5">
                            Easy Words Explanation (Section 4.4):
                          </span>
                          &ldquo;DomicCare ki apni business ya caregiving responsibilities ka burden automatically development team par nahi aana chahiye.&rdquo; (DomicCare&rsquo;s own caregiving and operational liabilities cannot be shifted onto the software development team).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4.5 */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        4.5. Anti-Circumvention Rules &amp; Technical Contractor Exemption
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Updated 4.5
                      </span>
                    </div>
                    <p>
                      For a period of twelve (12) months following the initial introduction or booking between a Client and a Caregiver through the Platform (&ldquo;<strong>Exclusivity Period</strong>&rdquo;), all communications, care bookings, and monetary transactions for care services between such Client and Caregiver must take place exclusively through the DomicCare Platform. Off-platform booking to circumvent platform fees is strictly prohibited.
                    </p>
                    <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-sm text-slate-800">
                      <strong className="text-blue-900 block mb-1">
                        Explicit Exemption for Software Development Company:
                      </strong>
                      It is explicitly clarified and agreed that the client–caregiver exclusivity rule and non-circumvention restrictions apply strictly to caregiving arrangements between Clients and Caregivers, and <strong>do NOT apply to the software development company, technical providers, or engineering contractors</strong>. The technical team retains full commercial freedom to provide development, engineering, consulting, and design services to other clients and independent projects, subject only to any separate lawful bilateral agreement directly between DomicCare and the technical provider.
                    </div>

                    {showPlainSummary && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block mb-0.5">
                            Easy Words Explanation (Section 4.5):
                          </span>
                          &ldquo;Caregivers ke off-platform dealings wala rule software development company par apply nahi hoga.&rdquo; (Caregiver off-platform exclusivity rules do not restrict the software development company from working on other client projects).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4.6 (NEW CLAUSE) */}
                  <div className="space-y-3 pt-4 border-t-2 border-blue-200 bg-blue-50/40 p-4 sm:p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-blue-950 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        4.6. Priority of Signed Development Agreement (New Clause)
                      </h3>
                      <span className="text-[10px] font-extrabold text-white bg-blue-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        New Clause
                      </span>
                    </div>
                    <p className="text-slate-800">
                      In the event of any conflict, discrepancy, ambiguity, or inconsistency between these public Terms of Service and any separate written, signed agreement executed between DomicCare and the Technical Development Providers concerning <strong>technical scope of work, data access permissions, cybersecurity protocols, intellectual property ownership, indemnity, or limitations of liability</strong>, the provisions of the signed bilateral agreement shall take precedence and govern between DomicCare and the Technical Development Providers, to the fullest extent permitted by applicable governing law.
                    </p>

                    {showPlainSummary && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block mb-0.5">
                            Easy Words Explanation (Section 4.6):
                          </span>
                          &ldquo;Agar public terms aur hamare signed contract mein technical responsibilities ka conflict ho, to law ke mutabiq signed contract follow hoga.&rdquo; (If there is any conflict regarding technical matters between these public terms and the signed development contract, the signed contract takes priority).
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>

              {/* Section 5: Account Registration, Security, and Lifecycle (UPDATED) */}
              <article
                id="section-5"
                className={`scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 ${
                  matchesSearch('account security incident reporting deletion retention access patient data') ? 'block' : 'opacity-40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      5
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Account Registration, Security &amp; Data Lifecycle
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                    Updated 5.2, 5.6
                  </span>
                </div>

                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
                  {/* 5.1 */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      5.1. Registration &amp; Credential Security
                    </h3>
                    <p>
                      Users must provide truthful, current, and complete registration information. You are solely responsible for maintaining the confidentiality of your login credentials (usernames, passwords, and multi-factor authentication tokens) and assume full responsibility for all activities conducted under your account.
                    </p>
                  </div>

                  {/* 5.2 (UPDATED) */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        5.2. Security Incidents, Escalation &amp; Technical Cooperation (Updated)
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Updated 5.2
                      </span>
                    </div>
                    <p>
                      Users must notify DomicCare immediately at <a href="mailto:helpcarepulse@gmail.com" className="text-blue-600 underline font-semibold">helpcarepulse@gmail.com</a> upon suspecting or detecting any unauthorized access, credential theft, or system vulnerability.
                    </p>
                    <p>
                      Between DomicCare and the Technical Development Providers, protocols for <strong>security incident reporting, severity escalation, investigation, and technical cooperation</strong> are governed by their signed development agreement and applicable cybersecurity regulations, while ensuring strict compliance with mandatory statutory notification deadlines required by data protection authorities.
                    </p>

                    {showPlainSummary && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block mb-0.5">
                            Easy Words Explanation (Section 5.2):
                          </span>
                          &ldquo;Agar security issue aaye, to hum agreed procedure ke mutabiq report aur cooperate karenge.&rdquo; (If a security incident arises, technical teams report and cooperate according to agreed procedures and legal notification deadlines).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 5.3 & 5.4 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                        5.3. Account Suspension &amp; Appeals
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        DomicCare may suspend or terminate accounts for Terms violations, fraudulent records, failed background screenings, or safety risks. Users may submit an appeal within fourteen (14) days to helpcarepulse@gmail.com.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                      <h4 className="text-sm font-bold text-slate-900 mb-1.5">
                        5.4. Effect on Active Bookings
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Pending bookings may be reassigned or cancelled to safeguard patient welfare. Settled care hours prior to termination are disbursed according to payment terms, subject to fraud withholding.
                      </p>
                    </div>
                  </div>

                  {/* 5.5 */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      5.5. Account Deletion &amp; Statutory Retention
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Users may request account deletion at any time. Financial transaction logs, consent logs, and audit logs are retained for statutory retention periods mandated under Bulgarian, European Union, and applicable accounting laws.
                    </p>
                  </div>

                  {/* 5.6 (NEW CLAUSE) */}
                  <div className="space-y-3 pt-4 border-t-2 border-blue-200 bg-blue-50/40 p-4 sm:p-5 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base sm:text-lg font-bold text-blue-950 flex items-center gap-2">
                        <Lock className="h-4 w-4 text-blue-600" />
                        5.6. Technical Provider Data Access, Confidentiality &amp; Compliance (New Clause)
                      </h3>
                      <span className="text-[10px] font-extrabold text-white bg-blue-600 px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        New Clause
                      </span>
                    </div>
                    <p className="text-slate-800">
                      To ensure maximum patient privacy and regulatory compliance across data handling:
                    </p>
                    <ul className="space-y-2.5 pl-4 border-l-2 border-blue-300 text-sm text-slate-700">
                      <li>
                        <strong className="text-slate-900">Authorized &amp; Necessary Access Only:</strong> Access by the Technical Development Providers to production systems, servers, and patient care records is strictly restricted to authorized engineers on a documented need-to-know basis solely as technically necessary for infrastructure maintenance, bug remediation, security audits, and performance tuning.
                      </li>
                      <li>
                        <strong className="text-slate-900">Strict Confidentiality &amp; Safeguards:</strong> Technical Providers are bound by strict non-disclosure obligations and maintain industry-standard physical, technical, and administrative safeguards (including end-to-end encryption in transit and AES-256 encryption at rest).
                      </li>
                      <li>
                        <strong className="text-slate-900">Assistance with Data Requests:</strong> Technical Providers will reasonably assist DomicCare in fulfilling verified data subject rights (access, correction, or deletion requests) in accordance with the signed agreement and applicable law.
                      </li>
                      <li>
                        <strong className="text-slate-900">Data Return &amp; Deletion Upon Termination:</strong> Upon the expiration or conclusion of the technical services engagement, Technical Development Providers will return or securely destroy protected customer and patient data in accordance with agreed procedures, retaining only archival copies required by mandatory statutory retention obligations.
                      </li>
                      <li>
                        <strong className="text-slate-900">Respective Duties:</strong> DomicCare and the Technical Development Providers each independently fulfill their respective legal and contractual obligations under applicable data protection regulations.
                      </li>
                    </ul>

                    {showPlainSummary && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block mb-0.5">
                            Easy Words Explanation (Section 5.6):
                          </span>
                          &ldquo;Patient data ka access limited aur authorised hoga. DomicCare aur development team dono apni apni legal aur contractual responsibilities fulfil karenge.&rdquo; (Patient data access is strictly limited and authorized; DomicCare and the technical team fulfill their respective data protection obligations).
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </article>

              {/* Section 6: User Verification & Disclaimer of Caregiver Guarantees */}
              <article
                id="section-6"
                className={`scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 ${
                  matchesSearch('verification background check screening diligence warranty') ? 'block' : 'opacity-40'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      6
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      User Verification &amp; Disclaimer of Caregiver Guarantees
                    </h2>
                  </div>
                </div>

                <div className="space-y-5 text-sm sm:text-base leading-relaxed text-slate-700">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      6.1. Scope of Baseline Verification
                    </h3>
                    <p>
                      DomicCare performs baseline verification for Caregivers at onboarding. Unless stated otherwise in writing, &ldquo;Verified Status&rdquo; is limited strictly to:
                    </p>
                    <ol className="list-decimal pl-5 space-y-1.5 mt-2 text-sm text-slate-600">
                      <li>Government-issued identification verification via a third-party identity partner;</li>
                      <li>Checking active registration or professional licenses provided by the Caregiver at initial onboarding; and</li>
                      <li>Performing baseline criminal background screenings where legally permissible.</li>
                    </ol>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        6.2. Limitations of Verification
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Screenings reflect initial onboarding checks and may not capture subsequent real-time changes or license suspensions. DomicCare does not guarantee ongoing moral character or competence.
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <h4 className="text-sm font-bold text-slate-900 mb-1">
                        6.3. Client Due Diligence &amp; Safety
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Clients remain responsible for taking common-sense safety precautions in their residences, including requesting visual inspection of badges upon arrival.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs sm:text-sm text-slate-600">
                    <strong className="text-slate-900 block mb-1">6.4. General Disclaimer of Warranties:</strong>
                    Except as expressly set forth herein, the Platform and all services facilitated through it are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranties of any kind, whether express or implied.
                  </div>
                </div>
              </article>

              {/* Section 7: Limitation of Liability (UPDATED) */}
              <article
                id="section-7"
                className={`scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 ${
                  matchesSearch('limitation liability cap damages indirect statutory') ? 'block' : 'opacity-40'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      7
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Limitation of Liability
                    </h2>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                    Updated 7.1–7.3
                  </span>
                </div>

                <div className="space-y-6 text-sm sm:text-base leading-relaxed text-slate-700">
                  {/* 7.1 */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      7.1. Exclusion of Indirect &amp; Consequential Damages
                    </h3>
                    <p>
                      To the maximum extent permitted by applicable law, in no event shall DomicCare, its officers, directors, employees, agents, or Technical Development Providers be liable to you or any third party for any indirect, exemplary, incidental, special, reliance, or consequential damages (including lost profits, lost data, loss of goodwill, business interruption, or technical service downtime), even if advised of the possibility of such damages.
                    </p>
                  </div>

                  {/* 7.2 (UPDATED) */}
                  <div className="space-y-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600" />
                        7.2. Aggregate Financial Liability Cap &amp; Distinction of Responsibilities (Updated)
                      </h3>
                      <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        Updated 7.2
                      </span>
                    </div>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm space-y-2">
                      <p>
                        <strong className="text-slate-900">Distinction Between DomicCare and Technical Providers:</strong> DomicCare&rsquo;s user-facing liability limits and the Technical Development Providers&rsquo; liability toward DomicCare are defined separately. The technical provider&rsquo;s liability is governed strictly by the signed development agreement and applicable law. DomicCare&rsquo;s commercial, operational, and caregiver liabilities do not automatically transfer to the Technical Development Providers.
                      </p>
                      <p>
                        <strong className="text-slate-900">Cap Amount:</strong> To the maximum extent permitted by law, the aggregate liability of DomicCare and its technical contractors for all claims under or in connection with these Terms shall be strictly limited to the total fees paid by you to DomicCare during the twelve (12) months preceding the event giving rise to liability, or $100 USD (or local currency equivalent), whichever is greater.
                      </p>
                    </div>

                    {showPlainSummary && (
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-950 flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider text-emerald-800 text-[10px] block mb-0.5">
                            Easy Words Explanation (Section 7.2):
                          </span>
                          &ldquo;Development team ki liability signed contract ke mutabiq hogi. Public terms se DomicCare ki saari liability automatically team par transfer nahi hogi.&rdquo; (The development team&rsquo;s liability is strictly set by the signed contract and law; DomicCare&rsquo;s public liabilities cannot automatically be dumped on the development team).
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 7.3 */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 mb-1">
                      7.3. Preservation of Mandatory Statutory Rights &amp; Local Law Carve-Outs
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600">
                      Nothing in these Terms excludes or restricts liability for death or personal injury directly caused by proven negligence, intentional fraud, willful misconduct, or any mandatory consumer protections that cannot lawfully be waived under Bulgarian law or European Union directives.
                    </p>
                  </div>
                </div>
              </article>

              {/* Section 8: Governing Law and Dispute Resolution */}
              <article
                id="section-8"
                className={`scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition-all duration-200 ${
                  matchesSearch('governing law dispute pleven bulgaria resolution consumer venue') ? 'block' : 'opacity-40'
                }`}
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-sm">
                      8
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                      Governing Law &amp; Dispute Resolution
                    </h2>
                  </div>
                </div>

                <div className="space-y-5 text-sm sm:text-base leading-relaxed text-slate-700">
                  {/* 8.1 */}
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                    <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wider mb-2 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      8.1. Registered Legal Entity
                    </h3>
                    <p className="text-sm text-slate-800">
                      These Terms of Service constitute a binding agreement with <strong>DomicCare Inc. / DomicCare Ltd.</strong>, registered in Pleven, Bulgaria.
                    </p>
                    <div className="mt-2 text-xs text-slate-600 font-medium">
                      Principal Place of Business: Blvd. G.S. Rokvski No 48, 5800 Pleven, Bulgaria.
                    </div>
                  </div>

                  {/* 8.2 */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      8.2. Choice of Law &amp; Exclusive Venue
                    </h3>
                    <p className="text-sm text-slate-600">
                      These Terms, and any non-contractual claims arising hereunder, shall be governed by and construed in accordance with the laws of <strong>Pleven, Bulgaria</strong>. Subject to mandatory local consumer provisions, the courts located in Pleven, Bulgaria shall hold exclusive jurisdiction.
                    </p>
                  </div>

                  {/* 8.3 */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">
                      8.3. Mandatory Consumer Rights &amp; Local Law Carve-Out
                    </h3>
                    <p className="text-sm text-slate-600">
                      If you are an individual consumer, nothing in Section 8.2 deprives you of protections afforded by mandatory consumer regulations in your country or jurisdiction of residence (including applicable European Union and UK consumer protections). Where mandatory statutes require, you may bring proceedings before competent local courts.
                    </p>
                  </div>

                  {/* 8.4 */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Scale className="h-4 w-4 text-blue-600" />
                      8.4. Informal Dispute Resolution Period
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Before initiating formal litigation or arbitration, you agree to attempt informal resolution by contacting our legal team at <a href="mailto:helpcarepulse@gmail.com" className="text-blue-600 underline font-semibold">helpcarepulse@gmail.com</a>. Both parties will engage in good-faith negotiations for at least thirty (30) days from initial notice.
                    </p>
                  </div>
                </div>
              </article>

              {/* Bottom Support Callout */}
              <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold">Have questions regarding these Terms?</h3>
                  <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
                    Our compliance and legal team is available to assist with contract questions, data privacy inquiries, or caregiver agreements.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <a
                    href="mailto:helpcarepulse@gmail.com"
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-bold text-blue-900 hover:bg-blue-50 transition-all shadow-md shadow-blue-950/20"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-blue-600" />
                    Contact Legal Desk
                  </a>
                  <Link
                    href="/faq"
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-700/60 hover:bg-blue-700 border border-blue-500/40 px-5 py-2.5 text-xs font-bold text-white transition-all"
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
