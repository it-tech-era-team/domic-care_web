'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { useCareConnect, Booking } from '@/context/useCareConnect';
import {
  Calendar, Clock, Star, AlertTriangle, CheckCircle2,
  XCircle, ChevronRight, MessageSquare, ClipboardList, MapPin,
  Check, Loader2, X
} from 'lucide-react';

export default function CaregiverBookings() {
  const router = useRouter();
  const { currentUser, bookings, updateBookingStatus, createConversation, submitReview } = useCareConnect();

  // Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'accepted' | 'completed' | 'cancelled'>('all');

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'complete' | null>(null);

  // Rate Client Modal State
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewBooking || isSubmittingReview) return;
    setIsSubmittingReview(true);
    const success = await submitReview(reviewBooking.id, rating, comment);
    setIsSubmittingReview(false);
    if (success) {
      setReviewBooking(null);
      setComment('');
    }
  };

  const handleAccept = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    setActionType('accept');
    await updateBookingStatus(bookingId, 'awaiting_payment');
    setActionLoadingId(null);
    setActionType(null);
  };

  const handleDecline = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    setActionType('reject');
    await updateBookingStatus(bookingId, 'rejected');
    setActionLoadingId(null);
    setActionType(null);
  };

  const handleComplete = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    setActionType('complete');
    await updateBookingStatus(bookingId, 'completed');
    setActionLoadingId(null);
    setActionType(null);
  };

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4 bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500">Loading your jobs history...</p>
      </div>
    );
  }

  const caregiverBookings = bookings.filter(b => b.caregiverId === currentUser.id);

  const filteredBookings = useMemo(() => {
    return caregiverBookings.filter(b => {
      if (activeTab === 'all') return true;
      if (activeTab === 'cancelled') return b.status === 'cancelled' || b.status === 'rejected';
      return b.status === activeTab;
    });
  }, [bookings, activeTab]);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl w-full mx-auto animate-fade-in text-slate-900">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Assigned Jobs History
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          Review, complete, and track all your scheduled caregiver appointments.
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
                : 'border-transparent text-slate-500 hover:text-slate-900'}
            `}
          >
            {tab === 'pending' ? 'Pending Requests' : tab === 'accepted' ? 'Active / Scheduled' : tab}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3 shadow-xs">
            <div className="mx-auto h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="font-heading font-extrabold text-base text-slate-900">No Care Bookings Found</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You currently have no bookings matching the selected status filter.
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-6 text-slate-900"
            >
              {/* Left family details */}
              <div className="flex items-start gap-4">
                <img
                  src={b.userAvatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(b.userFullName || 'Client')}`}
                  alt={b.userFullName}
                  className="h-12 w-12 rounded-2xl object-cover border-2 border-slate-200 shadow-xs bg-slate-100 shrink-0"
                />
                <div className="space-y-1.5">
                  <span className="block font-black text-slate-900 text-base">Client: {b.userFullName}</span>
                  <span className="inline-flex rounded-lg bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
                    {b.serviceName} Care
                  </span>
                  
                  {b.notes && (
                    <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 border border-slate-200 rounded-xl p-3 max-w-lg mt-2">
                      <strong className="text-slate-900 font-bold">Client notes:</strong> &ldquo;{b.notes}&rdquo;
                    </p>
                  )}
                  {b.location && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span><strong className="text-slate-900 font-bold">Location:</strong> {b.location}</span>
                    </div>
                  )}

                  {/* Rating left by family */}
                  {b.status === 'completed' && (b.clientRating || b.rating) && (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl space-y-1 w-full max-w-md mt-2 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span>Client Review: {b.clientRating || b.rating} / 5</span>
                      </div>
                      {(b.clientComment || b.comment) && (
                        <p className="text-2xs text-slate-600 italic font-medium">
                          &ldquo;{b.clientComment || b.comment}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Rating left by caregiver for client */}
                  {b.status === 'completed' && b.caregiverRating && (
                    <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl space-y-1 w-full max-w-md mt-2 shadow-2xs">
                      <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900">
                        <Star className="h-3.5 w-3.5 fill-emerald-500 text-emerald-600" />
                        <span>Your Rating for Client: {b.caregiverRating} / 5</span>
                      </div>
                      {b.caregiverComment && (
                        <p className="text-2xs text-slate-600 italic font-medium">
                          &ldquo;{b.caregiverComment}&rdquo;
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Center schedule/status details */}
              <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between sm:justify-start gap-4 shrink-0">
                <div className="space-y-1 text-left md:text-right">
                  <div className="flex items-center gap-1.5 text-xs text-slate-900 font-black">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <span>{formatDate(b.startDate)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{formatTime(b.startDate)} - {formatTime(b.endDate)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Status Badge */}
                  <span className={`
                    inline-flex items-center gap-1 rounded-full px-3 py-1 text-[10px] font-bold border capitalize
                    ${b.status === 'pending' && 'bg-amber-50 text-amber-800 border-amber-200'}
                    ${b.status === 'accepted' && 'bg-emerald-50 text-emerald-800 border-emerald-200'}
                    ${b.status === 'awaiting_payment' && 'bg-emerald-50 text-emerald-800 border-emerald-200'}
                    ${b.status === 'completed' && 'bg-blue-50 text-blue-700 border-blue-200'}
                    ${b.status === 'cancelled' && 'bg-rose-50 text-rose-800 border-rose-200'}
                    ${b.status === 'rejected' && 'bg-rose-50 text-rose-800 border-rose-200'}
                  `}>
                    {b.status === 'pending' && 'Awaiting Your Approval'}
                    {b.status === 'accepted' && 'Scheduled'}
                    {b.status === 'awaiting_payment' && 'Scheduled'}
                    {b.status === 'completed' && 'Completed'}
                    {b.status === 'cancelled' && 'Cancelled by family'}
                    {b.status === 'rejected' && 'Declined by you'}
                  </span>

                  {/* Actions */}
                  {b.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        disabled={actionLoadingId === b.id}
                        onClick={() => handleDecline(b.id)}
                        className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 px-3.5 py-1.5 text-[11px] font-bold text-rose-700 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                      >
                        {actionLoadingId === b.id && actionType === 'reject' ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-rose-700" />
                            <span>Declining...</span>
                          </>
                        ) : (
                          <span>Decline</span>
                        )}
                      </button>

                      <button
                        disabled={actionLoadingId === b.id}
                        onClick={() => handleAccept(b.id)}
                        className="rounded-xl nav-pill-active text-white px-4 py-1.5 text-[11px] font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoadingId === b.id && actionType === 'accept' ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin text-white" />
                            <span>Accepting...</span>
                          </>
                        ) : (
                          <>
                            <Check size={13} />
                            <span>Accept</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {b.status === 'accepted' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const convId = await createConversation(currentUser.id);
                          if (convId) {
                            router.push(`/caregiver/messages?conv=${convId}`);
                          } else {
                            router.push('/caregiver/messages');
                          }
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl nav-pill-active px-3.5 py-1.5 text-[11px] font-black text-white transition-all cursor-pointer shadow-xs active:scale-95"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat with Client</span>
                      </button>

                      <button
                        onClick={() => handleComplete(b.id)}
                        disabled={actionLoadingId === b.id}
                        className="rounded-xl px-3.5 py-1.5 text-[11px] font-black shadow-xs transition-all inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {actionLoadingId === b.id && actionType === 'complete' && (
                          <Loader2 className="h-3 w-3 animate-spin text-white" />
                        )}
                        <span>
                          {actionLoadingId === b.id && actionType === 'complete'
                            ? "Completing..."
                            : "Mark Completed"}
                        </span>
                      </button>
                    </div>
                  )}

                  {b.status === 'completed' && (
                    <div className="flex flex-wrap items-center gap-2">
                      {/* 1. Caregiver's Rating of Client */}
                      {b.caregiverRating ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-extrabold text-emerald-800 shadow-2xs">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>You Rated Client: {b.caregiverRating}/5</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            setReviewBooking(b);
                            setRating(5);
                            setComment('');
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                        >
                          <Star className="h-3.5 w-3.5 fill-white text-white" />
                          <span>Rate Client</span>
                        </button>
                      )}

                      {/* 2. Client's Rating of Caregiver */}
                      {(b.clientRating || b.rating) ? (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-extrabold text-amber-800 shadow-2xs">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                          <span>Client Rated: {b.clientRating || b.rating}/5</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>Awaiting Client Rating</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Rate Client Modal - Attached to body via Portal for 100% viewport backdrop */}
      {mounted && reviewBooking && createPortal(
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-6 space-y-5 sm:space-y-6 shadow-2xl relative text-slate-900 my-auto animate-fade-in">
            <button
              onClick={() => setReviewBooking(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-1">
              <h2 className="font-heading font-extrabold text-lg text-slate-900">Rate & Review Client</h2>
              <p className="text-xs text-slate-500">
                Share your feedback for client <span className="font-bold text-slate-800">{reviewBooking.userFullName}</span> regarding this completed care session.
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
                <label className="block text-xs font-bold text-slate-700">Feedback Comments</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details about client communication, home environment, and experience..."
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
                  disabled={isSubmittingReview}
                  className="rounded-xl nav-pill-active px-5 py-2.5 text-xs font-bold text-white shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {isSubmittingReview && <Loader2 className="h-4 w-4 animate-spin text-white" />}
                  <span>{isSubmittingReview ? "Submitting..." : "Submit Client Review"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
