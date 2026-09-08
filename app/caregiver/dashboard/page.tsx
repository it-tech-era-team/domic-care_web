'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCareConnect, Booking } from '@/context/useCareConnect';
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  Star,
  AlertTriangle,
  Clock,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  User,
  CalendarDays,
  TrendingUp
} from 'lucide-react';

export default function CaregiverDashboard() {
  const router = useRouter();
  const { currentUser, bookings, caregivers, updateBookingStatus, createConversation } = useCareConnect();

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-bold text-slate-500">Loading your caregiver portal...</p>
      </div>
    );
  }

  const canCompleteBooking = (endDate: string) => {
    if (!endDate) return false;
    return new Date() >= new Date(endDate);
  };

  const profile = caregivers.find((cg) => cg.id === currentUser.id);
  const caregiverBookings = bookings.filter((b) => b.caregiverId === currentUser.id);

  const pendingRequests = caregiverBookings.filter((b) => b.status === 'pending');
  const activeJobs = caregiverBookings.filter((b) => b.status === 'accepted');
  const completedJobs = caregiverBookings.filter((b) => b.status === 'completed');

  const estimatedEarnings = useMemo(() => {
    const rate = profile?.hourlyRate || 20;
    return completedJobs.reduce((sum, job) => {
      const start = new Date(job.startDate).getTime();
      const end = new Date(job.endDate).getTime();
      const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
      return sum + hours * rate;
    }, 0);
  }, [completedJobs, profile]);

  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">

        {/* Hero Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-blue-100/40 border border-blue-100/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="max-w-xl space-y-3 z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Welcome back, {currentUser?.fullName || 'Caregiver'} 👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Review job requests, track appointments, manage client communications, and monitor earnings.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <Link
                href="/caregiver/calendar"
                className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 hover:bg-blue-50 text-slate-800 px-5 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                <CalendarDays className="h-4 w-4 text-blue-600" />
                <span>My Schedule</span>
              </Link>
              <Link
                href="/caregiver/messages"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 text-white" />
                <span>Messages</span>
              </Link>
            </div>
          </div>

          {/* Hero Background Image Cutout */}
          <div className="relative w-full md:w-80 h-44 sm:h-52 shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-sky-300/40 rounded-3xl transform rotate-2 scale-95" />
            <img
              src="/hero/caregiver-hero.jpg"
              alt="Caregiver Sessions"
              className="w-full h-full object-cover rounded-3xl border-2 border-white shadow-xl relative z-10"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        </div>

        {/* Verification Status Banner */}
        {profile && (
          <>
            {profile.approvalStatus === 'pending' && (
              <div className="rounded-3xl bg-amber-50 border border-amber-200 p-6 text-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200 text-amber-600">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-amber-950">Profile Verification Pending</h3>
                    <p className="text-xs text-amber-800 mt-1 max-w-xl">
                      Your profile has been submitted and is currently being audited by DomicCare Admins. You will go live in search results once approved.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 text-amber-800 border border-amber-300 px-4 py-1.5 text-xs font-black uppercase tracking-wider self-start sm:self-auto">
                  Audit Underway
                </span>
              </div>
            )}

            {profile.approvalStatus === 'rejected' && (
              <div className="rounded-3xl bg-rose-50 border border-rose-200 p-6 text-rose-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0 border border-rose-200 text-rose-600">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-rose-950">Verification Audits Unsuccessful</h3>
                    <p className="text-xs text-rose-700 mt-1 max-w-xl">
                      Your verification documents were rejected. Please update valid credentials in My Profile.
                    </p>
                  </div>
                </div>
                <Link
                  href="/caregiver/profile"
                  className="rounded-xl bg-rose-600 text-white px-4 py-2 text-xs font-bold hover:bg-rose-700 transition cursor-pointer self-start sm:self-auto"
                >
                  Update Profile
                </Link>
              </div>
            )}

            {profile.approvalStatus === 'approved' && (
              <div className="rounded-3xl bg-blue-50 border border-blue-200 p-6 text-slate-900 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200 text-blue-600">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-blue-950">Verification Complete & Active</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-xl">
                      Your account is fully approved! Families can discover your profile, schedule calendar blocks, and request care sessions.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-blue-100 text-blue-800 border border-blue-300 px-4 py-1.5 text-xs font-black uppercase tracking-wider self-start sm:self-auto">
                  Active Status
                </span>
              </div>
            )}
          </>
        )}

        {/* 4 Decent Executive Metric Cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          
          {/* Estimated Earnings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-900 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shadow-2xs">
                <DollarSign size={24} />
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">Earnings</span>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">${estimatedEarnings}</h2>
              <p className="mt-1 text-xs text-slate-500 font-semibold">Completed Sessions Total</p>
            </div>
          </div>

          {/* Pending Job Requests */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-900 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold shadow-2xs">
                <AlertTriangle size={24} />
              </div>
              <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">Pending</span>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{pendingRequests.length}</h2>
              <p className="mt-1 text-xs text-slate-500 font-semibold">Job Requests Awaiting</p>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-900 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shadow-2xs">
                <Calendar size={24} />
              </div>
              <span className="rounded-full bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">Active</span>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{activeJobs.length}</h2>
              <p className="mt-1 text-xs text-slate-500 font-semibold">Scheduled Appointments</p>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-900 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold shadow-2xs">
                <Star size={24} className="fill-indigo-600" />
              </div>
              <span className="rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">Rating</span>
            </div>
            <div className="mt-4">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{profile?.rating ? `${profile.rating}★` : "5.0★"}</h2>
              <p className="mt-1 text-xs text-slate-500 font-semibold">{completedJobs.length} Completed Jobs</p>
            </div>
          </div>

        </div>

        {/* Main Section: Pending Requests & Active Care Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Pending Job Requests */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Pending Job Requests
                </h2>
                <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3.5 py-1 text-xs font-bold">
                  {pendingRequests.length} Request{pendingRequests.length === 1 ? '' : 's'}
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <CheckCircle2 className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No pending requests right now</p>
                  <p className="text-xs text-slate-500">New care appointment requests from families will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={req.userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(req.userFullName || 'Client')}`}
                            alt={req.userFullName}
                            className="h-11 w-11 rounded-2xl object-cover border-2 border-slate-200 shadow-xs bg-slate-100 shrink-0"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">
                              Request from {req.userFullName}
                            </span>
                            <span className="inline-flex rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold mt-1">
                              {req.serviceName} Care
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 font-semibold space-y-1 sm:text-right bg-white p-2.5 rounded-xl border border-slate-200">
                          <div className="flex items-center gap-1 sm:justify-end text-slate-900 font-bold">
                            <Calendar size={13} className="text-blue-600" />
                            <span>{formatDate(req.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:justify-end text-slate-500">
                            <Clock size={13} className="text-slate-400" />
                            <span>{formatTime(req.startDate)} - {formatTime(req.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      {req.notes && (
                        <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200 leading-relaxed font-normal">
                          &ldquo;{req.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => updateBookingStatus(req.id, 'rejected')}
                          className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 px-4 py-2.5 text-xs font-bold text-rose-700 hover:text-white transition cursor-pointer"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => updateBookingStatus(req.id, 'accepted')}
                          className="rounded-xl nav-pill-active text-white px-5 py-2.5 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Check size={15} />
                          <span>Accept Request</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Active Care Schedule */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Active Care Schedule
                </h2>
                <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1 text-xs font-bold">
                  {activeJobs.length} Active
                </span>
              </div>

              {activeJobs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <Calendar className="h-10 w-10 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">No active jobs scheduled today</p>
                  <p className="text-xs text-slate-500">Accepted appointments will show up here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-slate-900 text-sm block">
                            {job.userFullName}
                          </span>
                          <span className="text-xs text-blue-600 font-bold block mt-0.5">
                            {job.serviceName} Session
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-[10px] font-bold uppercase">
                          Confirmed
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1 font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5 text-slate-900 font-bold">
                          <Calendar size={13} className="text-blue-600" />
                          <span>{formatDate(job.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Clock size={13} className="text-slate-400" />
                          <span>{formatTime(job.startDate)} - {formatTime(job.endDate)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={async () => {
                            const convId = await createConversation(job.userId);
                            if (convId) {
                              router.push(`/caregiver/messages?conv=${convId}`);
                            } else {
                              router.push('/caregiver/messages');
                            }
                          }}
                          className="flex-1 rounded-xl nav-pill-active py-2.5 text-xs font-bold text-white shadow-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare size={14} />
                          <span>Chat with Client</span>
                        </button>

                        <button
                          onClick={() => updateBookingStatus(job.id, "completed")}
                          disabled={!canCompleteBooking(job.endDate)}
                          className={`rounded-xl px-4 py-2.5 text-xs font-bold shadow-xs transition
                            ${
                              canCompleteBooking(job.endDate)
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                            }`}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
