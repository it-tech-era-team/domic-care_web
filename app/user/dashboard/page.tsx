'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCareConnect } from '@/context/useCareConnect';
import {
  Calendar,
  MessageSquare,
  Bell,
  Star,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Clock,
  Trash2,
  Heart,
  CalendarDays,
  UserCheck,
  CheckCircle2
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const { currentUser, bookings, notifications, conversations, markNotificationRead, createConversation } = useCareConnect();

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-bold text-slate-500">Loading your care portal...</p>
      </div>
    );
  }

  // Calculations
  const userBookings = bookings.filter((b) => b.userId === currentUser.id);
  const activeRequests = userBookings.filter((b) => b.status === 'pending');
  const upcomingCare = userBookings.filter((b) => b.status === 'accepted');
  const userNotifs = notifications.filter((n) => n.userId === currentUser.id).slice(0, 5);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatBookingTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatBookingDate = (isoString: string) => {
    if (!isoString) return '—';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {getGreeting()}, {currentUser?.fullName || 'Family Client'}
            </h1>
            <p className="mt-2 text-slate-500">
              Overview of elderly care coordination, upcoming caregiver sessions, and direct communications.
            </p>
          </div>

          <Link
            href="/user/search-caregivers"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl cursor-pointer self-start lg:self-auto"
          >
            <span>Find Caregivers</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Vibrant Statistics Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          
          {/* Upcoming Care */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-7 text-white shadow-xl transition hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <Calendar size={34} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                Upcoming
              </span>
            </div>
            <h2 className="mt-8 text-5xl font-black">{upcomingCare.length}</h2>
            <p className="mt-2 text-blue-100 font-semibold">Confirmed Appointments</p>
          </div>

          {/* Pending Requests */}
          <div className="rounded-3xl border border-amber-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <Clock className="text-amber-600" size={34} />
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                Pending
              </span>
            </div>
            <h2 className="mt-8 text-5xl font-black text-amber-500">{activeRequests.length}</h2>
            <p className="mt-2 text-slate-500 font-semibold">Pending Approval Requests</p>
          </div>

          {/* Network Assurance */}
          <div className="rounded-3xl border border-emerald-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <ShieldCheck className="text-emerald-600" size={34} />
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                Verified
              </span>
            </div>
            <h2 className="mt-8 text-5xl font-black text-emerald-600">100%</h2>
            <p className="mt-2 text-slate-500 font-semibold">Audited Network Caregivers</p>
          </div>

          {/* Chats Active */}
          <div className="rounded-3xl border border-purple-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <MessageSquare className="text-purple-600" size={34} />
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                Messages
              </span>
            </div>
            <h2 className="mt-8 text-5xl font-black text-purple-600">{conversations.length}</h2>
            <p className="mt-2 text-slate-500 font-semibold">Active Messaging Channels</p>
          </div>

        </div>

        {/* Main Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upcoming Care & Active Requests */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Upcoming Care Appointments */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Upcoming Care Appointments
                </h2>
                <Link href="/user/bookings" className="text-xs font-bold text-blue-600 hover:underline">
                  View All Bookings
                </Link>
              </div>

              {upcomingCare.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <Calendar className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No upcoming care scheduled</p>
                  <p className="text-xs text-slate-400">Browse caregivers to submit care appointment requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingCare.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-blue-50/20 transition-all space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.caregiverAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=CG'}
                            alt={b.caregiverFullName}
                            className="h-12 w-12 rounded-2xl object-cover border border-slate-200 bg-white shadow-sm"
                          />
                          <div>
                            <span className="font-extrabold text-slate-900 text-sm block">
                              {b.caregiverFullName}
                            </span>
                            <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 mt-1">
                              {b.serviceName} Care
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-500 font-semibold space-y-1 sm:text-right bg-white p-2.5 rounded-xl border border-slate-200/60">
                          <div className="flex items-center gap-1 sm:justify-end text-slate-800 font-bold">
                            <Calendar size={13} className="text-blue-600" />
                            <span>{formatBookingDate(b.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:justify-end text-slate-500">
                            <Clock size={13} className="text-slate-400" />
                            <span>{formatBookingTime(b.startDate)} - {formatBookingTime(b.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                        <span className="inline-flex items-center rounded-full bg-green-100 text-green-700 px-3 py-1 text-[10px] font-bold">
                          Confirmed Session
                        </span>

                        <button
                          onClick={async () => {
                            const convId = await createConversation(b.caregiverId);
                            if (convId) {
                              router.push(`/user/messages?conv=${convId}`);
                            } else {
                              router.push('/user/messages');
                            }
                          }}
                          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-blue-500/15 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <MessageSquare size={14} />
                          <span>Chat with Caregiver</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Care Requests */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Pending Care Requests
                </h2>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                  {activeRequests.length} Pending
                </span>
              </div>

              {activeRequests.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No pending caregiver response requests.</p>
              ) : (
                <div className="space-y-3">
                  {activeRequests.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-slate-50 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={b.caregiverAvatar}
                          alt={b.caregiverFullName}
                          className="h-10 w-10 rounded-xl object-cover border bg-white"
                        />
                        <div>
                          <span className="font-bold text-slate-900 text-xs block">{b.caregiverFullName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {b.serviceName} • Requested {formatBookingDate(b.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-700 border border-amber-200">
                        Pending Confirmation
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Notifications Feed */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900">
                  Recent Notifications
                </h2>
                <Bell className="h-5 w-5 text-slate-400" />
              </div>

              {userNotifs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-slate-200 rounded-2xl">
                  <Bell className="h-10 w-10 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">All caught up!</p>
                  <p className="text-xs text-slate-400">No new notifications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`
                        p-4 rounded-2xl border text-xs relative group flex gap-3 transition-all
                        ${n.isRead 
                          ? 'bg-white border-slate-100 text-slate-500' 
                          : 'bg-blue-50/30 border-blue-100 text-slate-800 font-medium'}
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
                      <div className="pr-4 space-y-1">
                        <span className="block font-bold text-slate-900">{n.title}</span>
                        <p className="text-[11px] leading-relaxed text-slate-500">{n.message}</p>
                      </div>
                      
                      {!n.isRead && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
    </div>
  );
}
