'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCareConnect, Booking } from '@/context/useCareConnect';
import {
  Calendar, Clock, Star, AlertTriangle, CheckCircle2,
  XCircle, ChevronRight, MessageSquare, CalendarDays, X, Check
} from 'lucide-react';

export default function UserBookings() {
  const router = useRouter();
  const { currentUser, bookings, updateBookingStatus, createConversation, submitReview } = useCareConnect();

  // Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');
  
  // Rating modal state
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-bold text-slate-500">Loading your bookings...</p>
      </div>
    );
  }

  const userBookings = bookings.filter(b => b.userId === currentUser.id);

  const filteredBookings = useMemo(() => {
    return userBookings.filter(b => {
      if (activeTab === 'all') return true;
      if (activeTab === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
      return b.status === activeTab;
    });
  }, [userBookings, activeTab]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking) return;
    submitReview(reviewBooking.id, rating, comment);
    setReviewBooking(null);
    setComment('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 animate-fade-in">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8">
        
        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Care Appointments & Bookings
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Track status, chat with assigned caregivers, and leave feedback reviews.
          </p>
        </div>

        {/* Tabs Menu */}
        <div className="flex flex-wrap border-b border-slate-200 gap-1 sm:gap-2">
          {(['all', 'pending', 'accepted', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                pb-3 px-3 sm:px-4 text-xs font-bold capitalize transition-all border-b-2 -mb-[2px] cursor-pointer
                ${activeTab === tab
                  ? 'border-blue-600 text-blue-600 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-700'}
              `}
            >
              {tab === 'accepted' ? 'Active / Scheduled' : tab}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-xs">
              <div className="mx-auto h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <CalendarDays className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="font-heading font-extrabold text-base text-slate-900">No Care Sessions Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are no care booking records matching your selected tab.
              </p>
            </div>
          ) : (
            filteredBookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-blue-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                {/* Left Caregiver Details */}
                <div className="flex items-start gap-4">
                  <img
                    src={b.caregiverAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                    alt={b.caregiverFullName}
                    className="h-14 w-14 rounded-2xl object-cover border border-slate-200 shadow-xs bg-slate-100 shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="block font-bold text-slate-900 text-base">{b.caregiverFullName}</span>
                    <span className="inline-flex rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
                      {b.serviceName} Care Category
                    </span>
                    {b.notes && (
                      <p className="text-xs text-slate-600 italic mt-1 font-normal bg-slate-50 p-2.5 rounded-xl border border-slate-200 max-w-lg">
                        &ldquo;{b.notes}&rdquo;
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Actions & Status */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 shrink-0">
                  <div className="space-y-1 text-left md:text-right">
                    <div className="flex items-center gap-1.5 text-xs text-slate-900 font-bold">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{formatDate(b.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <span>{formatTime(b.startDate)} - {formatTime(b.endDate)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`
                      inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold border capitalize
                      ${b.status === 'pending' && 'bg-amber-50 text-amber-700 border-amber-200'}
                      ${b.status === 'accepted' && 'bg-emerald-50 text-emerald-700 border-emerald-200'}
                      ${b.status === 'completed' && 'bg-slate-100 text-slate-700 border-slate-200'}
                      ${b.status === 'cancelled' && 'bg-rose-50 text-rose-700 border-rose-200'}
                    `}>
                      {b.status}
                    </span>

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
                        className="inline-flex items-center gap-1.5 rounded-xl nav-pill-active px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat</span>
                      </button>
                    )}

                    {b.status === 'completed' && b.rating === undefined && (
                      <button
                        onClick={() => setReviewBooking(b)}
                        className="inline-flex items-center gap-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-3 py-1.5 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span>Leave Review</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* Leave Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-6 shadow-2xl relative text-slate-900">
            <button
              onClick={() => setReviewBooking(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-lg text-slate-900">Rate & Review Caregiver</h2>
              <p className="text-xs text-slate-500">
                Share your feedback for {reviewBooking.caregiverFullName} regarding your completed care session.
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Rating Stars</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Review Comments</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details about punctuality, care quality, and experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl nav-pill-active px-5 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}