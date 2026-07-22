'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCareConnect, Booking } from '@/context/useCareConnect';
import {
  Calendar, Clock, Star, MessageSquare, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, X, Heart, ShieldCheck
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Looping bloom / wilt flower illustration                          */
/* ------------------------------------------------------------------ */
function BloomingFlower() {
  return (
    <div className="relative h-32 w-32 sm:h-40 sm:w-40 shrink-0">
      <style>{`
        @keyframes bloomWilt {
          0%   { transform: scale(0.15); opacity: 0; }
          10%  { opacity: 1; }
          35%  { transform: scale(1);    opacity: 1; }
          55%  { transform: scale(1);    opacity: 1; }
          80%  { transform: scale(0.15); opacity: 0.3; }
          100% { transform: scale(0.15); opacity: 0; }
        }
        @keyframes swayStem {
          0%, 100% { transform: rotate(-2deg); }
          50%      { transform: rotate(2deg); }
        }
        @keyframes petalGlow {
          0%, 100% { opacity: 0.55; }
          50%      { opacity: 1; }
        }
        .flower-stem {
          transform-origin: 100px 190px;
          animation: swayStem 3.2s ease-in-out infinite;
        }
        .flower-bloom {
          transform-origin: 100px 95px;
          animation: bloomWilt 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .flower-petal {
          animation: petalGlow 4.5s ease-in-out infinite;
        }
      `}</style>
      <svg viewBox="0 0 200 220" className="h-full w-full">
        <path d="M70 190 L130 190 L122 215 L78 215 Z" fill="#BFDBFE" />
        <rect x="66" y="182" width="68" height="12" rx="4" fill="#93C5FD" />

        <g className="flower-stem">
          <path d="M100 190 C100 150 100 130 100 100" stroke="#4ADE80" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 160 C80 155 70 140 72 128 C90 132 100 145 100 160 Z" fill="#86EFAC" />
          <path d="M100 145 C120 140 130 125 128 113 C110 117 100 130 100 145 Z" fill="#4ADE80" />
        </g>

        <g className="flower-bloom">
          <g className="flower-petal">
            <ellipse cx="100" cy="70" rx="16" ry="26" fill="#93C5FD" />
            <ellipse cx="100" cy="120" rx="16" ry="26" fill="#93C5FD" />
            <ellipse cx="72" cy="95" rx="26" ry="16" fill="#BFDBFE" />
            <ellipse cx="128" cy="95" rx="26" ry="16" fill="#BFDBFE" />
            <ellipse cx="80" cy="78" rx="18" ry="14" fill="#DBEAFE" transform="rotate(-40 80 78)" />
            <ellipse cx="120" cy="78" rx="18" ry="14" fill="#DBEAFE" transform="rotate(40 120 78)" />
            <ellipse cx="80" cy="112" rx="18" ry="14" fill="#DBEAFE" transform="rotate(40 80 112)" />
            <ellipse cx="120" cy="112" rx="18" ry="14" fill="#DBEAFE" transform="rotate(-40 120 112)" />
          </g>
          <circle cx="100" cy="95" r="14" fill="#2563EB" />
          <circle cx="100" cy="95" r="14" fill="#3B82F6" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}

export default function UserBookings() {
  const router = useRouter();
  const { currentUser, bookings, updateBookingStatus, submitReview, createConversation } = useCareConnect();

  // Filter tab state
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');

  // Review Dialog State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-bold text-slate-500">Loading your bookings...</p>
      </div>
    );
  }

  const userBookings = bookings.filter((b) => b.userId === currentUser.id);

  const filteredBookings = userBookings.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return isoString;
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm('Are you sure you want to cancel this caregiver request?')) {
      updateBookingStatus(bookingId, 'cancelled');
    }
  };

  const openReviewModal = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setRatingVal(5);
    setReviewComment('');
  };

  const closeReviewModal = () => {
    setSelectedBookingForReview(null);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingForReview) return;

    submitReview(selectedBookingForReview.id, ratingVal, reviewComment);
    closeReviewModal();
  };

  const tabCounts = {
    all: userBookings.length,
    pending: userBookings.filter((b) => b.status === 'pending').length,
    accepted: userBookings.filter((b) => b.status === 'accepted').length,
    completed: userBookings.filter((b) => b.status === 'completed').length,
    cancelled: userBookings.filter((b) => b.status === 'cancelled' || b.status === 'rejected').length,
  };

  const cardBorderColor = (status: Booking['status']) => {
    switch (status) {
      case 'accepted':
        return 'border-l-emerald-500';
      case 'completed':
        return 'border-l-blue-600';
      case 'pending':
        return 'border-l-amber-400';
      default:
        return 'border-l-red-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Title + illustration */}
        <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 p-7 sm:p-8 text-white shadow-xl flex items-center justify-between gap-6 overflow-hidden">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              My Care Bookings
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 mt-2 max-w-md font-medium">
              Review, schedule, manage direct chats, and evaluate caregiver sessions for your family.
            </p>
          </div>
          <BloomingFlower />
        </div>

        {/* Tabs Menu */}
        <div className="flex flex-wrap border-b border-slate-200 gap-2">
          {(['all', 'pending', 'accepted', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center gap-2 pb-3 px-4 text-xs font-bold capitalize transition-all border-b-2 -mb-[2px] cursor-pointer
                ${activeTab === tab
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-slate-400 hover:text-slate-600'}
              `}
            >
              {tab}
              <span
                className={`h-5 min-w-5 px-1.5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-5">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-lg">
              <div className="mx-auto h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Calendar className="h-7 w-7 text-slate-300" />
              </div>
              <h3 className="font-extrabold text-slate-800 text-base">No Bookings Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                No caregiver appointments match your filter selection. Try creating a new care request.
              </p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className={`bg-white rounded-3xl border border-slate-200 border-l-4 ${cardBorderColor(
                  b.status
                )} p-6 shadow-lg hover:shadow-xl transition-all flex flex-col md:flex-row md:items-start justify-between gap-6`}
              >
                {/* Left caregiver details */}
                <div className="flex items-start gap-4">
                  <img
                    src={b.caregiverAvatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=CG'}
                    alt={b.caregiverFullName}
                    className="h-14 w-14 rounded-2xl object-cover shrink-0 bg-slate-50 border border-slate-200 shadow-sm"
                  />
                  <div className="space-y-2">
                    <div>
                      <span className="block font-extrabold text-slate-900 text-base">{b.caregiverFullName}</span>
                      <span className="inline-flex rounded-full bg-blue-100 px-3 py-0.5 text-xs font-bold text-blue-700 mt-1">
                        {b.serviceName} Care
                      </span>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 border border-slate-200/60 rounded-xl p-3 max-w-lg">
                        <strong>Client notes:</strong> &ldquo;{b.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Center schedule/status details */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between sm:justify-start gap-4 shrink-0">
                  <div className="space-y-1 text-left md:text-right bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-800 font-bold">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{formatDate(b.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{formatTime(b.startDate)} - {formatTime(b.endDate)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Status Badge */}
                    <span
                      className={`
                      inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold border capitalize
                      ${b.status === 'pending' && 'bg-amber-100 text-amber-700 border-amber-200'}
                      ${b.status === 'accepted' && 'bg-green-100 text-green-700 border-green-200'}
                      ${b.status === 'completed' && 'bg-slate-100 text-slate-600 border-slate-200'}
                      ${b.status === 'cancelled' && 'bg-red-100 text-red-700 border-red-200'}
                      ${b.status === 'rejected' && 'bg-red-100 text-red-700 border-red-200'}
                    `}
                    >
                      {b.status === 'pending' && 'Awaiting Confirmation'}
                      {b.status === 'accepted' && 'Care Confirmed'}
                      {b.status === 'completed' && 'Care Completed'}
                      {b.status === 'cancelled' && 'Cancelled'}
                      {b.status === 'rejected' && 'Rejected'}
                    </span>

                    {/* Actions */}
                    {b.status === 'accepted' && (
                      <button
                        onClick={async () => {
                          const convId = await createConversation(b.caregiverId);
                          if (convId) {
                            router.push(`/user/messages?conv=${convId}`);
                          } else {
                            router.push('/user/messages');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-md shadow-blue-500/15 transition cursor-pointer"
                      >
                        <MessageSquare className="h-4 w-4" />
                        <span>Chat with Caregiver</span>
                      </button>
                    )}

                    {b.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline cursor-pointer"
                      >
                        Cancel Request
                      </button>
                    )}

                    {b.status === 'completed' && b.rating === undefined && (
                      <button
                        onClick={() => openReviewModal(b)}
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold shadow-md transition cursor-pointer"
                      >
                        Rate Caregiver
                      </button>
                    )}

                    {b.status === 'completed' && b.rating !== undefined && (
                      <div className="flex items-center gap-1 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold text-amber-700">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{b.rating}.0 Reviewed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Dialog Modal Overlay */}
        {selectedBookingForReview && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 space-y-6 shadow-2xl relative">
              <button
                onClick={closeReviewModal}
                className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="space-y-2 text-center">
                <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Heart className="h-6 w-6 fill-blue-600" />
                </div>
                <h3 className="font-heading font-extrabold text-lg text-slate-900">
                  Rate Caregiver Service
                </h3>
                <p className="text-xs text-slate-500">
                  Tell us about the care provided by {selectedBookingForReview.caregiverFullName}.
                </p>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                {/* Star selector */}
                <div className="space-y-1.5 text-center">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Service Rating</label>
                  <div className="flex justify-center gap-2 py-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingVal(star)}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`
                          h-8 w-8
                          ${star <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                        `}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment text */}
                <div className="space-y-1.5">
                  <label htmlFor="comment" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Feedback Details
                  </label>
                  <textarea
                    id="comment"
                    required
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share details about punctuality, patience, medicine scheduling support, or friendliness..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-500/15 transition cursor-pointer"
                >
                  <span>Submit Care Evaluation</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}