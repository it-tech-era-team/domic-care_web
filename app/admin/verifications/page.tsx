"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCareConnect } from "@/context/useCareConnect";
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  ExternalLink,
  AlertCircle,
  Loader2,
  User,
  MapPin,
  Calendar,
  X,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

interface CaregiverDocument {
  id: string;
  type: string;
  fileUrl: string;
  status: string;
  uploaded_at?: string;
}

interface PendingCaregiver {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  bio: string;
  experienceYears: number;
  hourlyRate: number;
  address: string;
  city: string;
  approvalStatus: string;
  services: string[];
  documents: CaregiverDocument[];
}

export default function AdminVerificationsPage() {
  const router = useRouter();
  const { currentUser, showToast } = useCareConnect();

  const [loading, setLoading] = useState(true);
  const [caregivers, setCaregivers] = useState<PendingCaregiver[]>([]);
  const [selectedCaregiver, setSelectedCaregiver] = useState<PendingCaregiver | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<"approve" | "reject" | null>(null);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (currentUser && currentUser.role !== "admin") {
      router.push("/login");
      return;
    }
    fetchPendingCaregivers();
  }, [currentUser]);

  const fetchPendingCaregivers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/caregivers");
      const json = await res.json();
      const list = json.caregivers || json.data?.caregivers || [];
      const pending = list.filter((cg: any) => cg.approvalStatus === "pending");
      setCaregivers(pending);
    } catch (e) {
      console.error("Failed to load verifications:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    setProcessingAction("approve");
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/caregivers/${id}/approve`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Caregiver Approved", "Caregiver verified and approved successfully!", "success");
        setActionMessage({ text: "Caregiver verified and approved successfully!", isError: false });
        setCaregivers((prev) => prev.filter((cg) => cg.id !== id));
      } else {
        const msg = data.error?.message || "Failed to approve caregiver.";
        showToast("Approval Failed", msg, "error");
        setActionMessage({ text: msg, isError: true });
      }
    } catch {
      showToast("Network Error", "A network error occurred while approving.", "error");
      setActionMessage({ text: "Network error occurred.", isError: true });
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  const handleReject = async () => {
    if (!selectedCaregiver) return;
    setProcessingId(selectedCaregiver.id);
    setProcessingAction("reject");
    setActionMessage(null);
    try {
      const res = await fetch(`/api/admin/caregivers/${selectedCaregiver.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Application Rejected", "Caregiver application has been rejected.", "success");
        setActionMessage({ text: "Caregiver application rejected.", isError: false });
        setCaregivers((prev) => prev.filter((cg) => cg.id !== selectedCaregiver.id));
        setShowRejectModal(false);
        setRejectReason("");
      } else {
        const msg = data.error?.message || "Failed to reject caregiver.";
        showToast("Rejection Failed", msg, "error");
        setActionMessage({ text: msg, isError: true });
      }
    } catch {
      showToast("Network Error", "A network error occurred while rejecting.", "error");
      setActionMessage({ text: "Network error occurred.", isError: true });
    } finally {
      setProcessingId(null);
      setProcessingAction(null);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl w-full mx-auto p-4 sm:p-6 text-slate-900">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Caregiver Verification Applications
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Review credential documents, background qualifications, and approve provider profiles.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black px-4 py-2 rounded-2xl">
          <Clock className="h-4 w-4" />
          <span>{caregivers.length} Pending Review</span>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold border ${
            actionMessage.isError
              ? "bg-rose-50 text-rose-700 border-rose-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          {actionMessage.text}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
          <p className="text-xs text-slate-500 font-bold">Loading pending verification requests...</p>
        </div>
      ) : caregivers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-xs space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900">All Applications Processed</h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There are no pending caregiver applications waiting for verification review at this time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {caregivers.map((cg) => (
            <div
              key={cg.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-2xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200 shrink-0">
                    {cg.avatarUrl ? (
                      <img src={cg.avatarUrl} alt={cg.fullName} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{cg.fullName}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span>{cg.email}</span>
                      {cg.phone && <span>• {cg.phone}</span>}
                      <span>• {cg.experienceYears} Years Experience</span>
                      <span className="font-bold text-slate-900">• {formatCurrency(cg.hourlyRate)}/hr</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleApprove(cg.id)}
                    disabled={Boolean(processingId)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-sm shadow-emerald-600/20"
                  >
                    {processingId === cg.id && processingAction === "approve" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        <span>Approving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Approve</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCaregiver(cg);
                      setRejectReason("");
                      setShowRejectModal(true);
                    }}
                    disabled={Boolean(processingId)}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Bio & Qualifications */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Bio & Professional Summary
                </span>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  {cg.bio || "No summary provided."}
                </p>
              </div>

              {/* Documents */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Verification Credentials & Documents
                </span>
                {(!cg.documents || cg.documents.length === 0) ? (
                  <p className="text-xs text-slate-400 italic">No verification documents attached yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                    {cg.documents.map((doc, idx) => (
                      <div
                        key={doc.id || idx}
                        className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 bg-slate-50/60"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="text-xs font-bold text-slate-800 truncate">{doc.type}</span>
                        </div>
                        {doc.fileUrl ? (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-black text-blue-600 hover:text-blue-800 shrink-0"
                          >
                            <span>Open</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">Missing URL</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCaregiver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900">Reject Application</h3>
              <button
                onClick={() => setShowRejectModal(false)}
                className="h-8 w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Please enter the reason for rejecting <span className="font-bold">{selectedCaregiver.fullName}</span>'s application. This will be sent directly to the caregiver.
            </p>

            <textarea
              rows={3}
              required
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Please provide a clear copy of your Nursing License and expand your summary to detail experience."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={Boolean(processingId) || !rejectReason.trim()}
                className="px-4 py-2 rounded-2xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
              >
                {processingAction === "reject" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
