'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useCareConnect, CaregiverProfile } from '@/context/useCareConnect';
import {
  Users, Stethoscope, Calendar, DollarSign, ShieldAlert,
  CheckCircle2, AlertCircle, FileText, Eye, Check, X,
  Activity, Clock, UserCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    caregivers, bookings, adminLogs, approveCaregiver,
    rejectCaregiver, services, addService, deleteService
  } = useCareConnect();

  // Selected Caregiver for Document Review Modal
  const [selectedCG, setSelectedCG] = useState<CaregiverProfile | null>(null);

  // Tab Switcher and Form states
  const [activeTab, setActiveTab] = useState<'approvals' | 'services'>('approvals');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Platform Analytics calculations
  const totalUsersCount = caregivers.length + 5; // simulated families
  const totalCaregiversCount = caregivers.length;
  const approvedCaregivers = caregivers.filter(cg => cg.approvalStatus === 'approved');
  const pendingCaregivers = caregivers.filter(cg => cg.approvalStatus === 'pending');
  const activeBookingsCount = bookings.filter(b => b.status === 'accepted').length;

  const totalRevenue = useMemo(() => {
    // Estimate platform revenue as 10% commission on completed jobs
    const completedJobs = bookings.filter(b => b.status === 'completed');
    return completedJobs.reduce((sum, job) => {
      const start = new Date(job.startDate).getTime();
      const end = new Date(job.endDate).getTime();
      const hours = Math.max(1, Math.round((end - start) / (1000 * 60 * 60)));
      // hourly rate is generally 20-30, let's use 25
      return sum + hours * 25 * 0.10;
    }, 0);
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
    <div className="space-y-6 sm:space-y-8 max-w-6xl w-full mx-auto animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Admin Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor marketplace health, review verification documents, and audit credentials.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <UserCheck className="h-4 w-4 text-blue-600" />
            <span>User Management</span>
          </Link>
          <Link
            href="/admin/caregivers"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-blue-500/15 transition-all cursor-pointer"
          >
            <Stethoscope className="h-4 w-4" />
            <span>Caregiver Management</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Users */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <Users className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">{totalUsersCount}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Accounts</span>
          </div>
        </div>

        {/* Total Caregivers */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
            <Stethoscope className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">
              {totalCaregiversCount}{' '}
              <span className="text-xs font-semibold text-slate-400">({approvedCaregivers.length} Live)</span>
            </span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Caregivers</span>
          </div>
        </div>

        {/* Active Bookings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
            <Calendar className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">{activeBookingsCount}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Bookings</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
            <DollarSign className="h-5.5 w-5.5" />
          </div>
          <div>
            <span className="block text-xl font-extrabold text-slate-900">${totalRevenue.toFixed(2)}</span>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Comm. Revenue (10%)</span>
          </div>
        </div>
      </div>

      {/* Grid: Approvals Table & Admin Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Tab switcher for Approvals / Services */}
        <div className="lg:col-span-2 space-y-6 animate-fade-in">
          
          {/* Tabs header */}
          <div className="flex gap-2 border-b border-slate-100 pb-1 text-xs sm:text-sm font-bold">
            <button
              onClick={() => setActiveTab('approvals')}
              className={`pb-3 px-3 transition-colors relative cursor-pointer ${
                activeTab === 'approvals' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Caregiver Approvals ({pendingCaregivers.length})
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`pb-3 px-3 transition-colors relative cursor-pointer ${
                activeTab === 'services' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Manage Marketplace Services ({services.length})
            </button>
          </div>

          {activeTab === 'approvals' ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4 overflow-hidden">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <h2 className="font-heading font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
                  <span>Caregivers Approval Queue ({pendingCaregivers.length})</span>
                </h2>
              </div>

              {pendingCaregivers.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <div className="mx-auto h-10 w-10 bg-slate-50 rounded-full flex items-center justify-center text-green-500 border border-green-100">
                    ✓
                  </div>
                  <p className="text-xs font-semibold text-slate-600">Approval queue is empty</p>
                  <p className="text-[10px]">All registered caregivers have been verified.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-3 pr-4">Name</th>
                        <th className="py-3 px-4">Services</th>
                        <th className="py-3 px-4">Experience</th>
                        <th className="py-3 px-4 text-center">Docs</th>
                        <th className="py-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pendingCaregivers.map((cg) => (
                        <tr key={cg.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 pr-4 flex items-center gap-3">
                            <img
                              src={cg.avatarUrl}
                              alt={cg.fullName}
                              className="h-9 w-9 rounded-lg object-cover bg-slate-50"
                            />
                            <div>
                              <span className="block font-bold text-slate-800 text-xs">{cg.fullName}</span>
                              <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">{cg.address}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {cg.services.slice(0, 2).map((s) => (
                                <span key={s} className="bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-[9px] font-bold text-slate-500">
                                  {s}
                                </span>
                              ))}
                              {cg.services.length > 2 && (
                                <span className="text-[9px] font-bold text-slate-400">+{cg.services.length - 2} more</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-700">
                            {cg.experienceYears} Years
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-600">
                            {cg.documents.length} File(s)
                          </td>
                          <td className="py-3 pl-4 text-right">
                            <button
                              onClick={() => setSelectedCG(cg)}
                              className="rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white p-2 text-blue-700 transition-colors inline-flex items-center justify-center cursor-pointer"
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
              {/* Add New Service Form */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 border-b border-slate-50 pb-2">
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
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5 sm:col-span-1">
                      <label className="block text-xs font-bold text-slate-700">Service Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Memory Care"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700">Description</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Alzheimer and dementia helper support services."
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                  >
                    Create Service
                  </button>
                </form>
              </div>

              {/* List of Services */}
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <h3 className="font-heading font-extrabold text-sm text-slate-900 border-b border-slate-50 pb-2">
                  Active Services Grid
                </h3>
                {services.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No services registered. Add a service above.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5">
                    {services.map((s) => (
                      <div
                        key={s.id}
                        className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 flex items-start justify-between gap-4 hover:border-blue-100 transition-colors"
                      >
                        <div className="space-y-1 min-w-0">
                          <span className="block font-bold text-xs text-slate-800">{s.name}</span>
                          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xl truncate sm:whitespace-normal">
                            {s.description || 'No description provided.'}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteService(s.id)}
                          className="rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:text-red-600 p-2.5 text-slate-500 transition-colors shadow-sm cursor-pointer shrink-0"
                          title="Delete Service"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Admin Activity Log */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h2 className="font-heading font-extrabold text-lg text-slate-900 pb-2 border-b border-slate-50 flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-blue-600" />
              <span>Admin Audits Log</span>
            </h2>

            {adminLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No verification logs recorded in this session.</p>
            ) : (
              <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                {adminLogs.map((log) => (
                  <div key={log.id} className="p-3 rounded-2xl border border-slate-50 bg-slate-50/50 text-xs space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                      <span>{log.action}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(log.createdAt)}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 font-semibold leading-normal">
                      Verified and authorized registration profile for <span className="text-blue-600">{log.targetName}</span>.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Document Review Drawer / Modal overlay */}
      {selectedCG && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCG(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header caregiver info */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <img
                src={selectedCG.avatarUrl}
                alt={selectedCG.fullName}
                className="h-14 w-14 rounded-xl object-cover border bg-slate-50"
              />
              <div className="space-y-1">
                <span className="block font-heading font-extrabold text-base text-slate-900">{selectedCG.fullName}</span>
                <span className="block text-xs text-slate-400 font-semibold">{selectedCG.address}, {selectedCG.city}</span>
                <span className="block text-[11px] font-bold text-blue-600">Hourly Rate: ${selectedCG.hourlyRate}/hr • Exp: {selectedCG.experienceYears} Years</span>
              </div>
            </div>

            {/* Bio info */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold text-slate-700">Biography Details</span>
              <p className="text-xs text-slate-500 leading-relaxed font-normal bg-slate-50 rounded-xl p-3 border border-slate-100/50">
                {selectedCG.bio}
              </p>
            </div>

            {/* Uploaded files audit */}
            <div className="space-y-3">
              <span className="block text-xs font-bold text-slate-700">Verification Documents ({selectedCG.documents.length})</span>
              {selectedCG.documents.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No files uploaded for auditing.</p>
              ) : (
                <div className="space-y-3.5">
                  {selectedCG.documents.map((doc) => (
                    <div key={doc.id} className="p-3 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800">{doc.type}</span>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          doc.status === 'approved' ? 'bg-green-50 text-green-700 border-green-100' :
                          doc.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {doc.status || 'pending'}
                        </span>
                      </div>
                      
                      {/* Document Preview Card */}
                      <div className="rounded-xl border border-slate-200 bg-white p-3 flex flex-col items-center justify-center min-h-[120px] text-center">
                        {doc.fileUrl && (doc.fileUrl.startsWith('data:image') || doc.fileUrl.match(/\.(jpeg|jpg|png|gif|webp|svg)/i) || doc.fileUrl.includes('placehold.co') || doc.fileUrl.includes('unsplash.com')) ? (
                          <img
                            src={doc.fileUrl}
                            alt={doc.type}
                            className="max-h-48 max-w-full rounded-lg object-contain shadow-sm border border-slate-100"
                          />
                        ) : (
                          <>
                            <FileText className="h-8 w-8 text-blue-500 mb-1" />
                            <span className="text-2xs font-bold text-slate-600 uppercase">{doc.type}</span>
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            if (!doc.fileUrl) return;
                            const a = document.createElement('a');
                            a.href = doc.fileUrl;
                            a.download = `${(doc.type || 'document').replace(/\s+/g, '_')}`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="text-[10px] text-blue-600 font-bold mt-2 hover:underline cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Download / Save Document File</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accept / Decline actions */}
            <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                onClick={() => handleReject(selectedCG.id)}
                className="rounded-xl border border-red-200 bg-white hover:bg-red-50 hover:text-red-700 px-4 py-2.5 text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="h-4 w-4 text-red-500" />
                <span>Reject Application</span>
              </button>
              <button
                onClick={() => handleApprove(selectedCG.id)}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-xs font-bold text-white flex items-center gap-1 cursor-pointer shadow-sm transition-colors"
              >
                <Check className="h-4 w-4 text-white" />
                <span>Approve & Authorize</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
