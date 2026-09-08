'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useCareConnect } from '@/context/useCareConnect';
import { CalendarDays, Clock, CheckCircle2 } from 'lucide-react';

export default function CaregiverCalendar() {
  const { currentUser, caregivers, updateCaregiverProfile } = useCareConnect();

  const profile = useMemo(() => {
    return caregivers.find(cg => cg.id === currentUser?.id);
  }, [caregivers, currentUser]);

  const [availability, setAvailability] = useState<Record<string, { start: string; end: string; isAvailable: boolean }>>({
    Monday: { start: '09:00', end: '17:00', isAvailable: true },
    Tuesday: { start: '09:00', end: '17:00', isAvailable: true },
    Wednesday: { start: '09:00', end: '17:00', isAvailable: true },
    Thursday: { start: '09:00', end: '17:00', isAvailable: true },
    Friday: { start: '09:00', end: '17:00', isAvailable: true },
    Saturday: { start: '10:00', end: '14:00', isAvailable: false },
    Sunday: { start: '10:00', end: '14:00', isAvailable: false },
  });

  const [isSaved, setIsSaved] = useState(false);

  // Sync state once profile is loaded from backend
  useEffect(() => {
    if (profile?.availability) {
      setAvailability(profile.availability);
    }
  }, [profile]);

  if (!currentUser) {
    return (
      <div className="flex flex-col h-[60vh] items-center justify-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold text-slate-500">Loading your calendar settings...</p>
      </div>
    );
  }

  const handleToggle = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], isAvailable: !prev[day].isAvailable }
    }));
  };

  const handleTimeChange = (day: string, type: 'start' | 'end', val: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: val }
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCaregiverProfile({ availability });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-2xl w-full mx-auto animate-fade-in text-slate-900">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          My Calendar Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          Adjust the days and times families can schedule slots for your services.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        
        {isSaved && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 border border-emerald-200 animate-fade-in shadow-xs">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600" />
            <span>Availability schedule updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          <div className="space-y-3.5">
            {Object.entries(availability).map(([day, slot]) => (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50 shadow-xs transition-all hover:border-slate-300"
              >
                {/* Check status */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(day)}
                    className={`
                      rounded-xl px-3 py-1 text-[10px] font-black uppercase transition-all cursor-pointer shadow-xs
                      ${slot.isAvailable ? 'nav-pill-active text-white' : 'bg-slate-200 text-slate-600 border border-slate-300'}
                    `}
                  >
                    {slot.isAvailable ? 'Active' : 'Offline'}
                  </button>
                  <span className="font-black text-slate-900 text-sm flex items-center gap-2">
                    <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
                    <span>{day}</span>
                  </span>
                </div>

                {/* Time picker */}
                {slot.isAvailable && (
                  <div className="flex items-center gap-2 text-xs">
                    <div className="relative">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-slate-900 font-extrabold focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <span className="text-slate-400 font-bold uppercase text-[10px]">to</span>
                    <div className="relative">
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                        className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-slate-900 font-extrabold focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 rounded-2xl nav-pill-active py-3.5 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all cursor-pointer block hover:scale-[1.02] active:scale-95"
          >
            Save Calendar Block settings
          </button>
        </form>

      </div>

    </div>
  );
}

