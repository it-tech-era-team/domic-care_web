'use client';

import React, { useState, useEffect } from 'react';
import { useCareConnect } from '@/context/useCareConnect';
import MediaPicker from '@/components/MediaPicker';
import LanguageSettingsCard from '@/components/LanguageSettingsCard';
import { User, Mail, Phone, MapPin, CheckCircle2, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';

export default function UserProfileEdit() {
  const { currentUser, updateUserProfile } = useCareConnect();

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [address, setAddress] = useState('');

  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
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
      const storedArea = typeof localStorage !== 'undefined'
        ? localStorage.getItem(`domiccare_user_primary_area_${currentUser.id}`)
        : null;
      setAddress((currentUser as any).address || storedArea || '');
    }
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    setFormError('');
    setPasswordError('');

    // Strict Validation: Avatar, Full Name, Phone, Primary Care Area are strictly required
    if (!avatarUrl || !avatarUrl.trim()) {
      setFormError('Profile avatar photo is strictly required. Please upload an avatar.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError('All profile fields (Full Name, Phone Number, and Primary Care Area) are strictly required.');
      return;
    }

    // If user filled password, validate match and length
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
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`domiccare_user_primary_area_${currentUser.id}`, address.trim());
      }
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
          My Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          Manage your personal details, avatar picture, and account login password.
        </p>
      </div>

      {/* Profile Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-900">
        
        {isSaved && (
          <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200 animate-fade-in">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <span>Profile details and account security settings saved successfully!</span>
          </div>
        )}

        {formError && (
          <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200 animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
            <span>{formError}</span>
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
              label="Profile Avatar Photo"
              required={true}
            />
          </div>

          {/* Section 1: Personal Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-4 w-4 text-blue-600" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Personal Contact Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Full Name <span className="text-red-500 font-black">*</span>
                </label>
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
                <label htmlFor="email" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Email Address <span className="text-[10px] text-slate-400 font-medium normal-case tracking-normal ml-1">(Cannot be changed)</span>
                </label>
                <div className="relative">
                  <Mail className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="email"
                    id="email"
                    disabled
                    readOnly
                    value={email}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-100 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-500 placeholder-slate-400 cursor-not-allowed select-none focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Phone Number <span className="text-red-500 font-black">*</span>
                </label>
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

              {/* Primary Care Area (Manual Text Input) */}
              <div className="space-y-1.5">
                <label htmlFor="primaryArea" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Primary Care Area <span className="text-red-500 font-black">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                  <input
                    type="text"
                    id="primaryArea"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Pleven, Bulgaria or Sofia, Center"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
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
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Account Security & Password Update</h2>
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPass"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-3.5 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
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
            {isSubmitting ? 'Saving Updates...' : 'Save Profile & Security Settings'}
          </button>
        </form>

        {/* Section 3: Language & Regional Preferences */}
        <LanguageSettingsCard />

      </div>

    </div>
  );
}
