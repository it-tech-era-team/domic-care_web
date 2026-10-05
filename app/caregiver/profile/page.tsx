'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCareConnect } from '@/context/useCareConnect';
import MediaPicker from '@/components/MediaPicker';
import CaregiverBankDetailsForm from '@/components/CaregiverBankDetailsForm';
import {
  User, Mail, Phone, MapPin, Lock, Eye, EyeOff, ShieldCheck, AlertCircle,
  CheckCircle2, Clipboard, Stethoscope, Clock,
  ArrowRight, ArrowLeft, Plus, Trash, Building2
} from 'lucide-react';

export default function CaregiverProfilePage() {
  const router = useRouter();
  const { currentUser, caregivers, submitCaregiverApplication, updateCaregiverProfile, updateUserProfile, services, showToast } = useCareConnect();

  // Find existing caregiver details if any
  const existingProfile = useMemo(() => {
    return caregivers.find(cg => cg.id === currentUser?.id);
  }, [caregivers, currentUser]);

  // Main View Tab: 'account' vs 'professional' vs 'payouts'
  const [activeMainTab, setActiveMainTab] = useState<'account' | 'professional' | 'payouts'>('account');

  // --- Account & Security Settings State ---
  const [accountFullName, setAccountFullName] = useState('');
  const [accountEmail, setAccountEmail] = useState('');
  const [accountPhone, setAccountPhone] = useState('');
  const [accountAvatarUrl, setAccountAvatarUrl] = useState('');
  const [accountPassword, setAccountPassword] = useState('');
  const [accountConfirmPassword, setAccountConfirmPassword] = useState('');
  const [showAccountPassword, setShowAccountPassword] = useState(false);
  const [accountError, setAccountError] = useState('');
  const [isAccountSaved, setIsAccountSaved] = useState(false);
  const [isAccountSubmitting, setIsAccountSubmitting] = useState(false);

  // Sync Account state with currentUser when it loads/changes
  useEffect(() => {
    if (currentUser) {
      setAccountFullName(currentUser.fullName || '');
      setAccountEmail(currentUser.email || '');
      setAccountPhone(currentUser.phone || '');
      setAccountAvatarUrl(currentUser.avatarUrl || '');
    }
  }, [currentUser]);

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isAccountSubmitting) return;

    setAccountError('');

    if (accountPassword || accountConfirmPassword) {
      if (accountPassword !== accountConfirmPassword) {
        setAccountError('New password and confirm password do not match.');
        return;
      }
      if (accountPassword.length < 6) {
        setAccountError('Password must be at least 6 characters long.');
        return;
      }
    }

    setIsAccountSubmitting(true);

    const payload: any = {
      fullName: accountFullName.trim(),
      email: accountEmail.trim(),
      phone: accountPhone.trim(),
      avatarUrl: accountAvatarUrl,
    };

    if (accountPassword && accountPassword.trim().length >= 6) {
      payload.password = accountPassword.trim();
    }

    const success = await updateUserProfile(payload);

    // Also sync caregiver profile name & avatar if caregiver record exists
    if (existingProfile) {
      await updateCaregiverProfile({
        fullName: accountFullName.trim(),
        avatarUrl: accountAvatarUrl,
      });
    }

    setIsAccountSubmitting(false);

    if (success) {
      setIsAccountSaved(true);
      setAccountPassword('');
      setAccountConfirmPassword('');
      setTimeout(() => setIsAccountSaved(false), 3000);
    }
  };

  // --- Professional Profile Builder State ---
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isProfSaved, setIsProfSaved] = useState(false);
  const [isProfSubmitting, setIsProfSubmitting] = useState(false);

  // Step 1: Personal Details
  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [gender, setGender] = useState(existingProfile?.gender || 'Female');
  const [dob, setDob] = useState(existingProfile?.dob || '1990-01-01');
  const [address, setAddress] = useState(existingProfile?.address || '');
  const [city, setCity] = useState(existingProfile?.city || 'New York');

  // Step 2: Experience
  const [experienceYears, setExperienceYears] = useState(existingProfile?.experienceYears || 2);

  // Step 3: Services & Rate
  const [hourlyRate, setHourlyRate] = useState(existingProfile?.hourlyRate || 20);
  const [selectedServices, setSelectedServices] = useState<string[]>(existingProfile?.services || []);

  const servicesList = services.map(s => s.name);

  const handleServiceToggle = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  // Step 4: Availability
  const [availability, setAvailability] = useState(
    existingProfile?.availability || {
      Monday: { start: '09:00', end: '17:00', isAvailable: true },
      Tuesday: { start: '09:00', end: '17:00', isAvailable: true },
      Wednesday: { start: '09:00', end: '17:00', isAvailable: true },
      Thursday: { start: '09:00', end: '17:00', isAvailable: true },
      Friday: { start: '09:00', end: '17:00', isAvailable: true },
      Saturday: { start: '10:00', end: '14:00', isAvailable: false },
      Sunday: { start: '10:00', end: '14:00', isAvailable: false },
    }
  );

  const handleAvailabilityToggle = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isAvailable: !prev[day].isAvailable
      }
    }));
  };

  const handleTimeChange = (day: string, type: 'start' | 'end', val: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: val
      }
    }));
  };

  // Step 5: Verification Documents
  const [documents, setDocuments] = useState<{ id: string; type: string; fileUrl: string; status: 'pending' | 'approved' | 'rejected' }[]>(
    existingProfile?.documents || []
  );

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/caregivers/profile');
        if (res.ok) {
          const data = await res.json();
          if (data.profile) {
            const p = data.profile;
            setBio(p.bio || '');
            setGender(p.gender || 'Female');
            setDob(p.dob || '1990-01-01');
            setAddress(p.address || '');
            setCity(p.city || 'New York');
            setExperienceYears(p.experienceYears || 2);
            setHourlyRate(p.hourlyRate || 20);
            if (p.services && p.services.length > 0) setSelectedServices(p.services);
            if (p.availability && Object.keys(p.availability).length > 0) setAvailability(p.availability);
            setDocuments(p.documents || []);
          }
        }
      } catch (err) {
        console.error('Error fetching caregiver profile:', err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (existingProfile?.documents && existingProfile.documents.length > 0 && documents.length === 0) {
      setDocuments(existingProfile.documents);
    }
  }, [existingProfile]);
  
  const [newDocType, setNewDocType] = useState('Nursing License');
  const [newDocUrl, setNewDocUrl] = useState('');

  const handleAddDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocUrl.trim()) return;

    const newDoc = {
      id: `doc-${Math.random().toString(36).substr(2, 9)}`,
      type: newDocType,
      fileUrl: newDocUrl.trim(),
      status: 'pending' as const,
    };

    setDocuments(prev => [...prev, newDoc]);
    setNewDocUrl('');
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const handleProfFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isProfSubmitting) return;

    setIsProfSubmitting(true);

    let finalDocs = [...documents];
    if (newDocUrl.trim()) {
      finalDocs.push({
        id: `doc-${Math.random().toString(36).substr(2, 9)}`,
        type: newDocType,
        fileUrl: newDocUrl.trim(),
        status: 'pending' as const,
      });
      setDocuments(finalDocs);
      setNewDocUrl('');
    }

    const updatedData = {
      fullName: currentUser.fullName,
      avatarUrl: currentUser.avatarUrl,
      bio,
      experienceYears: Number(experienceYears),
      hourlyRate: Number(hourlyRate),
      gender,
      dob,
      address,
      city,
      latitude: existingProfile?.latitude || 40.7128,
      longitude: existingProfile?.longitude || -74.0060,
      services: selectedServices,
      availability,
      documents: finalDocs,
    };

    const success = await submitCaregiverApplication(updatedData);
    setIsProfSubmitting(false);

    if (success) {
      setIsProfSaved(true);
      setTimeout(() => {
        setIsProfSaved(false);
        router.push('/caregiver/dashboard');
      }, 1800);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl w-full mx-auto animate-fade-in text-slate-900 pb-12">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Caregiver Settings & Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
          Manage your account credentials, avatar picture, password, or professional caregiver application.
        </p>
      </div>

      {/* Main Mode Tabs: Account Settings vs Professional Application */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl flex gap-2 font-bold text-xs shadow-xs">
        <button
          type="button"
          onClick={() => setActiveMainTab('account')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMainTab === 'account'
              ? 'bg-white text-blue-700 font-extrabold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="h-4 w-4 text-blue-600" />
          <span>Account & Security Settings</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMainTab('professional')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMainTab === 'professional'
              ? 'bg-white text-blue-700 font-extrabold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ShieldCheck className="h-4 w-4 text-blue-600" />
          <span>Caregiver Bio & Verification</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMainTab('payouts')}
          className={`flex-1 py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeMainTab === 'payouts'
              ? 'bg-white text-blue-700 font-extrabold shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="h-4 w-4 text-blue-600" />
          <span>Payout & Bank Details</span>
        </button>
      </div>

      {/* TAB 3: Payout & Bank Details */}
      {activeMainTab === 'payouts' && <CaregiverBankDetailsForm />}

      {/* TAB 1: Account & Security Settings */}
      {activeMainTab === 'account' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 text-slate-900 animate-fade-in">
          
          {isAccountSaved && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-xs font-bold text-emerald-700 border border-emerald-200 animate-fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>Account profile details and login password updated successfully!</span>
            </div>
          )}

          {accountError && (
            <div className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-700 border border-rose-200 animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
              <span>{accountError}</span>
            </div>
          )}

          <form onSubmit={handleAccountSubmit} className="space-y-8">
            
            {/* Avatar Header */}
            <div className="border-b border-slate-100 pb-6">
              <MediaPicker
                value={accountAvatarUrl}
                onChange={setAccountAvatarUrl}
                type="avatar"
                label="Profile Picture"
              />
            </div>

            {/* Section 1: Personal Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <User className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Personal Information</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="accountName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                    <input
                      type="text"
                      id="accountName"
                      required
                      value={accountFullName}
                      onChange={(e) => setAccountFullName(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="accountEmail" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                    <input
                      type="email"
                      id="accountEmail"
                      required
                      value={accountEmail}
                      onChange={(e) => setAccountEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="accountPhone" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                    <input
                      type="tel"
                      id="accountPhone"
                      required
                      value={accountPhone}
                      onChange={(e) => setAccountPhone(e.target.value)}
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
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900">Account Security & Password Update</h2>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Optional</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="accountNewPass" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                    <input
                      type={showAccountPassword ? 'text' : 'password'}
                      id="accountNewPass"
                      value={accountPassword}
                      onChange={(e) => setAccountPassword(e.target.value)}
                      placeholder="Leave blank to keep unchanged"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountPassword(!showAccountPassword)}
                      className="absolute top-3.5 right-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showAccountPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <label htmlFor="accountConfirmPass" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute top-3.5 left-3.5 h-4.5 w-4.5 text-blue-600" />
                    <input
                      type={showAccountPassword ? 'text' : 'password'}
                      id="accountConfirmPass"
                      value={accountConfirmPassword}
                      onChange={(e) => setAccountConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

              </div>
              <p className="text-[11px] text-slate-400 font-medium italic">
                Leave password fields empty if you only wish to update profile name, photo, or phone.
              </p>
            </div>

            <button
              type="submit"
              disabled={isAccountSubmitting}
              className="w-full sm:w-auto px-8 rounded-2xl nav-pill-active py-3.5 text-xs font-black text-white uppercase tracking-wider shadow-md shadow-blue-500/20 transition-all cursor-pointer block hover:scale-[1.02] active:scale-95 disabled:opacity-60"
            >
              {isAccountSubmitting ? 'Saving Updates...' : 'Save Account Settings'}
            </button>
          </form>

        </div>
      )}

      {/* TAB 2: Professional Profile & Application Builder */}
      {activeMainTab === 'professional' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Top Banner Status */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex justify-between items-center text-[10px] sm:text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${
                existingProfile?.approvalStatus === 'approved' ? 'bg-emerald-500 animate-pulse' :
                existingProfile?.approvalStatus === 'rejected' ? 'bg-rose-500' : 'bg-amber-400'
              }`} />
              <span className="capitalize text-slate-900">Verification Status: {existingProfile?.approvalStatus || 'Pending'}</span>
            </div>
            <span className="text-blue-600 font-extrabold uppercase tracking-wider text-[11px]">CNIC Audit & Background Verified</span>
          </div>

          {/* Stepper Progress bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex justify-between items-center text-[10px] sm:text-xs font-bold text-slate-600">
            {[
              { num: 1, name: 'Personal', icon: User },
              { num: 2, name: 'Experience', icon: Clipboard },
              { num: 3, name: 'Services', icon: Stethoscope },
              { num: 4, name: 'Availability', icon: Clock },
              { num: 5, name: 'Documents', icon: ShieldCheck },
            ].map((s) => {
              const Icon = s.icon;
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex items-center gap-1.5 sm:gap-2">
                  <div className={`
                    h-7 w-7 rounded-full flex items-center justify-center font-black text-xs transition-all
                    ${isActive && 'nav-pill-active text-white shadow-md shadow-blue-500/20 scale-105'}
                    ${isDone && 'bg-emerald-500 text-white shadow-xs'}
                    ${!isActive && !isDone && 'bg-slate-100 text-slate-500 border border-slate-200'}
                  `}>
                    {isDone ? '✓' : s.num}
                  </div>
                  <span className={`hidden sm:inline font-bold ${isActive ? 'text-blue-600 font-black' : isDone ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Saving Alert */}
          {isProfSaved && (
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 border border-emerald-200 text-xs font-bold text-emerald-800 animate-fade-in shadow-xs">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
              <span>Caregiver profile saved! Application submitted for administrator audit...</span>
            </div>
          )}

          {/* Form Content card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 min-h-[350px]">
            
            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-200 pb-2.5">
                  Step 1: Bio & Address Details
                </h3>

                <div className="space-y-1.5">
                  <label htmlFor="bio" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Biography / Care Intro</label>
                  <textarea
                    id="bio"
                    required
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Describe your caregiving background, qualifications, languages spoken, and senior care philosophy..."
                    rows={4}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    >
                      <option value="Female" className="bg-white text-slate-900">Female</option>
                      <option value="Male" className="bg-white text-slate-900">Male</option>
                      <option value="Other" className="bg-white text-slate-900">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Date of Birth</label>
                    <input
                      type="date"
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Residential Street Address</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 123 Health Ave, Medical District"
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">City</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Experience */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-200 pb-2.5">
                  Step 2: Experience & Qualifications
                </h3>

                <div className="space-y-1.5">
                  <label htmlFor="exp" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Years of Experience</label>
                  <input
                    type="number"
                    id="exp"
                    required
                    min="0"
                    max="40"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Qualifications & Certifications Summary</label>
                  <textarea
                    placeholder="e.g. CPR Certified, Licensed Practical Nurse (LPN), Alzheimer Care Specialization"
                    rows={3}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Services & Hourly Rate */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-200 pb-2.5">
                  Step 3: Services Offered & Hourly Rate
                </h3>

                <div className="space-y-1.5">
                  <label htmlFor="rate" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Hourly Rate ($ USD)</label>
                  <input
                    type="number"
                    id="rate"
                    required
                    min="10"
                    max="100"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(Number(e.target.value))}
                    className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Care Services</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {servicesList.map((service) => {
                      const isChecked = selectedServices.includes(service);
                      return (
                        <button
                          key={service}
                          type="button"
                          onClick={() => handleServiceToggle(service)}
                          className={`
                            rounded-2xl border p-4 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer shadow-xs
                            ${isChecked
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'}
                          `}
                        >
                          <span>{service}</span>
                          <span className={`
                            h-5 w-5 rounded-lg border flex items-center justify-center text-[10px] font-black
                            ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white text-slate-400'}
                          `}>
                            {isChecked ? '✓' : ''}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Availability Toggles */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-200 pb-2.5">
                  Step 4: Weekly Working Availability
                </h3>

                <div className="space-y-3">
                  {Object.entries(availability).map(([day, slot]) => (
                    <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-slate-50 shadow-xs">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleAvailabilityToggle(day)}
                          className={`
                            rounded-xl px-3 py-1 text-[10px] font-black uppercase cursor-pointer transition-all shadow-xs
                            ${slot.isAvailable ? 'nav-pill-active text-white' : 'bg-slate-200 text-slate-600 border border-slate-300'}
                          `}
                        >
                          {slot.isAvailable ? 'Available' : 'Unavailable'}
                        </button>
                        <span className="font-extrabold text-slate-900 text-xs">{day}</span>
                      </div>

                      {slot.isAvailable && (
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-slate-900 font-semibold focus:outline-none"
                          />
                          <span className="text-slate-400 font-bold">-</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                            className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-slate-900 font-semibold focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Verification Documents */}
            {step === 5 && (
              <div className="space-y-5">
                <h3 className="font-heading font-black text-base text-slate-900 border-b border-slate-200 pb-2.5">
                  Step 5: Verification Credentials
                </h3>

                <div className="space-y-2">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Uploaded Verification Files</span>
                  {documents.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No verification files uploaded yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50 flex items-center justify-between text-xs shadow-xs">
                          <div>
                            <span className="block font-black text-slate-900">{doc.type}</span>
                            <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline font-mono">
                              View Uploaded Document URL
                            </a>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`
                              text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider
                              ${doc.status === 'pending' && 'bg-amber-50 text-amber-800 border-amber-200'}
                              ${doc.status === 'approved' && 'bg-emerald-50 text-emerald-800 border-emerald-200'}
                              ${doc.status === 'rejected' && 'bg-rose-50 text-rose-800 border-rose-200'}
                            `}>
                              {doc.status}
                            </span>
                            <button
                              onClick={() => handleRemoveDocument(doc.id)}
                              className="text-rose-600 hover:text-rose-700 p-1.5 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-5 border border-dashed border-slate-300 rounded-3xl bg-slate-50 space-y-4 shadow-xs">
                  <span className="block text-xs font-bold text-slate-900 uppercase tracking-wider">Add New Verification File</span>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">Document Type</label>
                      <select
                        value={newDocType}
                        onChange={(e) => setNewDocType(e.target.value)}
                        className="w-full rounded-2xl border border-slate-300 bg-white p-3 text-xs font-semibold text-slate-900 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="CNIC / Identity Card" className="bg-white text-slate-900">CNIC / Identity Card</option>
                        <option value="Nursing License" className="bg-white text-slate-900">Nursing License</option>
                        <option value="Care Certificate" className="bg-white text-slate-900">Care Certificate</option>
                        <option value="Degree / Diploma" className="bg-white text-slate-900">Degree / Diploma</option>
                      </select>
                    </div>

                    <MediaPicker
                      value={newDocUrl}
                      onChange={setNewDocUrl}
                      type="document"
                      label="Document Verification File"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDocument}
                    className="rounded-2xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2.5 text-xs font-black inline-flex items-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add verification document</span>
                  </button>
                </div>
              </div>
            )}

            {/* Stepper Control Buttons */}
            <div className="flex justify-between items-center border-t border-slate-200 pt-6">
              {step > 1 ? (
                <button
                  onClick={() => setStep((s) => (s - 1) as any)}
                  className="rounded-2xl border border-slate-200 bg-slate-100 hover:bg-slate-200 px-5 py-3 text-xs font-bold text-slate-700 shadow-xs inline-flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <ArrowLeft className="h-4 w-4 text-blue-600" />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button
                  onClick={() => setStep((s) => (s + 1) as any)}
                  className="rounded-2xl nav-pill-active px-6 py-3 text-xs font-black text-white shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer ml-auto uppercase tracking-wider active:scale-95 transition-all"
                >
                  <span>Continue</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleProfFormSubmit}
                  disabled={isProfSubmitting}
                  className={`
                    rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-6 py-3 text-xs font-black text-white shadow-md shadow-blue-500/20 inline-flex items-center gap-2 cursor-pointer ml-auto uppercase tracking-wider active:scale-95 transition-all
                    ${isProfSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  <span>{isProfSubmitting ? 'Saving Application...' : 'Submit Application'}</span>
                  {isProfSubmitting ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
