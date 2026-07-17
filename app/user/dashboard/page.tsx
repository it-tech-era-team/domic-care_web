'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCareConnect } from '@/context/useCareConnect';
import {
  Calendar, MessageSquare, Bell, Star, ArrowRight,
  ShieldCheck, AlertCircle, Clock, Trash2, Heart
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const { currentUser, bookings, notifications, conversations, markNotificationRead } = useCareConnect();

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500">Loading your care dashboard...</p>
      </div>
    );
  }

  // Calculations
  const userBookings = bookings.filter(b => b.userId === currentUser.id);
  const activeRequests = userBookings.filter(b => b.status === 'pending');
  const upcomingCare = userBookings.filter(b => b.status === 'accepted');
  const userNotifs = notifications.filter(n => n.userId === currentUser.id).slice(0, 5);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatBookingTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatBookingDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-6xl w-full mx-auto animate-fade-in">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {currentUser?.fullName || 'Ahmed'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is a summary of elderly care coordination for your family.
          </p>
        </div>
        <Link
          href="/user/search-caregivers"
          className="rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25 transition-all inline-flex items-center gap-1.5"
        >
          <span>Find Caregivers</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Stat 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Calendar className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">{upcomingCare.length}</span>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Upcoming Care</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
            <Clock className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">{activeRequests.length}</span>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Requests</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">Verified</span>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Caregiver Status</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <MessageSquare className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">{conversations.length}</span>
            <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">Chats Active</span>
          </div>
        </div>

      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Upcoming Care Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h2 className="font-heading font-extrabold text-lg text-slate-900">Upcoming Care Appointments</h2>
              <Link href="/user/bookings" className="text-xs font-bold text-blue-600 hover:underline">
                View All Bookings
              </Link>
            </div>

            {upcomingCare.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-slate-500">No upcoming care scheduled</p>
                <p className="text-xs text-slate-400">You can browse caregivers and submit care booking requests.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingCare.map((b) => (
                  <div key={b.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={b.caregiverAvatar}
                        alt={b.caregiverFullName}
                        className="h-11 w-11 rounded-xl object-cover border border-slate-100"
                      />
                      <div>
                        <span className="block font-bold text-slate-900 text-sm">{b.caregiverFullName}</span>
                        <span className="block text-[11px] text-slate-400 font-semibold">{b.serviceName} Care</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-left sm:text-right">
                      <div className="space-y-0.5">
                        <span className="block font-bold text-slate-800 text-xs">{formatBookingDate(b.startDate)}</span>
                        <span className="block text-[10px] text-slate-400 font-bold">{formatBookingTime(b.startDate)} - {formatBookingTime(b.endDate)}</span>
                      </div>
                      <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 border border-green-100">
                        Confirmed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Requests List */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 pb-2 border-b border-slate-50">
              Pending Care Requests
            </h2>

            {activeRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No pending caregiver response requests.</p>
            ) : (
              <div className="space-y-3">
                {activeRequests.map((b) => (
                  <div key={b.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={b.caregiverAvatar}
                        alt={b.caregiverFullName}
                        className="h-9 w-9 rounded-lg object-cover"
                      />
                      <div>
                        <span className="block font-bold text-slate-900 text-xs">{b.caregiverFullName}</span>
                        <span className="block text-[10px] text-slate-400">{b.serviceName} • Requested {formatBookingDate(b.createdAt)}</span>
                      </div>
                    </div>
                    <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 border border-amber-100 animate-pulse-slow">
                      Pending Approval
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Notifications Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-50">
              <h2 className="font-heading font-extrabold text-lg text-slate-900">Notifications</h2>
              <Bell className="h-4.5 w-4.5 text-slate-400" />
            </div>

            {userNotifs.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p className="text-xs font-semibold">All caught up!</p>
                <p className="text-[10px] mt-0.5">No new notifications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userNotifs.map((n) => (
                  <div
                    key={n.id}
                    className={`
                      p-3 rounded-2xl border text-xs relative group flex gap-2.5 transition-all
                      ${n.isRead 
                        ? 'bg-white border-slate-100 text-slate-500' 
                        : 'bg-blue-50/20 border-blue-50 text-slate-800 font-medium'}
                    `}
                  >
                    <div className="shrink-0 mt-0.5">
                      {n.type === 'booking_update' ? (
                        <AlertCircle className="h-4 w-4 text-blue-600" />
                      ) : n.type === 'chat_message' ? (
                        <MessageSquare className="h-4 w-4 text-purple-600" />
                      ) : (
                        <Bell className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <div className="pr-4 space-y-0.5">
                      <span className="block font-bold text-slate-900">{n.title}</span>
                      <p className="text-[11px] leading-relaxed text-slate-500">{n.message}</p>
                    </div>
                    
                    {!n.isRead && (
                      <button
                        onClick={() => markNotificationRead(n.id)}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        title="Mark as read"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
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
