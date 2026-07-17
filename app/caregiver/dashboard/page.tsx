'use client';

import React, { useMemo } from 'react';
import { useCareConnect, Booking } from '@/context/useCareConnect';
import {
  Calendar, DollarSign, CheckCircle2, Star, AlertTriangle,
  Clock, Check, X, ShieldAlert, ArrowRight
} from 'lucide-react';

export default function CaregiverDashboard() {
  const { currentUser, bookings, caregivers, updateBookingStatus } = useCareConnect();

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500">Loading your caregiver dashboard...</p>
      </div>
    );
  }

  // Find caregiver profile info
  const profile = caregivers.find(cg => cg.id === currentUser.id);

  const caregiverBookings = bookings.filter(b => b.caregiverId === currentUser.id);

  // Status lists
  const pendingRequests = caregiverBookings.filter(b => b.status === 'pending');
  const activeJobs = caregiverBookings.filter(b => b.status === 'accepted');
  const completedJobs = caregiverBookings.filter(b => b.status === 'completed');

  // Stats
  const estimatedEarnings = useMemo(() => {
    const rate = profile?.hourlyRate || 20;
    return completedJobs.reduce((sum, job) => {
      // Calculate hours from startDate and endDate
      const start = new Date(job.startDate).getTime();
      const end = new Date(job.endDate).getTime();
      const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
      return sum + hours * rate;
    }, 0);
  }, [completedJobs, profile]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-5xl w-full mx-auto animate-fade-in">
      
      {/* Header greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back, {currentUser?.fullName || 'John'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review job requests, track appointments, and manage client communications.
        </p>
      </div>

      {/* Verification Status Banner */}
      {profile && (
        <>
          {profile.approvalStatus === 'pending' && (
            <div className="flex items-start gap-3 rounded-2xl bg-amber-50 p-4 border border-amber-200/60 text-xs">
              <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-amber-800">
                <span className="block font-bold">Profile Verification Pending</span>
                <p className="leading-relaxed">
                  Your profile has been submitted and is currently being audited by Domic Care Admins. You will receive a notification and go live in searches once approved.
                </p>
              </div>
            </div>
          )}

          {profile.approvalStatus === 'rejected' && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-50 p-4 border border-red-200/60 text-xs">
              <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-red-800">
                <span className="block font-bold">Verification Audits Unsuccessful</span>
                <p className="leading-relaxed">
                  Your profile verification documents (CNIC / Medical degrees) were rejected. Please navigate to My Profile to re-submit valid credentials.
                </p>
              </div>
            </div>
          )}

          {profile.approvalStatus === 'approved' && (
            <div className="flex items-start gap-3 rounded-2xl bg-blue-50/40 p-4 border border-blue-200/50 text-xs">
              <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-blue-800">
                <span className="block font-bold">Verification Complete & Active</span>
                <p className="leading-relaxed text-slate-500">
                  Your account is fully approved! Families can discover your profile, schedule calendar blocks, and request sessions.
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Earnings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">${estimatedEarnings}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Earnings</span>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <AlertTriangle className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">{pendingRequests.length}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Requests</span>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Calendar className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">{activeJobs.length}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Jobs</span>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50/50 rounded-xl flex items-center justify-center text-amber-500">
            <Star className="h-5.5 w-5.5 fill-amber-500" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">{profile?.rating || '5.0'}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Rating</span>
          </div>
        </div>

      </div>

      {/* Grid: Pending requests & Active schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Side: Pending Job Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 pb-2 border-b border-slate-50">
              Pending Job Requests ({pendingRequests.length})
            </h2>

            {pendingRequests.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-1">
                <p className="text-xs font-semibold">No pending requests</p>
                <p className="text-[10px]">New booking requests will appear here immediately.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex flex-col gap-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="block font-bold text-slate-900 text-xs">Request from {req.userFullName}</span>
                        <span className="block text-[10px] text-slate-400 font-semibold">{req.serviceName} Care</span>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 font-bold space-y-0.5">
                        <span className="block">{formatDate(req.startDate)}</span>
                        <span className="block text-slate-400">{formatTime(req.startDate)} - {formatTime(req.endDate)}</span>
                      </div>
                    </div>

                    {req.notes && (
                      <p className="text-[11px] text-slate-600 italic bg-white p-2.5 rounded-xl border border-slate-100 leading-relaxed font-normal">
                        &ldquo;{req.notes}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-3 self-end">
                      <button
                        onClick={() => updateBookingStatus(req.id, 'rejected')}
                        className="rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 px-3 py-1.5 text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>Decline</span>
                      </button>
                      <button
                        onClick={() => updateBookingStatus(req.id, 'accepted')}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Accept</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active care appointments */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 pb-2 border-b border-slate-50">
              Active Care Schedule
            </h2>

            {activeJobs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No active jobs scheduled today.</p>
            ) : (
              <div className="space-y-3">
                {activeJobs.map((job) => (
                  <div key={job.id} className="p-3 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2.5">
                    <div>
                      <span className="block font-bold text-slate-800 text-xs">{job.userFullName}</span>
                      <span className="block text-[10px] text-slate-400 font-semibold">{job.serviceName} Care</span>
                    </div>

                    <div className="text-[10px] text-slate-500 font-bold space-y-0.5">
                      <span className="block">{formatDate(job.startDate)}</span>
                      <span className="block text-slate-400">{formatTime(job.startDate)} - {formatTime(job.endDate)}</span>
                    </div>

                    <button
                      onClick={() => updateBookingStatus(job.id, 'completed')}
                      className="w-full rounded-xl bg-green-550 border border-green-500/20 bg-green-600 hover:bg-green-700 text-white py-1.5 text-[10px] font-bold shadow-sm transition-colors cursor-pointer"
                    >
                      Mark Completed
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
