'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCareConnect, CaregiverProfile } from '@/context/useCareConnect';
import MediaPicker from '@/components/MediaPicker';
import {
  User, Clipboard, Stethoscope, Clock, ShieldCheck,
  CheckCircle2, ArrowRight, ArrowLeft, Upload, Plus, Trash
} from 'lucide-react';

export default function CaregiverProfileBuilder() {
  const router = useRouter();
  const { currentUser, caregivers, submitCaregiverApplication, services } = useCareConnect();

  // Find existing caregiver details if any
  const existingProfile = useMemo(() => {
    return caregivers.find(cg => cg.id === currentUser?.id);
  }, [caregivers, currentUser]);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [isSaved, setIsSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  // --- Step 1: Personal Details ---
  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [gender, setGender] = useState(existingProfile?.gender || 'Female');
  const [dob, setDob] = useState(existingProfile?.dob || '1990-01-01');
  const [address, setAddress] = useState(existingProfile?.address || '');
  const [city, setCity] = useState(existingProfile?.city || 'New York');

  // --- Step 2: Experience ---
  const [experienceYears, setExperienceYears] = useState(existingProfile?.experienceYears || 2);

  // --- Step 3: Services & Rate ---
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

  // --- Step 4: Availability ---
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

  // --- Step 5: Verification Documents ---
  const [documents, setDocuments] = useState<{ id: string; type: string; fileUrl: string; status: 'pending' | 'approved' | 'rejected' }[]>(
    existingProfile?.documents || []
  );

  // Fetch real profile from backend on mount to ensure freshness
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
      } finally {
        setIsLoadingProfile(false);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    setIsSubmitting(true);

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
    setIsSubmitting(false);

    if (success) {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        router.push('/caregiver/dashboard');
      }, 1800);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-2xl w-full mx-auto animate-fade-in">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Caregiver Profile Builder
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete these steps to register your caregiver application for verification.
        </p>
      </div>

      {/* Stepper Progress bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm flex justify-between items-center text-[10px] sm:text-xs font-bold text-slate-400">
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
            <div key={s.num} className="flex items-center gap-1 sm:gap-2">
              <div className={`
                h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs
                ${isActive && 'bg-blue-600 text-white shadow-md shadow-blue-500/20'}
                ${isDone && 'bg-teal-500 text-white'}
                ${!isActive && !isDone && 'bg-slate-100 text-slate-500'}
              `}>
                {isDone ? '✓' : s.num}
              </div>
              <span className={`hidden sm:inline ${isActive ? 'text-slate-900' : isDone ? 'text-teal-600' : ''}`}>
                {s.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Saving Alert */}
      {isSaved && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 p-4 border border-green-200 text-xs font-semibold text-green-700">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>Profile builder saved! forwarding application to administrator audits...</span>
        </div>
      )}

      {/* Form Content card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6 min-h-[350px]">
        
        {/* Step 1: Personal Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-50 pb-2">
              Step 1: Personal Information
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="bio" className="block text-xs font-bold text-slate-700">Biography / Experience Intro</label>
              <textarea
                id="bio"
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Describe your caregiving background, qualifications, what languages you speak, and how you care for elderly seniors..."
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Residential Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 123 Health Ave, Medical District"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-50 pb-2">
              Step 2: Experience & Work Details
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="exp" className="block text-xs font-bold text-slate-700">Years of Experience</label>
              <input
                type="number"
                id="exp"
                required
                min="0"
                max="40"
                value={experienceYears}
                onChange={(e) => setExperienceYears(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">Brief summary of certificates and qualifications</label>
              <textarea
                placeholder="e.g. CPR Certified, Licensed Practical Nurse (LPN), Alzheimer Association Training certified"
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>
        )}

        {/* Step 3: Services & Hourly Rate */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-50 pb-2">
              Step 3: Services & Pricing
            </h3>

            <div className="space-y-1.5">
              <label htmlFor="rate" className="block text-xs font-bold text-slate-700">Standard Hourly Rate ($ USD)</label>
              <input
                type="number"
                id="rate"
                required
                min="10"
                max="100"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Checklist of services */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Select services you provide</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {servicesList.map((service) => {
                  const isChecked = selectedServices.includes(service);
                  return (
                    <button
                      key={service}
                      type="button"
                      onClick={() => handleServiceToggle(service)}
                      className={`
                        rounded-xl border p-4 text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer
                        ${isChecked
                          ? 'border-blue-600 bg-blue-50/20 text-blue-700'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'}
                      `}
                    >
                      <span>{service}</span>
                      <span className={`
                        h-4 w-4 rounded-md border flex items-center justify-center text-[10px]
                        ${isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'}
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
            <h3 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-50 pb-2">
              Step 4: Availability Settings
            </h3>

            <div className="space-y-3">
              {Object.entries(availability).map(([day, slot]) => (
                <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleAvailabilityToggle(day)}
                      className={`
                        rounded-lg px-2.5 py-1 text-2xs font-bold uppercase cursor-pointer transition-colors
                        ${slot.isAvailable ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}
                      `}
                    >
                      {slot.isAvailable ? 'Available' : 'Unavailable'}
                    </button>
                    <span className="font-bold text-slate-800 text-xs">{day}</span>
                  </div>

                  {slot.isAvailable && (
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="time"
                        value={slot.start}
                        onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white p-1 text-slate-800 focus:outline-none"
                      />
                      <span className="text-slate-400 font-bold">-</span>
                      <input
                        type="time"
                        value={slot.end}
                        onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white p-1 text-slate-800 focus:outline-none"
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
            <h3 className="font-heading font-extrabold text-base text-slate-900 border-b border-slate-50 pb-2">
              Step 5: Verification Credentials
            </h3>

            {/* List of current uploaded documents */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-slate-700">Uploaded Documents</span>
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No verification files uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-3 border border-slate-100 rounded-2xl bg-slate-50 flex items-center justify-between text-xs">
                      <div>
                        <span className="block font-bold text-slate-800">{doc.type}</span>
                        <a href={doc.fileUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline">
                          View Uploaded Document URL
                        </a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`
                          text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase
                          ${doc.status === 'pending' && 'bg-amber-50 text-amber-700 border-amber-100'}
                          ${doc.status === 'approved' && 'bg-green-50 text-green-700 border-green-100'}
                          ${doc.status === 'rejected' && 'bg-red-50 text-red-700 border-red-100'}
                        `}>
                          {doc.status}
                        </span>
                        <button
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-red-500 hover:text-red-700 p-1 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          <Trash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Document Mock Upload Form */}
            <div className="p-4 border border-dashed border-slate-200 rounded-2xl bg-slate-50/20 space-y-4">
              <span className="block text-xs font-bold text-slate-700">Add New Document</span>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Document Type</label>
                  <select
                    value={newDocType}
                    onChange={(e) => setNewDocType(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white p-2.5 text-xs font-semibold"
                  >
                    <option value="CNIC / Identity Card">CNIC / Identity Card</option>
                    <option value="Nursing License">Nursing License</option>
                    <option value="Care Certificate">Care Certificate</option>
                    <option value="Degree / Diploma">Degree / Diploma</option>
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
                className="rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3.5 py-2 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Add verification document</span>
              </button>
            </div>
          </div>
        )}

        {/* Stepper Control Buttons */}
        <div className="flex justify-between items-center border-t border-slate-100 pt-6">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as any)}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              onClick={() => setStep((s) => (s + 1) as any)}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 inline-flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleFormSubmit}
              disabled={isSubmitting}
              className={`
                rounded-xl bg-teal-600 hover:bg-teal-700 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-teal-500/10 inline-flex items-center gap-1.5 cursor-pointer ml-auto
                ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              <span>{isSubmitting ? 'Saving Application...' : 'Submit Registration Application'}</span>
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
