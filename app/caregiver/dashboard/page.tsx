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
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 bg-[#070814]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-sm font-bold text-slate-400">Loading your caregiver portal...</p>
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
    <div className="min-h-screen bg-[#070814] text-white pb-12 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Welcome back, {currentUser?.fullName || 'Caregiver'} 👋
            </h1>
            <p className="mt-2 text-slate-400">
              Review job requests, track appointments, manage client communications, and monitor earnings.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <Link
              href="/caregiver/calendar"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl glass-panel hover:bg-white/10 text-white px-5 py-3 text-sm font-bold border border-white/10 transition-all cursor-pointer"
            >
              <CalendarDays className="h-4 w-4 text-cyan-400" />
              <span>My Schedule</span>
            </Link>

            <Link
              href="/caregiver/messages"
              className="inline-flex items-center gap-2 rounded-2xl nav-pill-active text-white px-5 py-3 text-sm font-bold shadow-lg shadow-purple-500/25 transition cursor-pointer"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Messages</span>
            </Link>
          </div>
        </div>

        {/* Verification Status Banner */}
        {profile && (
          <>
            {profile.approvalStatus === 'pending' && (
              <div className="rounded-3xl stat-card-orange p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Profile Verification Pending</h3>
                    <p className="text-xs text-amber-100 mt-1 max-w-xl">
                      Your profile has been submitted and is currently being audited by DomicCare Admins. You will go live in search results once approved.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider self-start sm:self-auto border border-white/30">
                  Audit Underway
                </span>
              </div>
            )}

            {profile.approvalStatus === 'rejected' && (
              <div className="rounded-3xl bg-gradient-to-r from-red-600 to-rose-700 p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Verification Audits Unsuccessful</h3>
                    <p className="text-xs text-red-100 mt-1 max-w-xl">
                      Your verification documents were rejected. Please update valid credentials in My Profile.
                    </p>
                  </div>
                </div>
                <Link
                  href="/caregiver/profile"
                  className="rounded-xl bg-white text-red-700 px-4 py-2 text-xs font-bold hover:bg-red-50 transition cursor-pointer self-start sm:self-auto"
                >
                  Update Profile
                </Link>
              </div>
            )}

            {profile.approvalStatus === 'approved' && (
              <div className="rounded-3xl stat-card-teal p-6 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 border border-white/30">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Verification Complete & Active</h3>
                    <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                      Your account is fully approved! Families can discover your profile, schedule calendar blocks, and request care sessions.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider self-start sm:self-auto border border-white/30">
                  Active Status
                </span>
              </div>
            )}
          </>
        )}

        {/* 4 Signature Vibrant Metric Cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          
          {/* Estimated Earnings */}
          <div className="stat-card-teal rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <DollarSign size={32} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Earnings</span>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-black">${estimatedEarnings}</h2>
              <p className="mt-1 text-xs text-teal-100 font-semibold">Completed Sessions Total</p>
            </div>
          </div>

          {/* Pending Job Requests */}
          <div className="stat-card-orange rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <AlertTriangle size={32} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Pending</span>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-black">{pendingRequests.length}</h2>
              <p className="mt-1 text-xs text-amber-100 font-semibold">Job Requests Awaiting</p>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="stat-card-blue rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <Calendar size={32} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Active</span>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-black">{activeJobs.length}</h2>
              <p className="mt-1 text-xs text-blue-100 font-semibold">Scheduled Appointments</p>
            </div>
          </div>

          {/* Overall Rating */}
          <div className="stat-card-purple rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <Star size={32} className="fill-white" />
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Rating</span>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-black">{profile?.rating ? `${profile.rating}★` : "5.0★"}</h2>
              <p className="mt-1 text-xs text-pink-100 font-semibold">{completedJobs.length} Completed Jobs</p>
            </div>
          </div>

        </div>

        {/* Main Section: Pending Requests & Active Care Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Pending Job Requests */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-black text-white">
                  Pending Job Requests
                </h2>
                <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3.5 py-1 text-xs font-bold">
                  {pendingRequests.length} Request{pendingRequests.length === 1 ? '' : 's'}
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-white/10 rounded-2xl">
                  <CheckCircle2 className="h-10 w-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">No pending requests right now</p>
                  <p className="text-xs text-slate-500">New care appointment requests from families will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl glass-card border border-white/10 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 text-white font-bold flex items-center justify-center shadow-md">
                            {req.userFullName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-white text-sm block">
                              Request from {req.userFullName}
                            </span>
                            <span className="inline-flex rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/20 px-2.5 py-0.5 text-[10px] font-bold mt-1">
                              {req.serviceName} Care
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 font-semibold space-y-1 sm:text-right bg-white/5 p-2.5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-1 sm:justify-end text-white font-bold">
                            <Calendar size={13} className="text-cyan-400" />
                            <span>{formatDate(req.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:justify-end text-slate-400">
                            <Clock size={13} className="text-slate-400" />
                            <span>{formatTime(req.startDate)} - {formatTime(req.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      {req.notes && (
                        <p className="text-xs text-slate-300 italic bg-white/5 p-3 rounded-xl border border-white/5 leading-relaxed font-normal">
                          &ldquo;{req.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                        <button
                          onClick={() => updateBookingStatus(req.id, 'rejected')}
                          className="rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500 px-4 py-2.5 text-xs font-bold text-red-300 hover:text-white transition cursor-pointer"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => updateBookingStatus(req.id, 'accepted')}
                          className="rounded-xl nav-pill-active text-white px-5 py-2.5 text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
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
            <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-black text-white">
                  Active Care Schedule
                </h2>
                <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 px-3.5 py-1 text-xs font-bold">
                  {activeJobs.length} Active
                </span>
              </div>

              {activeJobs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-white/10 rounded-2xl">
                  <Calendar className="h-10 w-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">No active jobs scheduled today</p>
                  <p className="text-xs text-slate-500">Accepted appointments will show up here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl glass-card border border-white/10 space-y-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-white text-sm block">
                            {job.userFullName}
                          </span>
                          <span className="text-xs text-cyan-400 font-bold block mt-0.5">
                            {job.serviceName} Session
                          </span>
                        </div>
                        <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 text-[10px] font-bold uppercase">
                          Confirmed
                        </span>
                      </div>

                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-xs space-y-1 font-semibold text-slate-300">
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <Calendar size={13} className="text-cyan-400" />
                          <span>{formatDate(job.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
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
                          className="flex-1 rounded-xl nav-pill-active py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare size={14} />
                          <span>Chat with Client</span>
                        </button>

                        <button
                          onClick={() => updateBookingStatus(job.id, "completed")}
                          disabled={!canCompleteBooking(job.endDate)}
                          className={`rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition
                            ${
                              canCompleteBooking(job.endDate)
                                ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                                : "bg-white/10 text-slate-500 cursor-not-allowed border border-white/5"
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
