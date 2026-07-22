'use client';

import React, { useState, use, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCareConnect, CaregiverProfile } from '@/context/useCareConnect';
import {
  Star, ShieldCheck, Heart, ArrowLeft, Mail,
  Calendar, Clock, DollarSign, FileText, CheckCircle2
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaregiverProfileDetail({ params }: PageProps) {
  const router = useRouter();
  const { id } = use(params); // Next.js 16 async params resolution
  const { caregivers, requestBooking, createConversation } = useCareConnect();

  // Local state for fetched caregiver details
  const [caregiver, setCaregiver] = useState<CaregiverProfile | null>(() => {
    return caregivers.find((cg) => cg.id === id) || null;
  });
  const [caregiverReviews, setCaregiverReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'about' | 'availability' | 'reviews'>('about');

  // Booking Form State
  const [bookingDate, setBookingDate] = useState('');
  const [selectedService, setSelectedService] = useState('');
const [fromTime, setFromTime] = useState("");
const [toTime, setToTime] = useState("");
const [timeError, setTimeError] = useState("");
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  
  // Fetch details from backend
  useEffect(() => {
    let active = true;
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/caregivers/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch caregiver details");
        }
        const data = await res.json();
        if (active) {
          if (data.caregiver) {
            setCaregiver(data.caregiver);
            setCaregiverReviews(data.reviews || []);
          } else {
            setHasError(true);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error(err);
        if (active) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    }

    fetchDetails();
    return () => {
      active = false;
    };
  }, [id]);

  const handleMessageCaregiver = async () => {
    if (!caregiver) return;
    const convId = await createConversation(caregiver.id);
    if (convId) {
      router.push('/user/messages');
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];

if (bookingDate === today) {
  const now = new Date();

  const [hours, minutes] = fromTime.split(":").map(Number);

  const selectedTime = new Date();
  selectedTime.setHours(hours, minutes, 0, 0);

  if (selectedTime <= now) {
    setTimeError("Selected time has already passed. Please choose a future time.");
    return;
  }
}

setTimeError("");
    if (!bookingDate || !selectedService ||!fromTime || !toTime  || !caregiver) return;

    setIsBookingSubmitting(true);
    await requestBooking(
      caregiver.id,
      selectedService,
      bookingDate,
     `${fromTime} - ${toTime}`,
      bookingNotes
    );

    setIsBookingSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      router.push('/user/bookings');
    }, 1800);
  };

  if (isLoading && !caregiver) {
    return (
      <div className="flex flex-col h-[50vh] items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500">Retrieving caregiver profile...</p>
      </div>
    );
  }

  if (hasError || !caregiver) {
    return (
      <div className="text-center py-12 space-y-4 max-w-md mx-auto">
        <h2 className="text-xl font-extrabold text-slate-800">Caregiver Profile Not Found</h2>
        <p className="text-xs text-slate-500">The profile you are trying to view is unavailable or pending approval.</p>
        <Link href="/user/search-caregivers" className="inline-block rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white">
          Back to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl w-full mx-auto animate-fade-in">
      
      {/* Back Button */}
      <Link
        href="/user/search-caregivers"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 border border-slate-200 bg-white rounded-lg px-3 py-1.5 shadow-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to search grid</span>
      </Link>

      {/* Header Profile Summary */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={caregiver.avatarUrl}
            alt={caregiver.fullName}
            className="h-24 w-24 rounded-2xl object-cover border-2 border-slate-100 shadow-sm bg-slate-50"
          />
          <div className="text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="font-heading font-extrabold text-xl sm:text-2xl text-slate-900 leading-tight">
                {caregiver.fullName}
              </h1>
              {caregiver.approvalStatus === 'approved' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 mx-auto sm:mx-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Verified Caregiver</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 font-semibold">{caregiver.address}, {caregiver.city}</p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-medium text-slate-600">
              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                <span className="font-bold text-amber-700">{caregiver.rating}</span>
                <span className="text-slate-400">({caregiver.reviewsCount} reviews)</span>
              </div>
              <div>•</div>
              <div className="text-slate-700">
                Hourly rate: <strong className="text-slate-900">${caregiver.hourlyRate}/hr</strong>
              </div>
              <div>•</div>
              <div>
                Exp: <strong className="text-slate-900">{caregiver.experienceYears} Years</strong>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleMessageCaregiver}
          className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm flex items-center justify-center gap-1.5 self-center md:self-start w-full sm:w-auto cursor-pointer"
        >
          <Mail className="h-4 w-4" />
          <span>Message {caregiver.fullName.split(' ')[0]}</span>
        </button>
      </div>

      {/* Main Details and Booking Booking */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        
        {/* Left Side: Detail Tabs */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6 min-h-[400px]">
          {/* Tabs header */}
          <div className="flex border-b border-slate-100">
            {(['about', 'availability', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  pb-3 px-4 text-xs font-bold capitalize transition-all border-b-2 -mb-[2px] cursor-pointer
                  ${activeTab === tab
                    ? 'border-blue-600 text-blue-700'
                    : 'border-transparent text-slate-400 hover:text-slate-600'}
                `}
              >
                {tab === 'about' ? 'Bio & Services' : tab}
              </button>
            ))}
          </div>

          {/* About Tab */}
          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-heading font-extrabold text-sm text-slate-800">Professional Bio</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  {caregiver.bio || 'No bio details provided.'}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="font-heading font-extrabold text-sm text-slate-800">Provided Services</h3>
                <div className="flex flex-wrap gap-2">
                  {caregiver.services.length === 0 ? (
                    <span className="text-xs text-slate-400">No services specified yet.</span>
                  ) : (
                    caregiver.services.map((s: string) => (
                      <span key={s} className="rounded-xl bg-blue-50 border border-blue-100 px-3.5 py-1.5 text-xs font-bold text-blue-700">
                        {s}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-4 text-xs">
                <div>
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Gender</span>
                  <span className="block font-semibold text-slate-700 mt-0.5">{caregiver.gender}</span>
                </div>
                <div>
                  <span className="block text-slate-400 font-bold uppercase tracking-wider text-[10px]">Date of Birth</span>
                  <span className="block font-semibold text-slate-700 mt-0.5">{caregiver.dob}</span>
                </div>
              </div>
            </div>
          )}

          {/* Availability Schedule */}
          {activeTab === 'availability' && (
            <div className="space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-slate-800">Standard Weekly Schedule</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Standard days and hours when caregiver is available for scheduling bookings.
              </p>
              <div className="divide-y divide-slate-50">
                {Object.entries(caregiver.availability).map(([day, slotAny]) => {
                  const slot = slotAny as { start: string; end: string; isAvailable: boolean };
                  return (
                    <div key={day} className="py-2.5 flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700">{day}</span>
                      {slot.isAvailable ? (
                        <span className="font-semibold text-blue-600">{slot.start} - {slot.end}</span>
                      ) : (
                        <span className="text-slate-400 italic">Not Available</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h3 className="font-heading font-extrabold text-sm text-slate-800">Client Feedback ({caregiverReviews.length})</h3>

              {caregiverReviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-4">No reviews recorded yet for this caregiver.</p>
              ) : (
                <div className="space-y-4 divide-y divide-slate-100">
                  {caregiverReviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{rev.userFullName}</span>
                        <span className="text-slate-400">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100 w-fit">
                        <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                        <span className="text-[10px] font-bold text-amber-700">{rev.rating} / 5</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Booking request card */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-slate-900 border-b border-slate-50 pb-2">
            Schedule Care Request
          </h3>

          {isSuccess ? (
            <div className="py-8 text-center space-y-3 animate-fade-in">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-50 text-green-500 flex items-center justify-center border border-green-100">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">Request Submitted!</h4>
              <p className="text-xs text-slate-400">Your scheduling request has been forwarded to {caregiver.fullName.split(' ')[0]}. Redirecting...</p>
            </div>
          ) : (
            <form onSubmit={handleBookingSubmit} className="space-y-4">
              
              {/* Select Service */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Select Service</label>
                <select
                  required
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="">-- Choose Care Service --</option>
                  {caregiver.services.map((s: string) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Select Date */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Select Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Time Slots */}
             {/* Time Interval */}
<div className="space-y-1">
  <label className="block text-xs font-bold text-slate-700">
    Time Interval
  </label>

  <div className="grid grid-cols-2 gap-2">
    <input
      type="time"
      required
      value={fromTime}
      onChange={(e) => {
        setFromTime(e.target.value);
        setTimeError("");
      }}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none"
    />

    <input
      type="time"
      required
      value={toTime}
      min={fromTime}
      onChange={(e) => setToTime(e.target.value)}
      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none"
    />
  </div>

  {timeError && (
    <p className="text-xs text-red-600 font-medium mt-1">
      {timeError}
    </p>
  )}
</div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Client Health Notes (Optional)</label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="e.g. Needs post-stroke physical exercises support and reminders for medication schedule."
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
              </div>

              {/* Cost Summary Banner */}
              <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-3.5 flex justify-between items-center text-xs">
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">Rate estimate</span>
                  <span className="text-slate-600 font-semibold">${caregiver.hourlyRate}/hr</span>
                </div>
                <div className="text-right">
                  <span className="block text-slate-400 font-bold uppercase text-[9px]">Platform fee</span>
                  <span className="text-green-600 font-bold">Included</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isBookingSubmitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isBookingSubmitting ? "Submitting Care Request..." : "Submit Care Request"}</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
