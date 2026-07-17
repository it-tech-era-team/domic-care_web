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
    <div className="space-y-6 sm:space-y-8 max-w-2xl w-full mx-auto animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your personal details and family primary contact settings.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
        
        {isSaved && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-600 border border-green-100 animate-fade-in">
            <CheckCircle2 className="h-4.5 w-4.5 shrink-0" />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Avatar Header */}
          <div className="border-b border-slate-100 pb-6">
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
              <label htmlFor="name" className="block text-xs font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  id="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label htmlFor="phone" className="block text-xs font-bold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="tel"
                  id="phone"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Primary Address */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Primary Care Area</label>
              <div className="relative">
                <MapPin className="absolute top-3 left-3 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="text"
                  defaultValue="Manhattan, New York"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

          </div>

          <button
            type="submit"
            className="w-full sm:w-auto px-6 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 transition-all cursor-pointer block"
          >
            Save Profile Settings
          </button>
        </form>

      </div>

    </div>
  );
}
