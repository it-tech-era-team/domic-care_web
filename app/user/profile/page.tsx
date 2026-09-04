'use client';

import React, { useState, useEffect } from 'react';
import { useCareConnect } from '@/context/useCareConnect';
import MediaPicker from '@/components/MediaPicker';
import { User, Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function UserProfileEdit() {
  const { currentUser, updateUserProfile } = useCareConnect();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Sync state with currentUser when it loads/changes
  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.fullName || '');
      setEmail(currentUser.email || '');
      setPhone(currentUser.phone || '');
      setAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const success = await updateUserProfile({
      fullName,
      email,
      phone,
      avatarUrl,
    });

    if (success) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-2xl w-full mx-auto animate-fade-in text-white">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          My Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1">
          Manage your personal details and family primary contact settings.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="dark-panel bg-[#111433] rounded-3xl border border-white/12 p-6 sm:p-8 shadow-2xl space-y-6">
        
        {isSaved && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/20 p-3.5 text-xs font-bold text-emerald-300 border border-emerald-400/30 animate-fade-in">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Header */}
          <div className="border-b border-white/10 pb-6">
            <MediaPicker
              value={avatarUrl}
              onChange={setAvatarUrl}
              type="avatar"
              label="Profile Avatar"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label htmlFor="name" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-purple-400" />
                <input
                  type="text"
                  id="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-[#171b42] pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-purple-400" />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-[#171b42] pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Phone Number</label>
              <div className="relative">
                <Phone className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-purple-400" />
                <input
                  type="tel"
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-white/15 bg-[#171b42] pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Primary Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Primary Care Area</label>
              <div className="relative">
                <MapPin className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-purple-400" />
                <input
                  type="text"
                  defaultValue="Manhattan, New York"
                  className="w-full rounded-2xl border border-white/15 bg-[#171b42] pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-8 rounded-2xl nav-pill-active py-3.5 text-xs font-black text-white uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all cursor-pointer block hover:scale-[1.02] active:scale-95"
          >
            Save Profile Settings
          </button>
        </form>

      </div>

    </div>
  );
}

