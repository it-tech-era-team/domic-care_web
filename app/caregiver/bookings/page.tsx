'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCareConnect } from '@/context/useCareConnect';
import {
  Calendar, Clock, Star, AlertTriangle, CheckCircle2,
  XCircle, ChevronRight, MessageSquare, ClipboardList, MapPin
} from 'lucide-react';

export default function CaregiverBookings() {
  const router = useRouter();
  const { currentUser, bookings, updateBookingStatus, createConversation } = useCareConnect();

  // Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'completed' | 'cancelled'>('all');

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
        {(['all', 'accepted', 'completed', 'cancelled'] as const).map((tab) => (
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
            {tab === 'accepted' ? 'Active / Scheduled' : tab}
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
                  {b.rating !== undefined && (
                    <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl space-y-1 w-full max-w-md">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-900">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                        <span>Rating: {b.rating} / 5</span>
                      </div>
                      {b.comment && (
                        <p className="text-2xs text-slate-600 italic font-medium">
                          &ldquo;{b.comment}&rdquo;
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

                <div className="flex items-center gap-3">
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
                        onClick={() => updateBookingStatus(b.id, 'completed')}
                        disabled={new Date() < new Date(b.endDate)}
                        className={`rounded-xl px-3.5 py-1.5 text-[11px] font-black shadow-xs transition-all
                          ${
                            new Date() >= new Date(b.endDate)
                              ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer active:scale-95"
                              : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                          }`}
                      >
                        {new Date() < new Date(b.endDate) ? "In Progress" : "Mark Completed"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
}
