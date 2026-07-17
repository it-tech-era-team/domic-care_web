'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { Shield, Calendar, MessageSquare, MapPin, Heart, ArrowRight, UserCheck, Star } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 lg:pt-24 lg:pb-28">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[400px] w-[400px] rounded-full bg-teal-100/30 blur-3xl" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                <Heart className="h-3.5 w-3.5 fill-blue-700" />
                <span>Trusted Elderly Care Services</span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:leading-tight">
                Find Trusted Care For Your <span className="text-blue-600">Loved Ones</span>
              </h1>
              
              <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed">
                Domic Care links families seeking elderly care with certified, background-checked professional caregivers near you. Manage booking, schedule availability, and message directly in one safe platform.
              </p>

              <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4.5 w-4.5" />
                </Link>
                <Link
                  href="/get-started"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all"
                >
                  <span>Find Caregivers</span>
                </Link>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-6 sm:pt-8 grid grid-cols-3 gap-4 border-t border-slate-200 max-w-md mx-auto lg:mx-0">
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">100%</span>
                  <span className="text-xs text-slate-500">Verified Profiles</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">4.9/5</span>
                  <span className="text-xs text-slate-500">Family Rating</span>
                </div>
                <div>
                  <span className="block text-2xl sm:text-3xl font-extrabold text-slate-900">10k+</span>
                  <span className="text-xs text-slate-500">Hours of Care</span>
                </div>
              </div>
            </div>

            {/* Right Graphic/Illustration */}
            <div className="mt-12 lg:mt-0 lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-[400px] h-[450px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 hover:scale-[1.01] transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=600&auto=format&fit=crop&q=80"
                  alt="Elderly care illustration"
                  className="w-full h-full object-cover"
                />
                
                {/* Embedded Floating Cards */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-100 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-slate-900">John Doe, LPN</span>
                    <span className="block text-[10px] text-slate-500">Approved Nursing Specialist • 1.2km away</span>
                  </div>
                  <div className="ml-auto flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-700">4.8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20 sm:py-28 border-y border-slate-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Designed For Safety, Trust, and Ease of Use
            </h2>
            <p className="text-lg text-slate-600">
              Every features is crafted to ensure elderly users and families can access reliable care with confidence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4 hover:shadow-md hover:border-slate-200 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-200">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Verified Caregivers</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                We verify government IDs, professional medical certificates, and police records before publishing caregiver profiles.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4 hover:shadow-md hover:border-slate-200 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-200">
                <Calendar className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Easy Booking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Select care service types, select specific dates/times directly from a calendar, and track your booking status.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4 hover:shadow-md hover:border-slate-200 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-200">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Safe Communication</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Direct in-app messages to discuss elderly preferences, special diet requirements, or scheduling issues.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 space-y-4 hover:shadow-md hover:border-slate-200 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/10 group-hover:scale-105 transition-transform duration-200">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Location Based Search</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Use our dynamic search interface to filter caregivers available within 10km of your residential address.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How Domic Care Works</h2>
            <p className="text-lg text-slate-600">Three simple steps to coordinate quality care for your parents.</p>
          </div>

          <div className="relative">
            {/* Horizontal line for desktop */}
            <div className="hidden lg:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-slate-200 -z-10" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-center">
              {/* Step 1 */}
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white font-extrabold text-2xl shadow-xl shadow-blue-500/25 border-4 border-white">
                  1
                </div>
                <h3 className="text-xl font-bold text-slate-900">Create Account</h3>
                <p className="text-sm text-slate-600 max-w-xs mx-auto">
                  Sign up as a family member. Define your location and specific assistance requirements.
                </p>
              </div>

              {/* Step 2 */}
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white font-extrabold text-2xl shadow-xl shadow-blue-500/25 border-4 border-white">
                  2
                </div>
                <h3 className="text-xl font-bold text-slate-900">Find Caregivers</h3>
                <p className="text-sm text-slate-600 max-w-xs mx-auto">
                  Browse caregivers in your neighborhood. Filter by medical services, ratings, availability, and rates.
                </p>
              </div>

              {/* Step 3 */}
              <div className="space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-white font-extrabold text-2xl shadow-xl shadow-blue-500/25 border-4 border-white">
                  3
                </div>
                <h3 className="text-xl font-bold text-slate-900">Book and Coordinate</h3>
                <p className="text-sm text-slate-600 max-w-xs mx-auto">
                  Send a booking request. Chat directly, coordinate schedules, and review care once completed.
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
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Are you a professional caregiver?
            </h2>
            <p className="text-lg text-slate-300">
              Join the Domic Care platform to offer nursing, companionship, or daily care services. Set your hourly rates, upload verification documents, and find local jobs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2 justify-center sm:justify-start">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-semibold text-slate-950 hover:bg-slate-100 shadow-lg transition-all"
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
                Helping elderly relatives lead happy, healthy, and independent lives through trusted local caregivers.
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
            <p>Designed for premium accessible elderly care services.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
