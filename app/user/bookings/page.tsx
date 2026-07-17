'use client';

import React, { useState } from 'react';
import { useCareConnect, Booking } from '@/context/useCareConnect';
import {
  Calendar, Clock, Star, MessageSquare, AlertTriangle,
  CheckCircle2, XCircle, ChevronRight, X, Heart
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Looping bloom / wilt flower illustration                          */
/*  (replaces the static calendar graphic)                            */
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
        {/* pot */}
        <path d="M70 190 L130 190 L122 215 L78 215 Z" fill="#BFDBFE" />
        <rect x="66" y="182" width="68" height="12" rx="4" fill="#93C5FD" />

        {/* stem + leaves (always visible, gentle sway) */}
        <g className="flower-stem">
          <path d="M100 190 C100 150 100 130 100 100" stroke="#4ADE80" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M100 160 C80 155 70 140 72 128 C90 132 100 145 100 160 Z" fill="#86EFAC" />
          <path d="M100 145 C120 140 130 125 128 113 C110 117 100 130 100 145 Z" fill="#4ADE80" />
        </g>

        {/* blooming flower head — loops: bloom in, hold, wilt out, repeat */}
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
  const { currentUser, bookings, updateBookingStatus, submitReview } = useCareConnect();

  // Filter tab state
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');

  // Review Dialog State
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500">Loading your bookings...</p>
      </div>
    );
  }

  const userBookings = bookings.filter(b => b.userId === currentUser.id);

  const filteredBookings = userBookings.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
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

  // Purely presentational counts derived from existing data — no new logic/state
  const tabCounts = {
    all: userBookings.length,
    pending: userBookings.filter(b => b.status === 'pending').length,
    accepted: userBookings.filter(b => b.status === 'accepted').length,
    completed: userBookings.filter(b => b.status === 'completed').length,
    cancelled: userBookings.filter(b => b.status === 'cancelled' || b.status === 'rejected').length,
  };

  const cardBorderColor = (status: Booking['status']) => {
    switch (status) {
      case 'accepted': return 'border-l-green-500';
      case 'completed': return 'border-l-blue-500';
      case 'pending': return 'border-l-amber-400';
      default: return 'border-l-red-400';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl w-full mx-auto animate-fade-in">

      {/* Title + illustration */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 via-white to-white border border-slate-100 p-6 sm:p-8 flex items-center justify-between gap-6 overflow-hidden">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Care Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
            Review, schedule, and evaluate booking requests for your family.
          </p>
        </div>
        <BloomingFlower />
      </div>

      {/* Tabs Menu */}
      <div className="flex flex-wrap border-b border-slate-200 gap-1 sm:gap-2">
        {(['all', 'pending', 'accepted', 'completed', 'cancelled'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`
              flex items-center gap-1.5 pb-3 px-3 sm:px-4 text-xs font-bold capitalize transition-all border-b-2 -mb-[2px] cursor-pointer
              ${activeTab === tab
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'}
            `}
          >
            {tab}
            <span className={`h-5 min-w-5 px-1 rounded-full text-[10px] flex items-center justify-center font-bold ${
              activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center space-y-3 shadow-sm">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-800">No Bookings Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              No caregiver appointments match your filter selection. Try creating a new request.
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className={`bg-white rounded-3xl border border-slate-100 border-l-4 ${cardBorderColor(b.status)} p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-6`}
            >
              {/* Left caregiver details */}
              <div className="flex items-start gap-4">
                <img
                  src={b.caregiverAvatar}
                  alt={b.caregiverFullName}
                  className="h-12 w-12 rounded-xl object-cover shrink-0 bg-slate-50 border border-slate-100"
                />
                <div className="space-y-1.5">
                  <span className="block font-bold text-slate-900 text-sm">{b.caregiverFullName}</span>
                  <span className="inline-flex rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                    {b.serviceName}
                  </span>

                  {b.notes && (
                    <p className="text-xs text-slate-500 leading-relaxed font-normal bg-slate-50 border border-slate-100/50 rounded-xl p-2.5 max-w-lg">
                      <strong>Client notes:</strong> &ldquo;{b.notes}&rdquo;
                    </p>
                  )}
                </div>
              </div>

              {/* Center schedule/status details */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between sm:justify-start gap-4 shrink-0">
                <div className="space-y-1 text-left md:text-right">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{formatDate(b.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{formatTime(b.startDate)} - {formatTime(b.endDate)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {/* Status Badge */}
                  <span className={`
                    inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border
                    ${b.status === 'pending' && 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse-slow'}
                    ${b.status === 'accepted' && 'bg-green-50 text-green-700 border-green-100'}
                    ${b.status === 'completed' && 'bg-slate-50 text-slate-600 border-slate-100'}
                    ${b.status === 'cancelled' && 'bg-red-50 text-red-700 border-red-100'}
                    ${b.status === 'rejected' && 'bg-red-50 text-red-700 border-red-100'}
                  `}>
                    {b.status === 'pending' && 'Awaiting Confirmation'}
                    {b.status === 'accepted' && 'Care Confirmed'}
                    {b.status === 'completed' && 'Care Completed'}
                    {b.status === 'cancelled' && 'Cancelled'}
                    {b.status === 'rejected' && 'Rejected'}
                  </span>

                  {/* Actions */}
                  {b.status === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline border-b border-dashed border-red-300 cursor-pointer"
                    >
                      Cancel Request
                    </button>
                  )}

                  {b.status === 'completed' && b.rating === undefined && (
                    <button
                      onClick={() => openReviewModal(b)}
                      className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                    >
                      Rate Caregiver
                    </button>
                  )}

                  {b.status === 'completed' && b.rating !== undefined && (
                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100 text-[10px] font-bold text-amber-700">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span>{b.rating} Reviewed</span>
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={closeReviewModal}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Heart className="h-6 w-6 fill-blue-600" />
              </div>
              <h3 className="font-heading font-extrabold text-lg text-slate-900">
                Rate Caregiver
              </h3>
              <p className="text-xs text-slate-500">
                Tell us about the care provided by {selectedBookingForReview.caregiverFullName}.
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              {/* Star selector */}
              <div className="space-y-1.5 text-center">
                <label className="block text-xs font-bold text-slate-700">Service Rating</label>
                <div className="flex justify-center gap-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingVal(star)}
                      className="p-1 cursor-pointer hover:scale-110 transition-transform"
                    >
                      <Star className={`
                        h-7 w-7 star-glow
                        ${star <= ratingVal ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}
                      `} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment text */}
              <div className="space-y-1.5">
                <label htmlFor="comment" className="block text-xs font-bold text-slate-700">Comment Details</label>
                <textarea
                  id="comment"
                  required
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about their punctuality, patience, medicine scheduling support, or friendliness..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/10"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer"
              >
                <span>Submit Evaluation</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}