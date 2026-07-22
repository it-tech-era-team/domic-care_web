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
  CalendarDays
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
  // yh check krega ke completed wala button kb enable krna ha 
const canCompleteBooking = (endDate: string) => {
  if (!endDate) return false;

  return new Date() >= new Date(endDate);
};
  // Find caregiver profile info
  const profile = caregivers.find((cg) => cg.id === currentUser.id);

  const caregiverBookings = bookings.filter((b) => b.caregiverId === currentUser.id);

  // Status lists
  const pendingRequests = caregiverBookings.filter((b) => b.status === 'pending');
  const activeJobs = caregiverBookings.filter((b) => b.status === 'accepted');
  const completedJobs = caregiverBookings.filter((b) => b.status === 'completed');

  // Stats
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
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">

        {/* Page Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Welcome back, {currentUser?.fullName || 'Caregiver'}
            </h1>
            <p className="mt-2 text-slate-500">
              Review job requests, track appointments, manage client communications, and monitor earnings.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
           <Link
              href="/caregiver/calendar"
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-2xl bg-gradient-to-r from-[#16a34a] via-[#15803d] to-[#111827] hover:from-[#15803d] hover:via-[#166534] hover:to-black text-white px-5 py-3 text-sm font-bold shadow-lg shadow-green-600/25 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
            >
              <CalendarDays className="h-4 w-4 text-white"/>
              <span>My Schedule</span>
            </Link>

            <Link
              href="/caregiver/messages"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 text-sm font-bold shadow-lg transition hover:shadow-xl cursor-pointer"
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
              <div className="rounded-3xl bg-gradient-to-r from-amber-500 to-orange-600 p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <AlertTriangle size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Profile Verification Pending</h3>
                    <p className="text-xs text-amber-100 mt-1 max-w-xl">
                      Your profile has been submitted and is currently being audited by DomicCare Admins. You will go live in search results once approved.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider self-start sm:self-auto">
                  Audit Underway
                </span>
              </div>
            )}

            {profile.approvalStatus === 'rejected' && (
              <div className="rounded-3xl bg-gradient-to-r from-red-500 to-rose-600 p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldAlert size={24} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Verification Audits Unsuccessful</h3>
                    <p className="text-xs text-red-100 mt-1 max-w-xl">
                      Your verification documents (CNIC / Medical degrees) were rejected. Please update valid credentials in My Profile.
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
              <div className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-7 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <ShieldCheck size={28} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg">Verification Complete & Active</h3>
                    <p className="text-xs text-emerald-100 mt-1 max-w-xl">
                      Your account is fully approved! Families can discover your profile, schedule calendar blocks, and request care sessions.
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider self-start sm:self-auto">
                  Active Status
                </span>
              </div>
            )}
          </>
        )}

        {/* Statistics Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          
          {/* Estimated Earnings */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-7 text-white shadow-xl transition hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <DollarSign size={34} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                Earnings
              </span>
            </div>
            <h2 className="mt-8 text-5xl font-black">${estimatedEarnings}</h2>
            <p className="mt-2 text-emerald-100 font-semibold">Completed Sessions Total</p>
          </div>

          {/* Pending Job Requests */}
          <div className="rounded-3xl border border-orange-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <AlertTriangle className="text-orange-600" size={34} />
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">
                Pending
              </span>
            </div>

            <h2 className="mt-8 text-5xl font-black text-orange-500">
              {pendingRequests.length}
            </h2>

            <p className="mt-2 text-slate-500 font-semibold">
              Job Requests Awaiting
            </p>
          </div>

          {/* Active Jobs */}
          <div className="rounded-3xl border border-blue-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <Calendar className="text-blue-600" size={34} />
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                Active
              </span>
            </div>
            <h2 className="mt-8 text-5xl font-black text-blue-600">{activeJobs.length}</h2>
            <p className="mt-2 text-slate-500 font-semibold">Scheduled Appointments</p>
          </div>

          {/* Overall Rating */}
          <div className="rounded-3xl border border-amber-300 bg-amber-50 p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <Star className="text-amber-500 fill-amber-400" size={34} />
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                Rating
              </span>
            </div>

            <h2 className="mt-8 text-5xl font-black text-amber-500">
              {profile?.rating ? `${profile.rating}★` : "5.0★"}
            </h2>

            <p className="mt-2 text-slate-500 font-semibold">
              {completedJobs.length} Completed Jobs
            </p>
          </div>

        </div>

        {/* Main Section: Pending Requests & Active Care Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Pending Job Requests */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Pending Job Requests
                </h2>
                <span className="rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-700">
                  {pendingRequests.length} Request{pendingRequests.length === 1 ? '' : 's'}
                </span>
              </div>

              {pendingRequests.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <CheckCircle2 className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No pending requests right now</p>
                  <p className="text-xs text-slate-400">New care appointment requests from families will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md">
                            {req.userFullName.split(' ').map((n) => n[0]).join('').toUpperCase()}
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">
                              Request from {req.userFullName}
                            </span>
                            <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 mt-1">
                              {req.serviceName} Care
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 font-semibold space-y-1 sm:text-right bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <div className="flex items-center gap-1 sm:justify-end text-slate-800 font-bold">
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
                        <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200/60 leading-relaxed font-normal">
                          &ldquo;{req.notes}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-200/60">
                        <button
                          onClick={() => updateBookingStatus(req.id, 'rejected')}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2.5 text-xs font-bold text-slate-600 transition cursor-pointer"
                        >
                          Decline Request
                        </button>
                        <button
                          onClick={() => updateBookingStatus(req.id, 'accepted')}
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-blue-500/15 transition cursor-pointer flex items-center gap-1.5"
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
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Active Care Schedule
                </h2>
                <span className="rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-700">
                  {activeJobs.length} Active
                </span>
              </div>

              {activeJobs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No active jobs scheduled today</p>
                  <p className="text-xs text-slate-400">Accepted appointments will show up here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-5 rounded-2xl border border-blue-100 bg-blue-50/30 space-y-3 shadow-sm"
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
                        <span className="rounded-full bg-green-100 text-green-700 px-3 py-1 text-[10px] font-bold uppercase">
                          Confirmed
                        </span>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-slate-200/60 text-xs space-y-1 font-semibold text-slate-600">
                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
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
                          className="flex-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-xs font-bold shadow-sm transition cursor-pointer flex items-center justify-center gap-1.5"
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
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                : "bg-slate-300 text-slate-500 cursor-not-allowed"
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
