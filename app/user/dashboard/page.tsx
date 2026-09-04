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
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const { currentUser, bookings, notifications, conversations, markNotificationRead, createConversation } = useCareConnect();

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 bg-[#070814]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-purple-500 border-t-transparent" />
        <p className="text-sm font-bold text-slate-400">Loading your care portal...</p>
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
    <div className="min-h-screen bg-[#070814] text-white pb-12 animate-fade-in">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl flex items-center gap-2">
              <span>{getGreeting()}, {currentUser?.fullName || 'Family Client'} 👋</span>
            </h1>
            <p className="mt-2 text-slate-400">
              Overview of family care coordination, upcoming caregiver sessions, and direct communications.
            </p>
          </div>

          <Link
            href="/user/search-caregivers"
            className="inline-flex items-center gap-2 rounded-2xl nav-pill-active px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition cursor-pointer self-start lg:self-auto"
          >
            <span>Find Caregivers</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* 4 Signature Vibrant Metric Cards */}
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          
          {/* Upcoming Care */}
          <div className="stat-card-blue rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <Calendar size={32} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Upcoming</span>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-black">{upcomingCare.length}</h2>
              <p className="mt-1 text-xs text-blue-100 font-semibold">Confirmed Appointments</p>
            </div>
          </div>

          {/* Pending Requests */}
          <div className="stat-card-orange rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <Clock size={32} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Pending</span>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-black">{activeRequests.length}</h2>
              <p className="mt-1 text-xs text-amber-100 font-semibold">Pending Approval Requests</p>
            </div>
          </div>

          {/* Network Assurance */}
          <div className="stat-card-teal rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <ShieldCheck size={32} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Verified</span>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-black">100%</h2>
              <p className="mt-1 text-xs text-teal-100 font-semibold">Audited Network Caregivers</p>
            </div>
          </div>

          {/* Chats Active */}
          <div className="stat-card-purple rounded-3xl p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            <div className="flex items-center justify-between">
              <MessageSquare size={32} />
              <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">Messages</span>
            </div>
            <div className="mt-4">
              <h2 className="text-4xl font-black">{conversations.length}</h2>
              <p className="mt-1 text-xs text-pink-100 font-semibold">Active Messaging Channels</p>
            </div>
          </div>

        </div>

        {/* Main Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upcoming Care & Active Requests */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Upcoming Care Appointments */}
            <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-black text-white">
                  Upcoming Care Appointments
                </h2>
                <Link href="/user/bookings" className="text-xs font-bold text-cyan-400 hover:underline">
                  View All Bookings
                </Link>
              </div>

              {upcomingCare.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-white/10 rounded-2xl">
                  <Calendar className="h-10 w-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">No upcoming care scheduled</p>
                  <p className="text-xs text-slate-500">Browse caregivers to submit care appointment requests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingCare.map((b) => (
                    <div
                      key={b.id}
                      className="p-5 rounded-2xl glass-card border border-white/10 space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={b.caregiverAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=CG'}
                            alt={b.caregiverFullName}
                            className="h-12 w-12 rounded-2xl object-cover border border-white/20 bg-slate-800 shadow-sm"
                          />
                          <div>
                            <span className="font-extrabold text-white text-sm block">
                              {b.caregiverFullName}
                            </span>
                            <span className="inline-flex rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/20 px-2.5 py-0.5 text-[10px] font-bold mt-1">
                              {b.serviceName} Care
                            </span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 font-semibold space-y-1 sm:text-right bg-white/5 p-2.5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-1 sm:justify-end text-white font-bold">
                            <Calendar size={13} className="text-cyan-400" />
                            <span>{formatBookingDate(b.startDate)}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:justify-end text-slate-400">
                            <Clock size={13} className="text-slate-400" />
                            <span>{formatBookingTime(b.startDate)} - {formatBookingTime(b.endDate)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="inline-flex items-center rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 text-[10px] font-bold">
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
                          className="rounded-xl nav-pill-active text-white px-4 py-2 text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
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
            <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-black text-white">
                  Pending Care Requests
                </h2>
                <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 text-xs font-bold">
                  {activeRequests.length} Pending
                </span>
              </div>

              {activeRequests.length === 0 ? (
                <p className="text-xs text-slate-500 italic py-2">No pending caregiver response requests.</p>
              ) : (
                <div className="space-y-3">
                  {activeRequests.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl glass-card border border-white/10 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={b.caregiverAvatar}
                          alt={b.caregiverFullName}
                          className="h-10 w-10 rounded-xl object-cover border border-white/20 bg-slate-800"
                        />
                        <div>
                          <span className="font-bold text-white text-xs block">{b.caregiverFullName}</span>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            {b.serviceName} • Requested {formatBookingDate(b.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span className="inline-flex rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 text-[10px] font-bold">
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
            <div className="glass-panel rounded-3xl border border-white/10 p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-xl font-black text-white">
                  Recent Notifications
                </h2>
                <Bell className="h-5 w-5 text-purple-400" />
              </div>

              {userNotifs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2 border border-dashed border-white/10 rounded-2xl">
                  <Bell className="h-10 w-10 text-slate-500 mx-auto" />
                  <p className="text-sm font-bold text-slate-300">All caught up!</p>
                  <p className="text-xs text-slate-500">No new notifications.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {userNotifs.map((n) => (
                    <div
                      key={n.id}
                      className={`
                        p-4 rounded-2xl glass-card border text-xs relative group flex gap-3 transition-all
                        ${n.isRead 
                          ? 'border-white/5 text-slate-400' 
                          : 'border-purple-500/30 text-white font-medium'}
                      `}
                    >
                      <div className="shrink-0 mt-0.5">
                        {n.type === 'booking_update' ? (
                          <AlertCircle className="h-4 w-4 text-cyan-400" />
                        ) : n.type === 'chat_message' ? (
                          <MessageSquare className="h-4 w-4 text-purple-400" />
                        ) : (
                          <Bell className="h-4 w-4 text-slate-400" />
                        )}
                      </div>
                      <div className="pr-4 space-y-1">
                        <span className="block font-bold text-white">{n.title}</span>
                        <p className="text-[11px] leading-relaxed text-slate-300">{n.message}</p>
                      </div>
                      
                      {!n.isRead && (
                        <button
                          onClick={() => markNotificationRead(n.id)}
                          className="absolute right-3 top-3 p-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
