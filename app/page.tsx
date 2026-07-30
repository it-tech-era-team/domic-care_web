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
  ChevronRight
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

  // Default fallback services if database has no services yet
  const displayServices =
    servicesList.length > 0
      ? servicesList
      : [
          {
            id: 'default-1',
            name: 'Nursing & Medical Care',
            description: 'Professional registered nurses providing specialized wound care, medication administration, and vitals monitoring.',
          },
          {
            id: 'default-2',
            name: 'Companionship & Social Support',
            description: 'Friendly caregivers offering engaging conversations, daily meal preparation, walks, and emotional wellbeing support.',
          },
          {
            id: 'default-3',
            name: 'Daily Assistance & Hygiene',
            description: 'Respectful personal care including bathing, dressing, mobility assistance, and household management.',
          },
          {
            id: 'default-4',
            name: 'Post-Op & Recovery Care',
            description: 'Dedicated assistance for family members recovering from surgery, illness, or hospital stays.',
          },
        ];

  // Helper icons for service cards
  const serviceIcons = [HeartHandshake, Stethoscope, Activity, Sparkles, Shield, UserCheck];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 lg:pt-24 lg:pb-28">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -z-10 h-[550px] w-[550px] rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[450px] w-[450px] rounded-full bg-teal-100/40 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-extrabold text-blue-700 border border-blue-100 shadow-sm">
                <Heart className="h-4 w-4 fill-blue-600 text-blue-600 animate-pulse" />
                <span>Your Family Care Marketplace</span>
              </div>
              
              <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:leading-tight">
                Find Trusted Care For Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Loved Ones</span>
              </h1>
              
              <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
                Domic Care links families seeking care with certified, background-checked professional caregivers near you. Manage bookings, schedule availability, and communicate directly on one safe platform.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-7 py-4 text-sm font-bold text-white hover:bg-blue-700 shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-7 py-4 text-sm font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
                >
                  <span>Find Caregivers</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 sm:pt-8 grid grid-cols-3 gap-4 border-t border-slate-200/80 max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-slate-900">100%</span>
                  <span className="text-xs font-semibold text-slate-500">Verified Profiles</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-slate-900">4.9/5</span>
                  <span className="text-xs font-semibold text-slate-500">Family Rating</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-black text-slate-900">10k+</span>
                  <span className="text-xs font-semibold text-slate-500">Hours of Care</span>
                </div>
              </div>
            </div>

            {/* Right Graphic/Illustration */}
            <div className="mt-12 lg:mt-0 lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[420px] h-[460px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 hover:scale-[1.01] transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80"
                  alt="Family care illustration"
                  className="w-full h-full object-cover"
                />
                
                {/* Embedded Floating Card */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-100 flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-600 text-white shrink-0 shadow-md shadow-teal-500/20">
                    <UserCheck className="h-5.5 w-5.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="block text-xs font-extrabold text-slate-900 truncate">John Doe, LPN</span>
                    <span className="block text-[10px] text-slate-500 font-semibold truncate">Approved Nursing Specialist • 1.2km away</span>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 shrink-0">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span className="text-[10px] font-extrabold text-amber-700">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Services Section (Cards added by Admin) */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-white via-slate-50/50 to-white border-y border-slate-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100/60 px-3.5 py-1.5 text-xs font-extrabold text-blue-800">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              <span>Tailored Family Care Solutions</span>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Our Available Services
            </h2>
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              Explore specialized care services tailored to your family's unique needs, provided by verified independent caregivers.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            {displayServices.map((service, idx) => {
              const IconComponent = serviceIcons[idx % serviceIcons.length];
              return (
                <div
                  key={service.id || idx}
                  className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-7 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                >
                  {/* Decorative Gradient Top Line */}
                  <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="space-y-5">
                    {/* Icon Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-7 w-7" />
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 border border-emerald-100">
                        Available Locally
                      </span>
                    </div>

                    {/* Title & Description */}
                    <div className="space-y-2">
                      <h3 className="text-xl font-extrabold text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-4">
                        {service.description || 'Custom professional family care service delivered with dedication and safety.'}
                      </p>
                    </div>
                  </div>

                  {/* Card Action Link */}
                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <Link
                      href={`/get-started?service=${encodeURIComponent(service.name)}`}
                      className="flex items-center justify-between text-xs font-extrabold text-blue-600 group-hover:text-blue-700 cursor-pointer"
                    >
                      <span>Find Caregivers</span>
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 sm:py-28 border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">
              Designed For Safety, Trust, and Peace of Mind
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              Every feature is crafted to ensure families can access reliable, dignified care with total confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 space-y-4 hover:shadow-xl hover:border-blue-200 hover:bg-white transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform duration-200">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Verified Caregivers</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                We verify government IDs, professional medical certificates, and background checks before publishing caregiver profiles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 space-y-4 hover:shadow-xl hover:border-blue-200 hover:bg-white transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform duration-200">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Easy Booking</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Select care service types, choose dates/times directly from a calendar, and track booking requests seamlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 space-y-4 hover:shadow-xl hover:border-blue-200 hover:bg-white transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform duration-200">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Direct Messaging</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Communicate directly via in-app chat to coordinate care routines, special requirements, and schedule updates.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border border-slate-200/80 bg-slate-50/60 p-6 space-y-4 hover:shadow-xl hover:border-blue-200 hover:bg-white transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/15 group-hover:scale-105 transition-transform duration-200">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Location-Based Search</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Use our dynamic search interface to discover caregivers available in your neighborhood or nearby city.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">How Domic Care Works</h2>
            <p className="text-lg text-slate-600 font-medium">Three simple steps to coordinate quality care for your family.</p>
          </div>

          <div className="relative">
            {/* Horizontal line for desktop */}
            <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-200 -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-center">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-500/25 border-4 border-white">
                  1
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Create Account</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                  Sign up as a family member. Define your location and specific assistance requirements.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-500/25 border-4 border-white">
                  2
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Find Caregivers</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                  Browse caregivers in your neighborhood. Filter by care services, ratings, availability, and hourly rates.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white font-black text-2xl shadow-xl shadow-blue-500/25 border-4 border-white">
                  3
                </div>
                <h3 className="text-xl font-extrabold text-slate-900">Book and Coordinate</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                  Send booking requests. Chat directly, coordinate schedules, and review care sessions once completed.
                </p>
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
              <span className="font-heading text-lg font-bold text-white">Domic Care</span>
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
