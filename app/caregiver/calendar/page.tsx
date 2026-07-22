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
    <div className="space-y-6 sm:space-y-8 max-w-2xl w-full mx-auto animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Calendar Availability
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Adjust the days and times families can schedule slots for your services.
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        
        {isSaved && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-600 border border-green-100">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>Availability schedule updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-3.5">
            {Object.entries(availability).map(([day, slot]) => (
              <div
                key={day}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50"
              >
                {/* Check status */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggle(day)}
                    className={`
                      rounded-lg px-2.5 py-1 text-2xs font-bold uppercase transition-colors cursor-pointer
                      ${slot.isAvailable ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}
                    `}
                  >
                    {slot.isAvailable ? 'Active' : 'Offline'}
                  </button>
                  <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <CalendarDays className="h-4.5 w-4.5 text-slate-400" />
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
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 font-bold focus:outline-none"
                      />
                    </div>
                    <span className="text-slate-400 font-bold">to</span>
                    <div className="relative">
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-700 font-bold focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer block"
          >
            Save Calendar Block settings
          </button>
        </form>

      </div>

    </div>
  );
}
