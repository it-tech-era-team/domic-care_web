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
    <div className="space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto animate-fade-in text-white">
      
      {/* Title & Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Welcome back, {currentUser?.fullName?.split(' ')[0] || 'Adnan'}! 👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-semibold mt-1">
            Here's what's happening with your marketplace today.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-2xl bg-[#171b42] border border-white/20 hover:bg-white/10 text-white px-4 py-2.5 text-xs font-extrabold shadow-md transition-all cursor-pointer"
          >
            <UserCheck className="h-4 w-4 text-cyan-400" />
            <span>User Management</span>
          </Link>
          <Link
            href="/admin/caregivers"
            className="inline-flex items-center gap-2 rounded-2xl nav-pill-active text-white px-4 py-2.5 text-xs font-extrabold transition-all cursor-pointer shadow-lg shadow-purple-500/30"
          >
            <Stethoscope className="h-4 w-4 text-white" />
            <span>Caregiver Management</span>
          </Link>
        </div>
      </div>

      {/* 4 Signature Vibrant Metric Cards matching exact reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Card 1: TOTAL ACCOUNTS (Electric Blue) */}
        <div className="stat-card-blue p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[145px] transition-transform duration-300 hover:scale-[1.02]">
          <div className="flex items-start justify-between relative z-10">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Users className="h-5.5 w-5.5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight">{totalUsersCount}</span>
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-100 block mb-1.5">TOTAL ACCOUNTS</span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 font-extrabold text-white bg-emerald-500/30 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                <TrendingUp className="h-3 w-3 text-emerald-300" />
                <span>+16% vs last week</span>
              </span>
            </div>
          </div>
          <svg className="absolute bottom-0 left-0 right-0 w-full h-12 opacity-35 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0 25 Q20 10 40 20 T80 15 T100 5 L100 30 L0 30 Z" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>

        {/* Card 2: CAREGIVERS (Teal / Emerald) */}
        <div className="stat-card-teal p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[145px] transition-transform duration-300 hover:scale-[1.02]">
          <div className="flex items-start justify-between relative z-10">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Stethoscope className="h-5.5 w-5.5 text-white" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-black tracking-tight">{totalCaregiversCount}</span>
              <span className="text-xs font-bold text-teal-100">({approvedCaregivers.length} Live)</span>
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-teal-100 block mb-1.5">CAREGIVERS</span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 font-extrabold text-white bg-emerald-500/30 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                <TrendingUp className="h-3 w-3 text-emerald-300" />
                <span>+33% vs last week</span>
              </span>
            </div>
          </div>
          <svg className="absolute bottom-0 left-0 right-0 w-full h-12 opacity-35 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0 20 Q25 30 50 10 T90 18 T100 8 L100 30 L0 30 Z" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>

        {/* Card 3: ACTIVE BOOKINGS (Magenta / Pink) */}
        <div className="stat-card-purple p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[145px] transition-transform duration-300 hover:scale-[1.02]">
          <div className="flex items-start justify-between relative z-10">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Calendar className="h-5.5 w-5.5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight">{activeBookingsCount}</span>
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-pink-100 block mb-1.5">ACTIVE BOOKINGS</span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 font-extrabold text-white bg-yellow-500/30 px-2.5 py-0.5 rounded-full border border-yellow-300/40">
                <TrendingDown className="h-3 w-3 text-yellow-300" />
                <span>-10% vs last week</span>
              </span>
            </div>
          </div>
          <svg className="absolute bottom-0 left-0 right-0 w-full h-12 opacity-35 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0 15 Q30 5 60 22 T100 12 L100 30 L0 30 Z" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>

        {/* Card 4: COMM. REVENUE (10%) (Vivid Orange / Amber) */}
        <div className="stat-card-orange p-5 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[145px] transition-transform duration-300 hover:scale-[1.02]">
          <div className="flex items-start justify-between relative z-10">
            <div className="h-11 w-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <DollarSign className="h-5.5 w-5.5 text-white" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black tracking-tight">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
          <div className="relative z-10 mt-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-100 block mb-1.5">COMM. REVENUE (10%)</span>
            <div className="flex items-center justify-between text-[11px]">
              <span className="inline-flex items-center gap-1 font-extrabold text-white bg-emerald-500/30 px-2.5 py-0.5 rounded-full border border-emerald-300/40">
                <TrendingUp className="h-3 w-3 text-emerald-300" />
                <span>+25% vs last week</span>
              </span>
            </div>
          </div>
          <svg className="absolute bottom-0 left-0 right-0 w-full h-12 opacity-35 pointer-events-none" viewBox="0 0 100 30" preserveAspectRatio="none">
            <path d="M0 22 Q20 8 50 18 T100 10 L100 30 L0 30 Z" fill="rgba(255,255,255,0.4)" />
          </svg>
        </div>

      </div>

      {/* Main Grid: Approvals Panel (Left 2 cols) & Audit Logs (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column Container */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Dark Panel for Approvals / Services */}
          <div className="dark-panel rounded-3xl p-6 space-y-6 bg-[#111433] text-white">
            
            {/* Tabs Header */}
            <div className="flex gap-6 border-b border-white/10 pb-3 text-sm font-bold">
              <button
                onClick={() => setActiveTab('approvals')}
                className={`pb-1 transition-all relative cursor-pointer ${
                  activeTab === 'approvals' 
                    ? 'text-white border-b-2 border-purple-500 font-black' 
                    : 'text-slate-300 hover:text-white font-bold'
                }`}
              >
                Caregiver Approvals ({pendingCaregivers.length})
              </button>
              <button
                onClick={() => setActiveTab('services')}
                className={`pb-1 transition-all relative cursor-pointer ${
                  activeTab === 'services' 
                    ? 'text-white border-b-2 border-purple-500 font-black' 
                    : 'text-slate-300 hover:text-white font-bold'
                }`}
              >
                Manage Marketplace Services ({services.length})
              </button>
            </div>

            {activeTab === 'approvals' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2">
                  <h2 className="font-heading font-black text-sm text-white flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5 text-amber-400 animate-pulse" />
                    <span>Caregivers Approvals Queue ({pendingCaregivers.length})</span>
                  </h2>
                </div>

                {pendingCaregivers.length === 0 ? (
                  /* Glowing 3D Folder Empty State matching reference image */
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="relative">
                      {/* Floating sparkles background */}
                      <div className="absolute -top-3 -right-3 h-3.5 w-3.5 bg-cyan-400 rounded-full animate-ping" />
                      <div className="absolute -bottom-2 -left-4 h-2.5 w-2.5 bg-pink-500 rounded-full animate-bounce" />
                      
                      {/* 3D Folder Container */}
                      <div className="h-24 w-28 rounded-3xl bg-gradient-to-tr from-indigo-950 via-purple-900 to-cyan-700 p-0.5 shadow-2xl shadow-purple-600/50 flex items-center justify-center">
                        <div className="h-full w-full bg-[#0c0e25] rounded-[22px] flex items-center justify-center relative">
                          <FolderCheck className="h-12 w-12 text-cyan-400" />
                          <span className="absolute bottom-3 right-3 h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center border-2 border-[#0c0e25] text-white">
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-base font-black text-white">Approval queue is empty</h3>
                      <p className="text-xs text-slate-300 font-medium">All registered caregivers have been verified.</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 text-slate-300 font-black uppercase tracking-wider text-[10px]">
                          <th className="py-3 pr-4">Name</th>
                          <th className="py-3 px-4">Services</th>
                          <th className="py-3 px-4">Experience</th>
                          <th className="py-3 px-4 text-center">Docs</th>
                          <th className="py-3 pl-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/10">
                        {pendingCaregivers.map((cg) => (
                          <tr key={cg.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-3 pr-4 flex items-center gap-3">
                              <img
                                src={cg.avatarUrl}
                                alt={cg.fullName}
                                className="h-9 w-9 rounded-xl object-cover border border-white/20 bg-slate-800"
                              />
                              <div>
                                <span className="block font-bold text-white text-xs">{cg.fullName}</span>
                                <span className="block text-[10px] text-slate-300 truncate max-w-[120px]">{cg.address}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1 max-w-[150px]">
                                {cg.services.slice(0, 2).map((s) => (
                                  <span key={s} className="bg-purple-500/25 border border-purple-400/30 rounded px-1.5 py-0.5 text-[9px] font-bold text-purple-300">
                                    {s}
                                  </span>
                                ))}
                                {cg.services.length > 2 && (
                                  <span className="text-[9px] font-bold text-slate-300">+{cg.services.length - 2} more</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold text-slate-200">
                              {cg.experienceYears} Years
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-cyan-400">
                              {cg.documents.length} File(s)
                            </td>
                            <td className="py-3 pl-4 text-right">
                              <button
                                onClick={() => setSelectedCG(cg)}
                                className="rounded-xl bg-purple-600/30 hover:bg-purple-600 border border-purple-400/30 p-2 text-white transition-colors inline-flex items-center justify-center cursor-pointer shadow-sm"
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
                <div className="dark-card rounded-2xl p-4 space-y-3 bg-[#171b42] text-white">
                  <h3 className="font-heading font-extrabold text-xs text-white border-b border-white/10 pb-2">
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
                        <label className="block text-[11px] font-bold text-slate-300">Service Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Memory Care"
                          value={newServiceName}
                          onChange={(e) => setNewServiceName(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-300">Description</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Alzheimer and dementia helper support services."
                          value={newServiceDesc}
                          onChange={(e) => setNewServiceDesc(e.target.value)}
                          className="w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs text-white placeholder-slate-400 focus:border-purple-500 focus:outline-none"
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
                  <h3 className="font-heading font-extrabold text-xs text-white">Active Services Grid</h3>
                  <div className="grid grid-cols-1 gap-2.5">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="p-3 border border-white/10 rounded-2xl dark-card bg-[#171b42] flex items-start justify-between gap-4"
                      >
                        <div className="space-y-0.5 min-w-0">
                          <span className="block font-bold text-xs text-white">{s.name}</span>
                          <p className="text-[10px] text-slate-300 leading-relaxed truncate">
                            {s.description || 'No description provided.'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteService(s.id)}
                          className="rounded-xl border border-red-500/30 bg-red-500/20 hover:bg-red-500 p-2 text-red-300 hover:text-white transition-colors cursor-pointer shrink-0"
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
            <div className="dark-panel rounded-3xl p-5 space-y-4 bg-[#111433] text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-white">Accounts Overview</h3>
                <span className="text-[10px] font-bold text-slate-300 bg-white/10 border border-white/10 rounded-lg px-2 py-0.5">This Week ▾</span>
              </div>

              <div className="flex items-center justify-around py-2">
                {/* SVG Donut Chart */}
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="h-full w-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3.8"
                      strokeDasharray="28, 100"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#0d9488"
                      strokeWidth="3.8"
                      strokeDasharray="28, 100"
                      strokeDashoffset="-28"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.8"
                      strokeDasharray="44, 100"
                      strokeDashoffset="-56"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-white block leading-none">{totalUsersCount}</span>
                    <span className="text-[9px] text-slate-300 font-extrabold uppercase">Total</span>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
                    <span className="text-slate-200 font-bold text-[11px]">Admins</span>
                    <span className="font-extrabold text-white ml-auto">2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
                    <span className="text-slate-200 font-bold text-[11px]">Caregivers</span>
                    <span className="font-extrabold text-white ml-auto">2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-200 font-bold text-[11px]">Users</span>
                    <span className="font-extrabold text-white ml-auto">3</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bookings Overview Weekly Bar Chart Card */}
            <div className="dark-panel rounded-3xl p-5 space-y-4 bg-[#111433] text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-white">Bookings Overview</h3>
                <span className="text-[10px] font-bold text-slate-300 bg-white/10 border border-white/10 rounded-lg px-2 py-0.5">This Week ▾</span>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-2xl font-black text-white">{activeBookingsCount}</span>
                  <span className="text-[10px] text-slate-300 font-bold">Active Bookings</span>
                  <span className="text-[9px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full ml-auto">↑ 10%</span>
                </div>

                {/* Bar Chart Visual */}
                <div className="h-20 flex items-end justify-between gap-2 pt-4 px-2 border-b border-white/10">
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-white/10 rounded-t h-4" />
                    <span className="text-[9px] text-slate-300 font-bold">Mon</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-gradient-to-t from-pink-600 to-purple-500 rounded-t h-14 shadow-lg shadow-pink-500/40" />
                    <span className="text-[9px] text-pink-300 font-extrabold">Tue</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-white/10 rounded-t h-6" />
                    <span className="text-[9px] text-slate-300 font-bold">Wed</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-white/10 rounded-t h-2" />
                    <span className="text-[9px] text-slate-300 font-bold">Thu</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-white/10 rounded-t h-5" />
                    <span className="text-[9px] text-slate-300 font-bold">Fri</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-white/10 rounded-t h-3" />
                    <span className="text-[9px] text-slate-300 font-bold">Sat</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-1">
                    <div className="w-full bg-white/10 rounded-t h-2" />
                    <span className="text-[9px] text-slate-300 font-bold">Sun</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Admin Audits Log Panel */}
        <div className="space-y-6">
          <div className="dark-panel rounded-3xl p-6 space-y-4 flex flex-col justify-between min-h-[500px] bg-[#111433] text-white">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h2 className="font-heading font-black text-base text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  <span>Admin Audits Log</span>
                </h2>
                <span className="text-[10px] font-extrabold text-purple-300 hover:underline cursor-pointer">View All ↗</span>
              </div>

              {/* Audit Log entries matching screenshot with SOLID DARK CARDS & Crisp Text */}
              <div className="space-y-3.5 mt-4 max-h-[420px] overflow-y-auto pr-1">
                
                {/* Entry 1 */}
                <div className="p-3.5 rounded-2xl dark-card bg-[#171b42] border border-white/10 space-y-1.5 hover:border-purple-500/40 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <span className="h-4 w-4 bg-emerald-500/20 border border-emerald-400/40 rounded-full flex items-center justify-center text-white">✓</span>
                      Approved Caregiver Profile
                    </span>
                    <span className="text-slate-300 font-bold">Jul 22, 03:45 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium leading-normal">
                    Verified and authorized registration profile for <span className="font-bold text-white">Sarah Jenkins</span>.
                  </p>
                </div>

                {/* Entry 2 */}
                <div className="p-3.5 rounded-2xl dark-card bg-[#171b42] border border-white/10 space-y-1.5 hover:border-purple-500/40 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-cyan-400 flex items-center gap-1.5">
                      <span className="h-4 w-4 bg-cyan-500/20 border border-cyan-400/40 rounded-full flex items-center justify-center text-white">❖</span>
                      Added Service Type: Elder care
                    </span>
                    <span className="text-slate-300 font-bold">Jul 22, 03:42 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium leading-normal">
                    Verified and authorized registration profile for marketplace category.
                  </p>
                </div>

                {/* Entry 3 */}
                <div className="p-3.5 rounded-2xl dark-card bg-[#171b42] border border-white/10 space-y-1.5 hover:border-purple-500/40 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-purple-400 flex items-center gap-1.5">
                      <span className="h-4 w-4 bg-purple-500/20 border border-purple-400/40 rounded-full flex items-center justify-center text-white">+</span>
                      Added Service Type: Physiotherapy
                    </span>
                    <span className="text-slate-300 font-bold">Jul 22, 03:41 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium leading-normal">
                    Verified and authorized registration profile for specialized support.
                  </p>
                </div>

                {/* Entry 4 */}
                <div className="p-3.5 rounded-2xl dark-card bg-[#171b42] border border-white/10 space-y-1.5 hover:border-purple-500/40 transition-colors">
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-pink-400 flex items-center gap-1.5">
                      <span className="h-4 w-4 bg-pink-500/20 border border-pink-400/40 rounded-full flex items-center justify-center text-white">✕</span>
                      Deleted Service Type: Nursing
                    </span>
                    <span className="text-slate-300 font-bold">Jul 22, 03:39 PM</span>
                  </div>
                  <p className="text-[11px] text-slate-200 font-medium leading-normal">
                    Service type has been removed from marketplace directory.
                  </p>
                </div>

                {/* Dynamic Session Logs */}
                {adminLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl dark-card bg-[#171b42] border border-white/10 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black">
                      <span className="text-purple-300">{log.action}</span>
                      <span className="text-slate-300">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-[11px] text-slate-200 font-medium leading-normal">
                      Target action completed for <span className="text-cyan-400 font-bold">{log.targetName}</span>.
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Button matching reference */}
            <button className="w-full mt-4 py-3 rounded-2xl nav-pill-active text-xs font-black text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-transform active:scale-95">
              <span>View Full Audit Logs</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Document Review Drawer / Modal overlay */}
      {selectedCG && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="dark-panel bg-[#111433] rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCG(null)}
              className="absolute right-4 top-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header caregiver info */}
            <div className="flex items-start gap-4 pb-4 border-b border-white/10">
              <img
                src={selectedCG.avatarUrl}
                alt={selectedCG.fullName}
                className="h-14 w-14 rounded-2xl object-cover border border-white/20 bg-slate-800"
              />
              <div className="space-y-1">
                <span className="block font-heading font-extrabold text-base text-white">{selectedCG.fullName}</span>
                <span className="block text-xs text-slate-300 font-semibold">{selectedCG.address}, {selectedCG.city}</span>
                <span className="block text-[11px] font-bold text-cyan-400">Hourly Rate: ${selectedCG.hourlyRate}/hr • Exp: {selectedCG.experienceYears} Years</span>
              </div>
            </div>

            {/* Bio info */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-200">Biography Details</span>
              <p className="text-xs text-slate-300 leading-relaxed font-medium bg-white/5 rounded-2xl p-3.5 border border-white/10">
                {selectedCG.bio}
              </p>
            </div>

            {/* Uploaded files audit */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-200">Verification Documents ({selectedCG.documents.length})</span>
              {selectedCG.documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No files uploaded for auditing.</p>
              ) : (
                <div className="space-y-3">
                  {selectedCG.documents.map((doc) => (
                    <div key={doc.id} className="p-3.5 border border-white/10 rounded-2xl dark-card bg-[#171b42] space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-white">{doc.type}</span>
                        <span className={`text-[9px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border ${
                          doc.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                          doc.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                          'bg-amber-500/20 text-amber-300 border-amber-400/30'
                        }`}>
                          {doc.status || 'pending'}
                        </span>
                      </div>
                      
                      {/* Document Preview Card */}
                      <div className="rounded-xl border border-white/10 bg-black/40 p-3 flex flex-col items-center justify-center min-h-[120px] text-center">
                        {doc.fileUrl && (doc.fileUrl.startsWith('data:image') || doc.fileUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)/i) || doc.fileUrl.includes('placehold.co') || doc.fileUrl.includes('unsplash.com')) ? (
                          <img
                            src={doc.fileUrl}
                            alt={doc.type}
                            className="max-h-48 max-w-full rounded-lg object-contain shadow-md border border-white/10"
                          />
                        ) : (
                          <>
                            <FileText className="h-8 w-8 text-cyan-400 mb-1" />
                            <span className="text-2xs font-bold text-slate-300 uppercase">{doc.type}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accept / Decline actions */}
            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => handleReject(selectedCG.id)}
                className="rounded-xl border border-red-500/30 bg-red-500/20 hover:bg-red-500 px-4 py-2.5 text-xs font-bold text-red-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Reject Application</span>
              </button>
              <button
                onClick={() => handleApprove(selectedCG.id)}
                className="rounded-xl nav-pill-active px-5 py-2.5 text-xs font-black text-white flex items-center gap-1.5 cursor-pointer shadow-lg shadow-purple-600/30 transition-colors"
              >
                <Check className="h-4 w-4" />
                <span>Approve & Authorize</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
