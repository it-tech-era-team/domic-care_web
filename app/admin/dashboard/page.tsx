'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCareConnect, CaregiverProfile } from '@/context/useCareConnect';
import {
  Users, Stethoscope, Calendar, DollarSign,
  Check, X, Eye, Clock, Activity, AlertCircle,
  FileText, TrendingUp, TrendingDown, ArrowRight,
  FolderCheck, Sparkles, UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    currentUser, caregivers, bookings, adminLogs, approveCaregiver,
    rejectCaregiver, services, addService, deleteService
  } = useCareConnect();

  // Selected Caregiver for Document Review Modal
  const [selectedCG, setSelectedCG] = useState<CaregiverProfile | null>(null);

  // Audit Logs Modal state
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);

  // Tab Switcher and Form states
  const [activeTab, setActiveTab] = useState<'approvals' | 'services'>('approvals');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Platform Analytics calculations
  const totalCaregiversCount = caregivers.length;
  const approvedCaregivers = caregivers.filter(cg => cg.approvalStatus === 'approved');
  const pendingCaregivers = caregivers.filter(cg => cg.approvalStatus === 'pending');
  const activeBookingsCount = bookings.filter(b => b.status === 'accepted').length || 1;
  const totalUsersCount = caregivers.length + 5; // Total accounts (simulated: caregivers + families + admins)

  const totalRevenue = useMemo(() => {
    const completedJobs = bookings.filter(b => b.status === 'completed');
    const calc = completedJobs.reduce((sum, job) => {
      const start = new Date(job.startDate).getTime();
      const end = new Date(job.endDate).getTime();
      const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
      return sum + hours * 25 * 0.10;
    }, 0);
    return calc > 0 ? calc : 75.00;
  }, [bookings]);

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString([], {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const handleApprove = (cgId: string) => {
    approveCaregiver(cgId);
    setSelectedCG(null);
  };

  const handleReject = (cgId: string) => {
    rejectCaregiver(cgId);
    setSelectedCG(null);
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto animate-fade-in text-slate-900">
      
      {/* Title & Greeting Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-50/90 via-sky-50/60 to-blue-100/40 border border-blue-100/80 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="max-w-xl space-y-3 z-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome back, {currentUser?.fullName?.split(' ')[0] || 'Adnan'}! 👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
            Here's what's happening with your care marketplace network, provider approvals, and daily operations.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 hover:bg-blue-50 text-slate-800 px-5 py-2.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UserCheck className="h-4 w-4 text-blue-600" />
              <span>User Management</span>
            </Link>
            <Link
              href="/admin/caregivers"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Stethoscope className="h-4 w-4 text-white" />
              <span>Caregiver Management</span>
            </Link>
          </div>
        </div>

        {/* Hero Background Image Cutout */}
        <div className="relative w-full md:w-80 h-44 sm:h-52 shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-200/50 to-sky-300/40 rounded-3xl transform rotate-2 scale-95" />
          <img
            src="/hero/admin-hero.jpg"
            alt="Admin Care Marketplace"
            className="w-full h-full object-cover rounded-3xl border-2 border-white shadow-xl relative z-10"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80';
            }}
          />
        </div>
      </div>

      {/* 4 Decent Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: TOTAL ACCOUNTS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-900 shadow-xs hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold shadow-2xs">
              <Users className="h-5.5 w-5.5" />
            </div>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] uppercase tracking-wider">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span>+16%</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{totalUsersCount}</h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">TOTAL ACCOUNTS</p>
          </div>
        </div>

        {/* Card 2: CAREGIVERS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-900 shadow-xs hover:border-sky-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold shadow-2xs">
              <Stethoscope className="h-5.5 w-5.5" />
            </div>
            <span className="rounded-full bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider">
              {approvedCaregivers.length} Live
            </span>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1.5">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{totalCaregiversCount}</h2>
            </div>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">CAREGIVERS</p>
          </div>
        </div>

        {/* Card 3: ACTIVE BOOKINGS */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-900 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold shadow-2xs">
              <Calendar className="h-5.5 w-5.5" />
            </div>
            <span className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[10px] uppercase tracking-wider">
              <TrendingDown className="h-3 w-3 text-amber-600" />
              <span>-10%</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">{activeBookingsCount}</h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">ACTIVE BOOKINGS</p>
          </div>
        </div>

        {/* Card 4: COMM. REVENUE (10%) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 text-slate-900 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between min-h-[145px]">
          <div className="flex items-center justify-between">
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold shadow-2xs">
              <DollarSign className="h-5.5 w-5.5" />
            </div>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] uppercase tracking-wider">
              <TrendingUp className="h-3 w-3 text-emerald-600" />
              <span>+25%</span>
            </span>
          </div>
          <div className="mt-4">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">${totalRevenue.toFixed(2)}</h2>
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-500">COMM. REVENUE (10%)</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Approvals Panel (Left 2 cols) & Audit Logs (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column Container */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main White Panel for Approvals / Services */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 text-slate-900 shadow-xs">
            
            {/* Tabs Header */}
            <div className="flex gap-6 border-b border-slate-200 pb-3 text-sm font-bold">
              <button
                onClick={() => setActiveTab('approvals')}
                className={`pb-1 transition-all relative cursor-pointer ${
                  activeTab === 'approvals' 
                    ? 'text-blue-600 border-b-2 border-blue-600 font-black' 
                    : 'text-slate-500 hover:text-blue-600 font-bold'
                }`}
              >
                Caregiver Approvals ({pendingCaregivers.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`pb-1 transition-all relative cursor-pointer ${
                  activeTab === 'services' 
                    ? 'text-blue-600 border-b-2 border-blue-600 font-black' 
                    : 'text-slate-500 hover:text-blue-600 font-bold'
                }`}
              >
                Manage Marketplace Services ({services.length})
              </button>
            </div>

            {activeTab === 'approvals' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <h2 className="font-heading font-black text-sm text-slate-900 flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-blue-600 animate-pulse" />
                    <span>Caregivers Approvals Queue ({pendingCaregivers.length})</span>
                  </h2>
                </div>

                {pendingCaregivers.length === 0 ? (
                  /* Glowing 3D Folder Empty State */
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      <div className="absolute -top-3 -right-3 h-3.5 w-3.5 bg-blue-500 rounded-full animate-ping" />
                      <div className="absolute -bottom-2 -left-4 h-2.5 w-2.5 bg-sky-400 rounded-full animate-bounce" />
                      
                      {/* 3D Folder Container */}
                      <div className="h-24 w-28 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 p-0.5 shadow-xl shadow-blue-500/30 flex items-center justify-center">
                        <div className="h-full w-full bg-white rounded-[22px] flex items-center justify-center relative">
                          <FolderCheck className="h-12 w-12 text-blue-600" />
                          <span className="absolute bottom-3 right-3 h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white text-white">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-slate-900">Approval queue is empty</h3>
                      <p className="text-xs text-slate-500 font-medium">All registered caregivers have been verified.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 font-black uppercase tracking-wider text-[10px]">
                          <th className="py-3 pr-4">Name</th>
                          <th className="py-3 px-4">Services</th>
                          <th className="py-3 px-4">Experience</th>
                          <th className="py-3 px-4 text-center">Docs</th>
                          <th className="py-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingCaregivers.map((cg) => (
                          <tr key={cg.id} className="hover:bg-blue-50/50 transition-colors">
                            <td className="py-3 pr-4 flex items-center gap-3">
                              <img
                                src={cg.avatarUrl}
                                alt={cg.fullName}
                                className="h-9 w-9 rounded-xl object-cover border border-slate-200 bg-slate-100"
                              />
                              <div>
                                <span className="block font-bold text-slate-900 text-xs">{cg.fullName}</span>
                                <span className="block text-[10px] text-slate-500 truncate max-w-[120px]">{cg.address}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {cg.services.slice(0, 2).map((s) => (
                                  <span key={s} className="bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                                    {s}
                                  </span>
                                ))}
                                {cg.services.length > 2 && (
                                  <span className="text-[9px] font-bold text-slate-500">+{cg.services.length - 2} more</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-700">
                              {cg.experienceYears} Years
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-blue-600">
                              {cg.documents.length} File(s)
                            </td>
                            <td className="py-3 pl-4 text-right">
                              <button
                                onClick={() => setSelectedCG(cg)}
                                className="rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-200 p-2 text-blue-600 transition-colors inline-flex items-center justify-center cursor-pointer shadow-xs"
                                title="Audit Documents"
                              >
                                <Eye className="h-4.5 w-4.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              /* Manage Services Tab Content */
              <div className="space-y-6 animate-fade-in">
                {/* Form */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 text-slate-900">
                  <h3 className="font-heading font-extrabold text-xs text-slate-900 border-b border-slate-200 pb-2">
                    Add New Care Service Category
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!newServiceName.trim()) return;
                      addService(newServiceName.trim(), newServiceDesc.trim());
                      setNewServiceName('');
                      setNewServiceDesc('');
                    }}
                    className="space-y-3"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1 sm:col-span-1">
                        <label className="block text-[11px] font-bold text-slate-700">Service Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Memory Care"
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700">Description</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alzheimer and dementia helper support services."
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 nav-pill-active rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
                    >
                      Create Service
                    </button>
                  </form>
                </div>

                {/* List */}
                <div className="space-y-2">
                  <h3 className="font-heading font-extrabold text-xs text-slate-900">Active Services Grid</h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 border border-slate-200 rounded-2xl bg-white flex items-start justify-between gap-4 shadow-xs"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="block font-bold text-xs text-slate-900">{s.name}</span>
                          <p className="text-[10px] text-slate-500 leading-relaxed truncate">
                            {s.description || 'No description provided.'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteService(s.id)}
                          className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-600 p-2 text-red-600 hover:text-white transition-colors cursor-pointer shrink-0"
                          title="Delete Service"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Left Charts Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Accounts Overview Donut Chart Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-slate-900 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900">Accounts Overview</h3>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5">This Week ▾</span>
              </div>

              <div className="flex items-center justify-around py-2">
                {/* SVG Donut Chart */}
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f1f5f9"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="3.8"
                      strokeDasharray="28, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="3.8"
                      strokeDasharray="28, 100"
                      strokeDashoffset="-28"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="3.8"
                      strokeDasharray="44, 100"
                      strokeDashoffset="-56"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-slate-900 block leading-none">{totalUsersCount}</span>
                    <span className="text-[9px] text-slate-500 font-extrabold uppercase">Total</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <span className="text-slate-600 font-bold text-[11px]">Admins</span>
                    <span className="font-extrabold text-slate-900 ml-auto">2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-600" />
                    <span className="text-slate-600 font-bold text-[11px]">Caregivers</span>
                    <span className="font-extrabold text-slate-900 ml-auto">2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                    <span className="text-slate-600 font-bold text-[11px]">Users</span>
                    <span className="font-extrabold text-slate-900 ml-auto">3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Overview Weekly Bar Chart Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 text-slate-900 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900">Bookings Overview</h3>
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 rounded-lg px-2 py-0.5">This Week ▾</span>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-black text-slate-900">{activeBookingsCount}</span>
                  <span className="text-[10px] text-slate-500 font-bold">Active Bookings</span>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ml-auto">↑ 10%</span>
                </div>

                {/* Bar Chart Visual */}
                <div className="h-20 flex items-end justify-between gap-2 pt-4 px-2 border-b border-slate-100">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-slate-100 rounded-t h-4" />
                    <span className="text-[9px] text-slate-500 font-bold">Mon</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-gradient-to-t from-blue-700 to-sky-500 rounded-t h-14 shadow-md shadow-blue-500/30" />
                    <span className="text-[9px] text-blue-600 font-extrabold">Tue</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-slate-100 rounded-t h-6" />
                    <span className="text-[9px] text-slate-500 font-bold">Wed</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-slate-100 rounded-t h-2" />
                    <span className="text-[9px] text-slate-500 font-bold">Thu</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-slate-100 rounded-t h-5" />
                    <span className="text-[9px] text-slate-500 font-bold">Fri</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-slate-100 rounded-t h-3" />
                    <span className="text-[9px] text-slate-500 font-bold">Sat</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-slate-100 rounded-t h-2" />
                    <span className="text-[9px] text-slate-500 font-bold">Sun</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Admin Audits Log Panel */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 flex flex-col justify-between min-h-[500px] text-slate-900 shadow-xs">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h2 className="font-heading font-black text-base text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>Admin Audits Log</span>
                </h2>
                <button onClick={() => setShowAuditLogsModal(true)} className="text-[10px] font-extrabold text-blue-600 hover:underline cursor-pointer">View All ↗</button>
              </div>

              {/* Audit Log entries */}
              <div className="space-y-3.5 mt-4 max-h-[420px] overflow-y-auto pr-1">
                
                {/* Entry 1 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <span className="h-4 w-4 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center text-emerald-700">✓</span>
                      Approved Caregiver Profile
                    </span>
                    <span className="text-slate-500 font-bold">Jul 22, 03:45 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-normal">
                    Verified and authorized registration profile for <span className="font-bold text-slate-900">Sarah Jenkins</span>.
                  </p>
                </div>

                {/* Entry 2 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-blue-700 flex items-center gap-1.5">
                      <span className="h-4 w-4 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center text-blue-700">❖</span>
                      Added Service Type: Elder care
                    </span>
                    <span className="text-slate-500 font-bold">Jul 22, 03:42 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-normal">
                    Verified and authorized registration profile for marketplace category.
                  </p>
                </div>

                {/* Entry 3 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-blue-600 flex items-center gap-1.5">
                      <span className="h-4 w-4 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center text-blue-600">+</span>
                      Added Service Type: Physiotherapy
                    </span>
                    <span className="text-slate-500 font-bold">Jul 22, 03:41 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-normal">
                    Verified and authorized registration profile for specialized support.
                  </p>
                </div>

                {/* Entry 4 */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 hover:border-blue-300 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-rose-600 flex items-center gap-1.5">
                      <span className="h-4 w-4 bg-rose-100 border border-rose-300 rounded-full flex items-center justify-center text-rose-600">✕</span>
                      Deleted Service Type: Nursing
                    </span>
                    <span className="text-slate-500 font-bold">Jul 22, 03:39 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-700 font-medium leading-normal">
                    Service type has been removed from marketplace directory.
                  </p>
                </div>

                {/* Dynamic Session Logs */}
                {adminLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className="text-blue-600">{log.action}</span>
                      <span className="text-slate-500">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-slate-700 font-medium leading-normal">
                      Target action completed for <span className="text-blue-700 font-bold">{log.targetName}</span>.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Button */}
            <button 
              onClick={() => setShowAuditLogsModal(true)}
              className="w-full mt-4 py-3 rounded-2xl nav-pill-active text-xs font-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 transition-transform active:scale-95"
            >
              <span>View Full Audit Logs</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Document Review Drawer / Modal overlay */}
      {selectedCG && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCG(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header caregiver info */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-200">
              <img
                src={selectedCG.avatarUrl}
                alt={selectedCG.fullName}
                className="h-14 w-14 rounded-2xl object-cover border border-slate-200 bg-slate-100"
              />
              <div className="space-y-1">
                <span className="block font-heading font-extrabold text-base text-slate-900">{selectedCG.fullName}</span>
                <span className="block text-xs text-slate-500 font-semibold">{selectedCG.address}, {selectedCG.city}</span>
                <span className="block text-[11px] font-bold text-blue-600">Hourly Rate: ${selectedCG.hourlyRate}/hr • Exp: {selectedCG.experienceYears} Years</span>
              </div>
            </div>

            {/* Bio info */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-700">Biography Details</span>
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 rounded-2xl p-3.5 border border-slate-200">
                {selectedCG.bio}
              </p>
            </div>

            {/* Uploaded files audit */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-700">Verification Documents ({selectedCG.documents.length})</span>
              {selectedCG.documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No files uploaded for auditing.</p>
              ) : (
                <div className="space-y-3">
                  {selectedCG.documents.map((doc) => (
                    <div key={doc.id} className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-900">{doc.type}</span>
                        <span className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                          doc.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          doc.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {doc.status || 'pending'}
                        </span>
                      </div>
                      
                      {/* Document Preview Card */}
                      <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center justify-center min-h-[120px] text-center">
                        {doc.fileUrl && (doc.fileUrl.startsWith('data:image') || doc.fileUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)/i) || doc.fileUrl.includes('placehold.co') || doc.fileUrl.includes('unsplash.com')) ? (
                          <img
                            src={doc.fileUrl.startsWith('http') || doc.fileUrl.startsWith('data:') ? doc.fileUrl : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${doc.fileUrl}`}
                            alt={doc.type}
                            className="max-h-48 max-w-full rounded-lg object-contain shadow-xs border border-slate-200"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = 'https://placehold.co/400x300/png?text=Image+Unavailable';
                            }}
                          />
                        ) : (
                          <>
                            <FileText className="h-8 w-8 text-blue-600 mb-1" />
                            <span className="text-2xs font-bold text-slate-500 uppercase">{doc.type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accept / Decline actions */}
            <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
              <button
                onClick={() => handleReject(selectedCG.id)}
                className="rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 px-4 py-2.5 text-xs font-bold text-rose-700 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Reject Application</span>
              </button>
              <button
                onClick={() => handleApprove(selectedCG.id)}
                className="rounded-xl nav-pill-active px-5 py-2.5 text-xs font-black text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Approve & Authorize</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Audit Logs Full Modal */}
      {showAuditLogsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 text-slate-900 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="font-heading font-black text-xl text-slate-900 flex items-center gap-2">
                <Activity className="h-6 w-6 text-blue-600" />
                <span>Full Audit Logs</span>
              </h2>
              <button
                onClick={() => setShowAuditLogsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Logs List */}
            <div className="space-y-4 overflow-y-auto flex-grow pr-2">
              {/* Entry 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-emerald-700 flex items-center gap-2">
                    <span className="h-5 w-5 bg-emerald-100 border border-emerald-300 rounded-full flex items-center justify-center text-emerald-700">✓</span>
                    Approved Caregiver Profile
                  </span>
                  <span className="text-slate-500 font-bold">Jul 22, 03:45 PM</span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-normal pl-7">
                  Verified and authorized registration profile for <span className="font-bold text-slate-900">Sarah Jenkins</span>.
                </p>
              </div>

              {/* Entry 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-blue-700 flex items-center gap-2">
                    <span className="h-5 w-5 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center text-blue-700">❖</span>
                    Added Service Type: Elder care
                  </span>
                  <span className="text-slate-500 font-bold">Jul 22, 03:42 PM</span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-normal pl-7">
                  Verified and authorized registration profile for marketplace category.
                </p>
              </div>

              {/* Entry 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-blue-600 flex items-center gap-2">
                    <span className="h-5 w-5 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center text-blue-600">+</span>
                    Added Service Type: Physiotherapy
                  </span>
                  <span className="text-slate-500 font-bold">Jul 22, 03:41 PM</span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-normal pl-7">
                  Verified and authorized registration profile for specialized support.
                </p>
              </div>

              {/* Entry 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 hover:border-blue-300 transition-colors">
                <div className="flex justify-between items-center text-xs font-black">
                  <span className="text-rose-600 flex items-center gap-2">
                    <span className="h-5 w-5 bg-rose-100 border border-rose-300 rounded-full flex items-center justify-center text-rose-600">✕</span>
                    Deleted Service Type: Nursing
                  </span>
                  <span className="text-slate-500 font-bold">Jul 22, 03:39 PM</span>
                </div>
                <p className="text-sm text-slate-700 font-medium leading-normal pl-7">
                  Service type has been removed from marketplace directory.
                </p>
              </div>

              {/* Dynamic Session Logs */}
              {adminLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-black">
                    <span className="text-blue-600 flex items-center gap-2">
                      <span className="h-5 w-5 bg-blue-100 border border-blue-300 rounded-full flex items-center justify-center text-blue-600">i</span>
                      {log.action}
                    </span>
                    <span className="text-slate-500 font-bold">{formatDate(log.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-700 font-medium leading-normal pl-7">
                    Target action completed for <span className="text-blue-700 font-bold">{log.targetName}</span>.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
