'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCareConnect, Booking } from '@/context/useCareConnect';
import {
  Calendar, Clock, Star, AlertTriangle, CheckCircle2,
  XCircle, ChevronRight, MessageSquare
} from 'lucide-react';

export default function CaregiverBookings() {
  const router = useRouter();
  const { currentUser, bookings, updateBookingStatus, createConversation } = useCareConnect();

  // Tab State
  const [activeTab, setActiveTab] = useState<'all' | 'accepted' | 'completed' | 'cancelled'>('all');

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
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
    <div className="space-y-6 sm:space-y-8 max-w-4xl w-full mx-auto animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Assigned Jobs History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
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
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-400 hover:text-slate-600'}
            `}
          >
            {tab === 'accepted' ? 'Active / Scheduled' : tab}
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
            <h3 className="font-bold text-slate-800">No Jobs Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              No appointments are recorded under the selected status query.
            </p>
          </div>
        ) : (
          filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-start justify-between gap-6"
            >
              {/* Left family details */}
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
                  {b.userFullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="space-y-1.5">
                  <span className="block font-bold text-slate-900 text-sm">Client: {b.userFullName}</span>
                  <span className="inline-flex rounded-lg bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-100">
                    {b.serviceName} Care
                  </span>
                  
                  {b.notes && (
                    <p className="text-xs text-slate-500 leading-relaxed font-normal bg-slate-50 border border-slate-100/50 rounded-xl p-2.5 max-w-lg">
                      <strong>Client notes:</strong> &ldquo;{b.notes}&rdquo;
                    </p>
                  )}

                  {/* Rating left by family */}
                  {b.rating !== undefined && (
                    <div className="bg-amber-50 border border-amber-100/60 p-2.5 rounded-xl space-y-1 w-full max-w-md">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-800">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>Rating: {b.rating} / 5</span>
                      </div>
                      {b.comment && (
                        <p className="text-2xs text-slate-500 italic font-medium">
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
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
                    <Calendar className="h-4 w-4 text-slate-400" />
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
                    inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold border capitalize
                    ${b.status === 'pending' && 'bg-amber-50 text-amber-700 border-amber-100'}
                    ${b.status === 'accepted' && 'bg-green-50 text-green-700 border-green-100'}
                    ${b.status === 'completed' && 'bg-slate-50 text-slate-600 border-slate-100'}
                    ${b.status === 'cancelled' && 'bg-red-50 text-red-700 border-red-100'}
                    ${b.status === 'rejected' && 'bg-red-50 text-red-700 border-red-100'}
                  `}>
                    {b.status === 'pending' && 'Awaiting Your Approval'}
                    {b.status === 'accepted' && 'Scheduled'}
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
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat with Client</span>
                      </button>

                      <button
                        onClick={() => updateBookingStatus(b.id, 'completed')}
                        className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-[11px] font-bold shadow-sm transition-all cursor-pointer"
                      >
                        Mark Completed
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
