'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useCareConnect, Service } from '@/context/useCareConnect';
import {
  Shield,
  Calendar,
  MessageSquare,
  MapPin,
  Heart,
  ArrowRight,
  UserCheck,
  Star,
  Sparkles,
  Activity,
  Stethoscope,
  HeartHandshake,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  Search,
  CalendarCheck
} from 'lucide-react';

export default function Home() {
  const { services: contextServices } = useCareConnect();
  const [servicesList, setServicesList] = useState<Service[]>([]);

  useEffect(() => {
    // Fetch public services list or fallback to context
    fetch('/api/services')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.services && data.services.length > 0) {
          setServicesList(data.services);
        } else if (contextServices && contextServices.length > 0) {
          setServicesList(contextServices);
        }
      })
      .catch(() => {
        if (contextServices && contextServices.length > 0) {
          setServicesList(contextServices);
        }
      });
  }, [contextServices]);

  // Default fallback services matching design layout
  const displayServices =
    servicesList.length > 0
      ? servicesList
      : [
          {
            id: 'default-1',
            name: 'Elder Care',
            description: 'Eldercare is a comprehensive range of support services for older adults who are facing physical or mental challenges.',
          },
          {
            id: 'default-2',
            name: 'Physiotherapy',
            description: 'The treatment of disease, injury, or physical conditions by methods such as massage, heat treatment, and exercise.',
          },
          {
            id: 'default-3',
            name: 'Nursing & Medical Care',
            description: 'Professional registered nurses providing specialized wound care, medication administration, and vitals monitoring.',
          },
          {
            id: 'default-4',
            name: 'Companionship & Social Support',
            description: 'Friendly caregivers offering engaging conversations, daily meal preparation, walks, and emotional wellbeing support.',
          },
        ];

  // Bullet points checklist helper for each service
  const getServiceBullets = (serviceName: string) => {
    const lower = serviceName.toLowerCase();
    if (lower.includes('elder') || lower.includes('senior')) {
      return ['Personal care & daily assistance', 'Companionship & emotional support', 'Mobility & safety support'];
    }
    if (lower.includes('physio') || lower.includes('rehab')) {
      return ['Pain management', 'Rehabilitation & recovery', 'Exercise & mobility training'];
    }
    if (lower.includes('nurs') || lower.includes('medic')) {
      return ['Medication administration', 'Wound care & vitals check', 'Post-op clinical support'];
    }
    if (lower.includes('companion')) {
      return ['Social interaction & outings', 'Meal prep & light housekeeping', 'Emotional wellbeing support'];
    }
    return ['Personalized family care', 'Certified professional helper', 'Flexible scheduling & safety'];
  };

  // Helper icons for service cards
  const serviceIcons = [HeartHandshake, Stethoscope, Activity, Sparkles, Shield, UserCheck];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-10 pb-20 sm:pt-14 lg:pt-20 lg:pb-28">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -z-10 h-[550px] w-[550px] rounded-full bg-blue-50/60 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[450px] w-[450px] rounded-full bg-teal-50/50 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600 border border-blue-100/80 shadow-sm">
                <Heart className="h-3.5 w-3.5 fill-blue-600 text-blue-600" />
                <span>Your Family Care Marketplace</span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:leading-[1.15]">
                Find Trusted Care For Your{' '}
                <span className="relative inline-block text-blue-600">
                  Loved Ones
                  <svg
                    className="absolute -bottom-2 left-0 w-full h-3 text-blue-600 overflow-visible"
                    viewBox="0 0 200 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M3 9C50 3 150 3 197 9"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>
              
              <p className="mx-auto lg:mx-0 max-w-xl text-base sm:text-lg text-slate-500 leading-relaxed font-medium">
                Domic Care links families seeking care with certified, background-checked professional caregivers near you. Manage bookings, schedule availability, and communicate directly on one safe platform.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-1">
                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-3.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>Find Caregivers</span>
                </Link>
              </div>

              {/* Social Proof Trust Bar */}
              <div className="pt-6 sm:pt-8 flex flex-wrap items-center justify-center lg:justify-start gap-6 border-t border-slate-100 max-w-xl">
                {/* Avatars + Count */}
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2 overflow-hidden">
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="User avatar"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                      alt="User avatar"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                      alt="User avatar"
                    />
                    <img
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white object-cover"
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80"
                      alt="User avatar"
                    />
                  </div>
                  <div>
                    <span className="block text-base font-extrabold text-blue-600 leading-none">20K+</span>
                    <span className="text-[11px] font-semibold text-slate-500">Families Trust Domic Care</span>
                  </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-8 w-[1px] bg-slate-200" />

                {/* Verified Shield Badge */}
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <ShieldCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 max-w-[170px] leading-tight text-left">
                    All caregivers are verified & background-checked
                  </span>
                </div>
              </div>
            </div>

            {/* Right Graphic/Illustration */}
            <div className="mt-12 lg:mt-0 lg:col-span-5 relative flex justify-center">
              {/* Soft Light Blue Backdrop Box */}
              <div className="absolute -inset-3 sm:-inset-4 bg-blue-100/50 rounded-[40px] -z-10 translate-x-3 translate-y-3" />

              {/* Blue Decorative Dot Grid Matrix */}
              <div className="absolute -top-6 -left-6 grid grid-cols-6 gap-2.5 -z-10 opacity-30 hidden sm:grid">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                ))}
              </div>

              {/* Top Right Floating Badge: Verified & Trusted Care */}
              <div className="absolute -top-4 -right-2 sm:-right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3 px-4 shadow-xl border border-slate-100 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                </div>
                <div className="text-left">
                  <span className="block text-xs font-extrabold text-slate-900 leading-tight">Verified &</span>
                  <span className="block text-xs font-extrabold text-slate-900 leading-tight">Trusted Care</span>
                </div>
              </div>

              {/* Main Hero Photo Container */}
              <div className="relative w-full max-w-[420px] h-[460px] rounded-[32px] overflow-hidden shadow-2xl border-4 border-white bg-slate-100 group">
                <img
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=800&auto=format&fit=crop&q=80"
                  alt="Family care illustration"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Bottom Floating Caregiver Profile Card */}
                <div className="absolute bottom-4 left-3 right-3 sm:left-4 sm:right-4 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-500 text-white shrink-0 shadow-md shadow-teal-500/20">
                      <UserCheck className="h-5.5 w-5.5" />
                    </div>
                    <div className="min-w-0 text-left">
                      <span className="block text-xs font-extrabold text-slate-900 truncate">John Doe, LPN</span>
                      <span className="block text-[10px] text-slate-500 font-semibold truncate">Approved Nursing Specialist</span>
                      <span className="block text-[10px] text-slate-400 font-medium">📍 1.2km away</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 shrink-0">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-xs font-extrabold text-amber-700">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Services Section (Cards added by Admin) */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-white via-blue-50/30 to-slate-50 border-y border-slate-200/60 overflow-hidden">
        {/* Soft Background Wave Graphics */}
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl opacity-60" />

        {/* Decorative Dot Grid Matrices */}
        <div className="absolute left-6 top-1/3 grid grid-cols-5 gap-2.5 opacity-25 hidden xl:grid">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          ))}
        </div>
        <div className="absolute right-6 top-1/4 grid grid-cols-5 gap-2.5 opacity-25 hidden xl:grid">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600 border border-blue-100/80 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Tailored Family Care Solutions</span>
            </div>
            
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Our <span className="text-blue-600">Available</span> Services
            </h2>

            {/* Heart Divider Line */}
            <div className="flex items-center justify-center gap-2 pt-1 pb-1">
              <span className="h-[1.5px] w-8 bg-blue-200 rounded-full" />
              <Heart className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
              <span className="h-[1.5px] w-8 bg-blue-200 rounded-full" />
            </div>

            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
              Explore specialized care services tailored to your family's unique needs, provided by verified independent caregivers.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayServices.map((service, idx) => {
              const IconComponent = serviceIcons[idx % serviceIcons.length];
              const bullets = getServiceBullets(service.name);

              return (
                <div
                  key={service.id || idx}
                  className="group relative flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  <div className="space-y-5">
                    {/* Icon Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-100/80">
                        <MapPin className="h-3 w-3 text-emerald-500" />
                        <span>Available Locally</span>
                      </span>
                    </div>

                    {/* Title & Short Accent Line */}
                    <div className="space-y-1.5 text-left">
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <div className="h-0.5 w-6 bg-blue-600 rounded-full" />
                      <p className="text-xs text-slate-500 font-medium leading-relaxed pt-2 line-clamp-3">
                        {service.description || 'Comprehensive support services tailored to your family requirements with utmost dignity and safety.'}
                      </p>
                    </div>

                    {/* Bullet Points Checklist */}
                    <div className="pt-3 space-y-2.5 border-t border-slate-100 text-left">
                      {bullets.map((bullet, bIdx) => (
                        <div key={bIdx} className="flex items-center gap-2.5">
                          <div className="flex h-4.5 w-4.5 items-center justify-center rounded-full border border-blue-600/30 text-blue-600 shrink-0 bg-blue-50/50">
                            <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          <span className="text-xs font-semibold text-slate-600">{bullet}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Link */}
                  <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/get-started?service=${encodeURIComponent(service.name)}`}
                      className="text-sm font-extrabold text-blue-600 group-hover:text-blue-700 cursor-pointer"
                    >
                      Find Caregivers
                    </Link>
                    <Link
                      href={`/get-started?service=${encodeURIComponent(service.name)}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:bg-blue-700 group-hover:scale-105 transition-all cursor-pointer"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section / Our Commitment */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-slate-50/50 via-white to-blue-50/30 border-b border-slate-100 overflow-hidden">
        {/* Soft Background Wave Graphics */}
        <div className="absolute top-1/2 left-0 -z-10 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl -translate-y-1/2 opacity-50" />
        <div className="absolute top-1/2 right-0 -z-10 h-96 w-96 rounded-full bg-indigo-100/40 blur-3xl -translate-y-1/2 opacity-50" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600 border border-blue-100/80 shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              <span>Our Commitment</span>
            </div>
            
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Designed For Safety, Trust, and <span className="text-blue-600">Peace of Mind</span>
            </h2>

            {/* Heart Divider Line */}
            <div className="flex items-center justify-center gap-2 pt-1 pb-1">
              <span className="h-[1.5px] w-8 bg-blue-200 rounded-full" />
              <Heart className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
              <span className="h-[1.5px] w-8 bg-blue-200 rounded-full" />
            </div>

            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
              Every feature is crafted to ensure families can access reliable, dignified care with total confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {/* Feature 1 */}
            <div className="group relative flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
              {/* Background Watermark Icon SVG */}
              <div className="absolute top-4 right-4 text-blue-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Shield className="h-20 w-20 stroke-[1.2]" />
              </div>

              <div className="space-y-5 relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                  <Shield className="h-7 w-7" />
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    Verified Caregivers
                  </h3>

                  {/* Dot-Dash Accent Line */}
                  <div className="flex items-center gap-1 py-1">
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-0.5 w-4 rounded-full bg-blue-600" />
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium pt-1">
                    We verify government IDs, professional medical certificates, and background checks before publishing caregiver profiles.
                  </p>
                </div>
              </div>

              {/* Bottom Action Arrow */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Bottom Accent Bar */}
              <div className="absolute bottom-0 left-6 right-6 h-1 bg-blue-600 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Feature 2 */}
            <div className="group relative flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
              {/* Background Watermark Icon SVG */}
              <div className="absolute top-4 right-4 text-blue-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <Calendar className="h-20 w-20 stroke-[1.2]" />
              </div>

              <div className="space-y-5 relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                  <Calendar className="h-7 w-7" />
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    Easy Booking
                  </h3>

                  {/* Dot-Dash Accent Line */}
                  <div className="flex items-center gap-1 py-1">
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-0.5 w-4 rounded-full bg-blue-600" />
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium pt-1">
                    Select care service types, choose dates/times directly from a calendar, and track booking requests seamlessly.
                  </p>
                </div>
              </div>

              {/* Bottom Action Arrow */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Bottom Accent Bar */}
              <div className="absolute bottom-0 left-6 right-6 h-1 bg-blue-600 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Feature 3 */}
            <div className="group relative flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
              {/* Background Watermark Icon SVG */}
              <div className="absolute top-4 right-4 text-blue-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <MessageSquare className="h-20 w-20 stroke-[1.2]" />
              </div>

              <div className="space-y-5 relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                  <MessageSquare className="h-7 w-7" />
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    Direct Messaging
                  </h3>

                  {/* Dot-Dash Accent Line */}
                  <div className="flex items-center gap-1 py-1">
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-0.5 w-4 rounded-full bg-blue-600" />
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium pt-1">
                    Communicate directly via in-app chat to coordinate care routines, special requirements, and schedule updates.
                  </p>
                </div>
              </div>

              {/* Bottom Action Arrow */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Bottom Accent Bar */}
              <div className="absolute bottom-0 left-6 right-6 h-1 bg-blue-600 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Feature 4 */}
            <div className="group relative flex flex-col justify-between rounded-[28px] border border-slate-100 bg-white p-7 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
              {/* Background Watermark Icon SVG */}
              <div className="absolute top-4 right-4 text-blue-500/10 pointer-events-none group-hover:scale-110 transition-transform duration-500">
                <MapPin className="h-20 w-20 stroke-[1.2]" />
              </div>

              <div className="space-y-5 relative z-10">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform duration-300">
                  <MapPin className="h-7 w-7" />
                </div>

                <div className="space-y-1 text-left">
                  <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    Location-Based Search
                  </h3>

                  {/* Dot-Dash Accent Line */}
                  <div className="flex items-center gap-1 py-1">
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-1 w-1 rounded-full bg-blue-400" />
                    <span className="h-0.5 w-4 rounded-full bg-blue-600" />
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed font-medium pt-1">
                    Use our dynamic search interface to discover caregivers available in your neighborhood or nearby city.
                  </p>
                </div>
              </div>

              {/* Bottom Action Arrow */}
              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                  <ArrowRight className="h-4.5 w-4.5" />
                </div>
              </div>

              {/* Bottom Accent Bar */}
              <div className="absolute bottom-0 left-6 right-6 h-1 bg-blue-600 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="relative py-20 sm:py-28 bg-gradient-to-b from-blue-50/30 via-white to-slate-50 overflow-hidden">
        {/* Soft Background Wave Graphics */}
        <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-indigo-100/30 blur-3xl opacity-50" />

        {/* Decorative Dot Grid Matrices */}
        <div className="absolute left-6 top-1/3 grid grid-cols-5 gap-2.5 opacity-25 hidden xl:grid">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          ))}
        </div>
        <div className="absolute right-6 top-1/3 grid grid-cols-5 gap-2.5 opacity-25 hidden xl:grid">
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-600" />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center space-y-3 max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600 border border-blue-100/80 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Simple. Fast. Reliable.</span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              How <span className="text-blue-600">Domic Care</span> Works
            </h2>

            {/* Heart Divider Line */}
            <div className="flex items-center justify-center gap-2 pt-1 pb-1">
              <span className="h-[1.5px] w-8 bg-blue-200 rounded-full" />
              <Heart className="h-3.5 w-3.5 text-blue-500 fill-blue-500" />
              <span className="h-[1.5px] w-8 bg-blue-200 rounded-full" />
            </div>

            <p className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed">
              Three simple steps to coordinate quality care for your family.
            </p>
          </div>

          <div className="relative max-w-6xl mx-auto pt-6">
            {/* Desktop Connecting Dotted Line with Nodes */}
            <div className="hidden lg:block absolute top-[44%] left-[18%] right-[18%] h-[2px] border-t-2 border-dashed border-blue-400/60 -z-0" />
            <div className="hidden lg:block absolute top-[44%] left-[33%] -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md z-10" />
            <div className="hidden lg:block absolute top-[44%] right-[33%] -translate-y-1/2 h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white shadow-md z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative">
              {/* Step 1 */}
              <div className="group relative flex flex-col items-center text-center rounded-[28px] border border-slate-100 bg-white p-8 pt-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 z-10 overflow-hidden">
                {/* Step Number Badge */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-white z-20">
                  1
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 text-blue-600 mb-6 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <UserPlus className="h-9 w-9 text-blue-600" />
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  Create Account
                </h3>

                <div className="h-0.5 w-6 bg-blue-600 rounded-full my-2.5 mx-auto" />

                <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xs pt-1">
                  Sign up as a family member. Define your location and specific assistance requirements.
                </p>

                {/* Bottom Accent Bar */}
                <div className="absolute bottom-0 left-8 right-8 h-1 bg-blue-600 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Step 2 */}
              <div className="group relative flex flex-col items-center text-center rounded-[28px] border border-slate-100 bg-white p-8 pt-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 z-10 overflow-hidden">
                {/* Step Number Badge */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-white z-20">
                  2
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 text-blue-600 mb-6 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <div className="relative">
                    <Search className="h-9 w-9 text-blue-600" />
                    <Heart className="h-3.5 w-3.5 text-blue-600 fill-blue-600 absolute -top-1 -right-1" />
                  </div>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  Find Caregivers
                </h3>

                <div className="h-0.5 w-6 bg-blue-600 rounded-full my-2.5 mx-auto" />

                <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xs pt-1">
                  Browse caregivers in your neighborhood. Filter by care services, ratings, availability, and hourly rates.
                </p>

                {/* Bottom Accent Bar */}
                <div className="absolute bottom-0 left-8 right-8 h-1 bg-blue-600 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Step 3 */}
              <div className="group relative flex flex-col items-center text-center rounded-[28px] border border-slate-100 bg-white p-8 pt-10 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 z-10 overflow-hidden">
                {/* Step Number Badge */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shadow-lg shadow-blue-500/30 border-4 border-white z-20">
                  3
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-50/80 text-blue-600 mb-6 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                  <CalendarCheck className="h-9 w-9 text-blue-600" />
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  Book and Coordinate
                </h3>

                <div className="h-0.5 w-6 bg-blue-600 rounded-full my-2.5 mx-auto" />

                <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-xs pt-1">
                  Send booking requests. Chat directly, coordinate schedules, and review care sessions once completed.
                </p>

                {/* Bottom Accent Bar */}
                <div className="absolute bottom-0 left-8 right-8 h-1 bg-blue-600 rounded-t-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Caregiver CTA Banner */}
      <section id="for-caregivers" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-16 sm:px-12 sm:py-20 lg:px-16 shadow-2xl">
          {/* Background visuals */}
          <div className="absolute top-0 right-0 -z-10 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
          
          <div className="max-w-2xl space-y-6 text-center sm:text-left">
            <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Are you a professional caregiver?
            </h2>
            <p className="text-base text-slate-300 font-medium">
              Join Domic Care to offer nursing, companionship, or daily care services. Set your hourly rates, upload verification documents, and connect with local families.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center sm:justify-start">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-7 py-4 text-sm font-bold text-slate-950 hover:bg-slate-100 shadow-xl transition-all cursor-pointer"
              >
                Join as Caregiver
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <img
                  src="/domic_care_logo_without_text.jpeg"
                  alt="Domic Care Logo"
                  className="h-8 w-8 rounded-lg object-cover shadow-sm bg-slate-800 p-0.5"
                />
                <span className="font-heading text-lg font-bold text-white">Domic Care</span>
              </div>
              <p className="text-sm max-w-sm text-slate-400">
                Helping families connect with trusted local caregivers for dignified, independent, and high-quality care.
              </p>
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-white block mb-4">Platform</span>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="/get-started" className="hover:text-white transition-colors">Find Caregivers</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/get-started" className="hover:text-white transition-colors">Join as Caregiver</Link></li>
              </ul>
            </div>
            <div>
              <span className="font-heading text-sm font-bold text-white block mb-4">Support</span>
              <ul className="space-y-2.5 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs gap-4">
            <p>&copy; 2026 Domic Care Marketplace. All rights reserved.</p>
            <p>Designed for accessible, high-quality family care services.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
