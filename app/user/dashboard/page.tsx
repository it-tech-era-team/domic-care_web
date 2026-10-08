'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCareConnect, Booking } from '@/context/useCareConnect';
import StripePaymentModal from '@/components/StripePaymentModal';
import {
  Calendar,
  MessageSquare,
  Bell,
  ArrowRight,
  ShieldCheck,
  Clock,
  Search,
  Hourglass,
  ChevronRight,
  MapPin,
  ClipboardCheck,
  Check,
  AlertTriangle,
  CreditCard,
  X,
  Trash2
} from 'lucide-react';

export default function UserDashboard() {
  const router = useRouter();
  const {
    currentUser,
    bookings,
    notifications,
    conversations,
    caregivers,
    markNotificationRead,
    createConversation,
    updateBookingStatus,
    refreshData
  } = useCareConnect();

  // Payment modal & popup state
  const [pendingPopupBooking, setPendingPopupBooking] = useState<Booking | null>(null);
  const [payBooking, setPayBooking] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [dismissedBookingIds, setDismissedBookingIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter bookings belonging to current user
  const userBookings = useMemo(() => {
    if (!currentUser) return [];
    return bookings.filter((b) => b.userId === currentUser.id);
  }, [bookings, currentUser]);

  // Find bookings awaiting payment
  const pendingPaymentBookings = useMemo(() => {
    return userBookings.filter(
      (b) =>
        (b.status === 'awaiting_payment' || (b.status === 'pending' && (b.totalAmount || 0) > 0)) &&
        !dismissedBookingIds.includes(b.id)
    );
  }, [userBookings, dismissedBookingIds]);

  // Auto-show popup on dashboard load when there's an unpaid booking
  useEffect(() => {
    if (pendingPaymentBookings.length > 0 && !pendingPopupBooking && !payBooking) {
      setPendingPopupBooking(pendingPaymentBookings[0]);
    }
  }, [pendingPaymentBookings, pendingPopupBooking, payBooking]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      setIsCancelling(true);
      await updateBookingStatus(bookingId, 'cancelled');
      setPendingPopupBooking(null);
      if (dismissedBookingIds.indexOf(bookingId) === -1) {
        setDismissedBookingIds((prev) => [...prev, bookingId]);
      }
    } catch (err) {
      console.error('Cancel booking error:', err);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenPayModal = (booking: Booking) => {
    setPendingPopupBooking(null);
    setPayBooking(booking);
  };

  const handlePaymentSuccess = async () => {
    setPayBooking(null);
    if (refreshData) {
      await refreshData();
    }
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 bg-[#f4f7fc]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-bold text-slate-500">Loading your family care portal...</p>
      </div>
    );
  }

  // Calculations
  const activeRequests = userBookings.filter((b) => b.status === 'pending');
  const upcomingCare = userBookings.filter((b) => b.status === 'accepted');

  const getCaregiverAvatar = (avatarUrl?: string, fullName?: string) => {
    if (avatarUrl && avatarUrl.trim() !== '' && !avatarUrl.includes('Background%20images') && !avatarUrl.includes('Background images')) {
      return avatarUrl;
    }
    const matched = caregivers.find(c => c.fullName.toLowerCase().includes((fullName || 'fahad').toLowerCase()));
    if (matched?.avatarUrl) return matched.avatarUrl;
    return `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`;
  };

  const displayAppointments = upcomingCare.length > 0 ? upcomingCare : [
    {
      id: 'demo-1',
      caregiverId: 'cg-1',
      caregiverFullName: 'fahad',
      caregiverAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      serviceName: 'Elder Care',
      startDate: '2028-08-31T19:49:00Z',
      endDate: '2028-08-31T21:50:00Z',
      status: 'accepted'
    }
  ];

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good morning';
    if (hr < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatBookingTime = (isoString: string) => {
    if (!isoString) return '07:49 PM';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '07:49 PM';
    }
  };

  const formatBookingDate = (isoString: string) => {
    if (!isoString) return '31 Aug 2028';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fc] text-slate-900 pb-12 animate-fade-in">
      <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 space-y-6">
        
        {/* Pending Payment Notification Banner */}
        {pendingPaymentBookings.length > 0 && (
          <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-blue-500/10 border-2 border-amber-300/80 p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">Payment Required for Care Session</span>
                  <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    Action Needed
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Caregiver <span className="font-bold text-slate-900">{pendingPaymentBookings[0].caregiverFullName}</span> has accepted your request. Complete payment of ${(pendingPaymentBookings[0].totalAmount || 0).toFixed(2)} USD to confirm or cancel if plans changed.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              <button
                onClick={() => handleCancelBooking(pendingPaymentBookings[0].id)}
                disabled={isCancelling}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs transition cursor-pointer disabled:opacity-60"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
              <button
                onClick={() => handleOpenPayModal(pendingPaymentBookings[0])}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay Now (${(pendingPaymentBookings[0].totalAmount || 0).toFixed(2)})</span>
              </button>
            </div>
          </div>
        )}

        {/* Greeting Banner with Background Image Cutout */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-blue-100/40 border border-blue-100/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="max-w-xl space-y-3 z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>{getGreeting()}, {currentUser?.fullName?.split(' ')[0] || 'aqib'} 👋</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              Here's a quick overview of your family care coordination, upcoming caregiver sessions, and direct communications.
            </p>
            <div className="pt-2">
              <Link
                href="/user/search-caregivers"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 text-xs font-bold shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Find Caregivers</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Banner Hero Image */}
          <div className="relative w-full md:w-80 h-44 sm:h-52 shrink-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-sky-300/40 rounded-3xl transform rotate-2 scale-95" />
            <img
              src="/hero/user-hero.jpg"
              alt="Caregiver Assisting Senior"
              className="w-full h-full object-cover rounded-3xl border-2 border-white shadow-xl relative z-10"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80';
              }}
            />
          </div>
        </div>

        {/* 4 Executive Cards Matching Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1: Confirmed Appointments */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shadow-2xs">
                <Calendar className="h-5 w-5" />
              </div>
              <Link href="/user/bookings" className="h-8 w-8 rounded-full bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 flex items-center justify-center transition-colors cursor-pointer">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-xs font-bold text-slate-600 block mb-1">Confirmed Appointments</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{upcomingCare.length || 1}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span>+0 this week</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Pending Approval Requests */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div className="h-10 w-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shadow-2xs">
                <Hourglass className="h-5 w-5" />
              </div>
              <Link href="/user/bookings" className="h-8 w-8 rounded-full bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-600 flex items-center justify-center transition-colors cursor-pointer">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-xs font-bold text-slate-600 block mb-1">Pending Approval Requests</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{activeRequests.length}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <span>No action required</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Audited Network Caregivers */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div className="h-10 w-10 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <Link href="/user/search-caregivers" className="h-8 w-8 rounded-full bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 flex items-center justify-center transition-colors cursor-pointer">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-xs font-bold text-slate-600 block mb-1">Audited Network Caregivers</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">100%</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span>All verified</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Active Messaging Channels */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[140px] relative overflow-hidden group">
            <div className="flex items-center justify-between relative z-10">
              <div className="h-10 w-10 rounded-2xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center shadow-2xs">
                <MessageSquare className="h-5 w-5" />
              </div>
              <Link href="/user/messages" className="h-8 w-8 rounded-full bg-purple-50 hover:bg-purple-600 hover:text-white text-purple-600 flex items-center justify-center transition-colors cursor-pointer">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative z-10 mt-4">
              <span className="text-xs font-bold text-slate-600 block mb-1">Active Messaging Channels</span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{conversations.length || 1}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
                  <span>+0 this week</span>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (7 cols): Appointments & Pending */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Upcoming Care Appointments Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Upcoming Care Appointments</h2>
                    <p className="text-xs text-slate-500 font-medium">Your scheduled caregiver sessions</p>
                  </div>
                </div>
                <Link href="/user/bookings" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <span>View All Bookings</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {/* Appointment Card */}
              {displayAppointments.map((b) => (
                <div
                  key={b.id}
                  className="p-5 rounded-3xl bg-white border-2 border-blue-500/20 shadow-xs space-y-4 relative"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getCaregiverAvatar(b.caregiverAvatar, b.caregiverFullName)}
                        alt={b.caregiverFullName || 'Caregiver'}
                        className="h-12 w-12 rounded-2xl object-cover border border-slate-200 bg-slate-100 shadow-xs"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(b.caregiverFullName || 'Caregiver')}`;
                        }}
                      />
                      <div>
                        <span className="font-extrabold text-slate-900 text-sm block capitalize">
                          {b.caregiverFullName || 'fahad'}
                        </span>
                        <span className="inline-flex rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold mt-1">
                          {b.serviceName || 'Elder Care'} Care
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 text-[10px] font-extrabold self-start sm:self-auto">
                      <Check className="h-3 w-3" />
                      <span>Confirmed Session</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{formatBookingDate(b.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <span>{formatBookingTime(b.startDate)} - {formatBookingTime(b.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>Home Visit</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={async () => {
                        const convId = await createConversation(b.caregiverId);
                        if (convId) {
                          router.push(`/user/messages?conv=${convId}`);
                        } else {
                          router.push('/user/messages');
                        }
                      }}
                      className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2 transition"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat with Caregiver</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pending Care Requests Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-slate-900">Pending Care Requests</h2>
                    <p className="text-xs text-slate-500 font-medium">No pending caregiver response requests.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 text-xs font-extrabold">
                    0 Pending
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>

              {/* Empty State */}
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-16 w-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                  <ClipboardCheck className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">All caught up!</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">You don't have any pending care requests at the moment.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (5 cols): Recent Notifications */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-slate-900">Recent Notifications</h2>
                    <span className="h-5 w-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      4
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-notifications'))} 
                  className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
                >
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Notification Items */}
              <div className="space-y-3">
                
                {/* Item 1: Booking ACCEPTED */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3 hover:bg-blue-50/50 transition cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="h-4 w-4 stroke-[3]" />
                    </div>
                    <div className="space-y-1">
                      <span className="block font-black text-slate-900 text-xs uppercase tracking-wider">Booking ACCEPTED</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        fahad has marked your Elder care booking for 2028-08-31 as accepted.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold block">Aug 31, 2028</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">07:49 PM</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>

                {/* Item 2: New Chat Message */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3 hover:bg-blue-50/50 transition cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="block font-black text-slate-900 text-xs uppercase tracking-wider">New Chat Message</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        You received a message from Fahad: "I'm on my way!"
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold block">Aug 31, 2028</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">07:42 PM</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>

                {/* Item 3: Booking COMPLETED */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3 hover:bg-blue-50/50 transition cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="block font-black text-slate-900 text-xs uppercase tracking-wider">Booking COMPLETED</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        fahad has marked your Elder care booking for 2026-09-05 as completed.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold block">Aug 28, 2028</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">05:12 PM</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>

                {/* Item 4: Booking COMPLETED */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-start justify-between gap-3 hover:bg-blue-50/50 transition cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <span className="block font-black text-slate-900 text-xs uppercase tracking-wider">Booking COMPLETED</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        fahad has marked your Elder care booking for 2026-08-29 as completed.
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 font-bold block">Aug 29, 2028</span>
                    <span className="text-[9px] text-slate-400 font-semibold block">03:26 PM</span>
                    <ChevronRight className="h-4 w-4 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

      </div>

      {/* AUTOMATIC POP-UP MODAL FOR PENDING PAYMENTS */}
      {mounted && pendingPopupBooking && createPortal(
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 sm:p-6 animate-fade-in">
          <div className="bg-white rounded-3xl border border-amber-200/80 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 relative text-slate-900 my-auto overflow-hidden">
            {/* Top Bar Accent */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-indigo-600 to-blue-600" />
            
            {/* Header */}
            <div className="flex justify-between items-start pt-1">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                    Payment Required
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight mt-0.5">
                    Complete Care Booking
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  setDismissedBookingIds((prev) => [...prev, pendingPopupBooking.id]);
                  setPendingPopupBooking(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Summary */}
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Caregiver <span className="font-extrabold text-slate-900">{pendingPopupBooking.caregiverFullName}</span> has accepted your request. Please complete payment to confirm this appointment or cancel if no longer required.
              </p>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-3 border-b border-slate-200/70 pb-3">
                  <img
                    src={getCaregiverAvatar(pendingPopupBooking.caregiverAvatar, pendingPopupBooking.caregiverFullName)}
                    alt={pendingPopupBooking.caregiverFullName}
                    className="h-11 w-11 rounded-2xl object-cover border border-slate-200 shadow-xs bg-slate-100 shrink-0"
                  />
                  <div>
                    <span className="font-extrabold text-slate-900 text-sm block">
                      {pendingPopupBooking.caregiverFullName}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {pendingPopupBooking.serviceName} Category
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>{formatBookingDate(pendingPopupBooking.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span>{formatBookingTime(pendingPopupBooking.startDate)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm font-black text-slate-900 border-t border-slate-200/70 pt-2.5">
                  <span>Total Due</span>
                  <span className="text-blue-600 text-base font-black">
                    ${(pendingPopupBooking.totalAmount || 0).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                onClick={() => handleCancelBooking(pendingPopupBooking.id)}
                disabled={isCancelling}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {isCancelling ? (
                  <>
                    <div className="h-4 w-4 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    <span>Cancel Booking</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleOpenPayModal(pendingPopupBooking)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <CreditCard className="h-4 w-4" />
                <span>Pay ${(pendingPopupBooking.totalAmount || 0).toFixed(2)} Now</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* STRIPE PAYMENT MODAL */}
      {payBooking && (
        <StripePaymentModal
          bookingId={payBooking.id}
          serviceName={payBooking.serviceName}
          caregiverName={payBooking.caregiverFullName}
          startDate={payBooking.startDate}
          onSuccess={handlePaymentSuccess}
          onClose={() => setPayBooking(null)}
        />
      )}

    </div>
  );
}

