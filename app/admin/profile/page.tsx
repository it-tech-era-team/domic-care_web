'use client';

import React, { useState, useEffect } from 'react';
import { useCareConnect } from '@/context/useCareConnect';
import MediaPicker from '@/components/MediaPicker';
import {
  User, Mail, Phone, Lock, Eye, EyeOff, ShieldCheck,
  AlertCircle, CheckCircle2, Shield
} from 'lucide-react';

export default function AdminProfilePage() {
  const { currentUser, updateUserProfile } = useCareConnect();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!currentUser || isSubmitting) return;

    setPasswordError('');

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setPasswordError('New password and confirm password do not match.');
        return;
      }
      if (newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsSubmitting(true);

    const payload: any = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      avatarUrl,
    };

    if (newPassword && newPassword.trim().length >= 6) {
      payload.password = newPassword.trim();
    }

    const success = await updateUserProfile(payload);

    setIsSubmitting(false);

    if (success) {
      setIsSaved(true);
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-2xl w-full mx-auto animate-fade-in text-slate-900 pb-12">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Admin Profile & Security
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          Manage your administrator profile details, avatar picture, and master access password.
        </p>
      </div>

      {/* Role Badge */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex justify-between items-center text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="block text-slate-900 font-black">System Administrator</span>
            <span className="text-[10px] text-slate-500 font-semibold">Full System Privileges & Controls</span>
          </div>
        </div>
        <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
          Super Admin
        </span>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-900">
        
        {isSaved && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Administrator profile and security password saved successfully!</span>
          </div>
        )}

        {passwordError && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200 animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Avatar Header */}
          <div className="border-b border-slate-100 pb-6">
            <MediaPicker
              value={avatarUrl}
              onChange={setAvatarUrl}
              type="avatar"
              label="Admin Avatar Photo"
            />
          </div>

          {/* Section 1: Administrator Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Administrator Contact Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                  <input
                    type="text"
                    id="name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                  <input
                    type="email"
                    id="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5 sm:col-span-2">
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Section 2: Security & Password Update */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Admin Account Password Update</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* New Password */}
              <div className="space-y-1.5">
                <label htmlFor="newPass" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="newPass"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Leave blank to keep unchanged"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-3.5 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPass" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPass"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

            </div>
            <p className="text-[11px] text-slate-400 font-medium italic">
              Leave password fields empty if you only wish to update profile details.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 rounded-2xl nav-pill-active py-3.5 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all cursor-pointer block hover:scale-[1.02] active:scale-95 disabled:opacity-60"
          >
            {isSubmitting ? 'Saving Updates...' : 'Save Admin Profile Settings'}
          </button>
        </form>

      </div>

    </div>
  );
}
