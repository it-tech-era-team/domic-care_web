"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  Filter,
  Eye,
  Star,
  Users,
  CheckCircle,
  Clock3,
  XCircle,
  Trash2,
  Shield,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  PoundSterling,
  FileText,
  X,
  AlertTriangle,
  Ban,
  RotateCcw,
  User,
  Briefcase,
  TrendingUp,
  Award,
  ChevronRight,
  ImageOff,
} from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

interface Booking {
  id: string;
  status: string;
  start_date: string;
  end_date: string;
  cancel_reason?: string;
  cancelled_by?: string;
  services?: {
    id: string;
    name: string;
  };
}

interface Document {
  id: string;
  type: string;
  fileUrl: string;
  url?: string;
  label?: string;
  status: string;
  uploaded_at?: string;
}

interface Caregiver {
  id: string;

  fullName: string;
  email: string;
  phone: string;

  avatarUrl: string;

  bio: string;

  gender: string;

  dob: string;

  address: string;

  city: string;

  latitude: number;

  longitude: number;

  hourlyRate: number;

  experienceYears: number;

  approvalStatus: string;

  accountStatus: string;

  isDeleted: boolean;

  joinedAt: string;

  rating: number;

  reviewsCount: number;

  averageRating: number;

  totalReviews: number;

  totalBookings: number;

  completedBookings: number;

  cancelledBookings: number;

  pendingBookings: number;

  acceptedBookings: number;

  services: any[];

  availability: any;

  documents: Document[];

  reviews: Review[];

  bookings: Booking[];
}

type Alert = { type: "success" | "error"; message: string } | null;
type Tab = "overview" | "bookings" | "reviews" | "documents" | "performance" | "account";

export default function AdminCaregiversPage() {
  const [caregivers, setCaregivers] = useState<Caregiver[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedCaregiver, setSelectedCaregiver] =
    useState<Caregiver | null>(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [deleteReason, setDeleteReason] = useState("");

  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const [alert, setAlert] = useState<Alert>(null);

  const [actionLoading, setActionLoading] = useState(false);

  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  async function loadCaregivers() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/caregivers");

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setCaregivers(data.caregivers ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCaregivers();
  }, []);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  // Keep the modal's selected caregiver in sync with fresh data after reloads
  useEffect(() => {
    if (!selectedCaregiver) return;
    const fresh = caregivers.find((c) => c.id === selectedCaregiver.id);
    if (fresh) setSelectedCaregiver(fresh);
  }, [caregivers]);

  // Lock background scroll while the detail modal is open
  useEffect(() => {
    if (selectedCaregiver) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [selectedCaregiver]);

  const filteredCaregivers = useMemo(() => {
    return caregivers.filter((cg) => {
      const matchesSearch =
        cg.fullName.toLowerCase().includes(search.toLowerCase()) ||
        cg.email.toLowerCase().includes(search.toLowerCase()) ||
        cg.city.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : cg.approvalStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [caregivers, search, statusFilter]);

  const stats = {
    total: caregivers.length,

    approved: caregivers.filter(
      (c) => c.approvalStatus === "approved"
    ).length,

    pending: caregivers.filter(
      (c) => c.approvalStatus === "pending"
    ).length,

    rejected: caregivers.filter(
      (c) => c.approvalStatus === "rejected"
    ).length,
  };

  // ===========================================================
  // PART 2B — HANDLERS
  // ===========================================================

  function viewCaregiver(cg: Caregiver) {
    setSelectedCaregiver(cg);
    setActiveTab("overview");
  }

  async function suspendCaregiver(id: string) {
    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/caregivers?id=${id}&action=suspend`,
        { method: "PATCH" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAlert({ type: "success", message: "Caregiver suspended successfully." });

      await loadCaregivers();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to suspend caregiver." });
    } finally {
      setActionLoading(false);
    }
  }

  async function reactivateCaregiver(id: string) {
    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/caregivers?id=${id}&action=reactivate`,
        { method: "PATCH" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAlert({ type: "success", message: "Caregiver reactivated successfully." });

      await loadCaregivers();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to reactivate caregiver." });
    } finally {
      setActionLoading(false);
    }
  }

  async function approveCaregiver(id: string) {
    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/caregivers?id=${id}&action=approve`,
        { method: "PATCH" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAlert({ type: "success", message: "Caregiver approved successfully." });

      await loadCaregivers();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to approve caregiver." });
    } finally {
      setActionLoading(false);
    }
  }

  async function rejectCaregiver(id: string) {
    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/caregivers?id=${id}&action=reject`,
        { method: "PATCH" }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAlert({ type: "success", message: "Caregiver rejected." });

      await loadCaregivers();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to reject caregiver." });
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteCaregiver() {
    if (!selectedCaregiver || !deleteReason.trim()) return;

    try {
      setActionLoading(true);

      const res = await fetch(
        `/api/admin/caregivers?id=${selectedCaregiver.id}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "soft",
            reason: deleteReason,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setAlert({ type: "success", message: "Caregiver deleted successfully." });

      setShowDeleteModal(false);

      setDeleteReason("");

      setSelectedCaregiver(null);

      await loadCaregivers();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to delete caregiver." });
    } finally {
      setActionLoading(false);
    }
  }

  // ===========================================================
  // SMALL HELPERS
  // ===========================================================

  function approvalBadge(status: string) {
    const map: Record<string, string> = {
      approved: "bg-green-100 text-green-700 border-green-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
      rejected: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${
          map[status] || "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        {status}
      </span>
    );
  }

  function accountBadge(status: string) {
    const map: Record<string, string> = {
      active: "bg-green-100 text-green-700 border-green-200",
      suspended: "bg-orange-100 text-orange-700 border-orange-200",
      deleted: "bg-red-100 text-red-700 border-red-200",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${
          map[status] || "bg-slate-100 text-slate-600 border-slate-200"
        }`}
      >
        {status}
      </span>
    );
  }

  function formatDate(dateStr?: string) {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  }

  function Avatar({
    url,
    name,
    size = 44,
  }: {
    url?: string;
    name: string;
    size?: number;
  }) {
    if (url) {
      return (
        <img
          src={url}
          alt={name}
          style={{ width: size, height: size }}
          className="rounded-full border-2 border-white object-cover shadow-md ring-1 ring-slate-200"
        />
      );
    }
    const initials = name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
    return (
      <div
        style={{ width: size, height: size }}
        className="flex items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-md ring-1 ring-slate-200"
      >
        {initials || <User size={size * 0.45} />}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-2xl border border-red-200 bg-white p-8 shadow-xl">
          <h2 className="text-lg font-bold text-red-600">
            Failed to load caregivers
          </h2>

          <p className="mt-3 text-sm text-slate-600">
            {error}
          </p>

          <button
            onClick={loadCaregivers}
            className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">

      {/* Remaining UI continues in Part 1B */}

      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Caregiver Management
            </h1>

            <p className="mt-2 text-slate-500">
              Manage caregivers, monitor performance, bookings, reviews and
              account activity.
            </p>

          </div>

          <button
            onClick={loadCaregivers}
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl"
          >
            <RefreshCw size={18} />

            Refresh
          </button>

        </div>

        {/* ========================================================= */}
        {/* STATISTICS */}
        {/* ========================================================= */}

        <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 p-7 text-white shadow-xl">

            <div className="flex items-center justify-between">

              <Users size={34} />

              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
                Total
              </span>

            </div>

            <h2 className="mt-8 text-5xl font-black">
              {stats.total}
            </h2>

            <p className="mt-2 text-blue-100">
              Registered Caregivers
            </p>

          </div>

          <div className="rounded-3xl border border-green-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <CheckCircle
                className="text-green-600"
                size={34}
              />

              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Approved
              </span>

            </div>

            <h2 className="mt-8 text-5xl font-black text-green-600">
              {stats.approved}
            </h2>

            <p className="mt-2 text-slate-500">
              Active Caregivers
            </p>

          </div>

          <div className="rounded-3xl border border-yellow-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <Clock3
                className="text-yellow-600"
                size={34}
              />

              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                Pending
              </span>

            </div>

            <h2 className="mt-8 text-5xl font-black text-yellow-500">
              {stats.pending}
            </h2>

            <p className="mt-2 text-slate-500">
              Awaiting Approval
            </p>

          </div>

          <div className="rounded-3xl border border-red-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">

            <div className="flex items-center justify-between">

              <XCircle
                className="text-red-600"
                size={34}
              />

              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                Rejected
              </span>

            </div>

            <h2 className="mt-8 text-5xl font-black text-red-600">
              {stats.rejected}
            </h2>

            <p className="mt-2 text-slate-500">
              Rejected Accounts
            </p>

          </div>

        </div>

        {/* ========================================================= */}
        {/* SEARCH */}
        {/* ========================================================= */}

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">

          <div className="grid gap-5 lg:grid-cols-12">

            <div className="relative lg:col-span-8">

              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by caregiver name, city or email..."
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
              />

            </div>

            <div className="lg:col-span-4">

              <div className="relative">

                <Filter
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  size={18}
                />

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="all">
                    All Caregivers
                  </option>

                  <option value="approved">
                    Approved
                  </option>

                  <option value="pending">
                    Pending
                  </option>

                  <option value="rejected">
                    Rejected
                  </option>

                </select>

              </div>

            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* PART 2A — CAREGIVER TABLE */}
        {/* ========================================================= */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left text-sm">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Caregiver</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Experience</th>
                  <th className="px-5 py-4">Hourly Rate</th>
                  <th className="px-5 py-4">Bookings</th>
                  <th className="px-5 py-4">Rating</th>
                  <th className="px-5 py-4">Approval</th>
                  <th className="px-5 py-4">Account</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCaregivers.map((cg) => (
                  <tr
                    key={cg.id}
                    className="border-b border-slate-50 transition hover:bg-blue-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar url={cg.avatarUrl} name={cg.fullName} />
                        <div>
                          <p className="font-bold text-slate-900">
                            {cg.fullName}
                          </p>
                          <p className="text-xs text-slate-400">
                            Joined {formatDate(cg.joinedAt)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {cg.email}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {cg.city || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                        {cg.experienceYears} {cg.experienceYears === 1 ? "Year" : "Years"}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-800">
                      £{cg.hourlyRate}/hr
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-bold text-slate-800">
                          {cg.totalBookings} Total
                        </span>
                        <span className="text-green-600">
                          {cg.completedBookings} Completed
                        </span>
                        <span className="text-red-500">
                          {cg.cancelledBookings} Cancelled
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1 font-bold text-slate-800">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        {cg.averageRating ? cg.averageRating.toFixed(1) : "0.0"}
                      </div>
                      <p className="text-xs text-slate-400">
                        {cg.totalReviews} Reviews
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      {approvalBadge(cg.approvalStatus)}
                    </td>

                    <td className="px-5 py-4">
                      {accountBadge(cg.accountStatus)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewCaregiver(cg)}
                          title="View"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        {cg.accountStatus === "active" && (
                          <button
                            onClick={() => suspendCaregiver(cg.id)}
                            title="Suspend"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-200"
                          >
                            <Shield size={14} />
                            Suspend
                          </button>
                        )}

                        {cg.accountStatus === "suspended" && (
                          <button
                            onClick={() => reactivateCaregiver(cg.id)}
                            title="Reactivate"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-3 py-2 text-xs font-bold text-green-700 transition hover:-translate-y-0.5 hover:bg-green-200"
                          >
                            <RotateCcw size={14} />
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedCaregiver(cg);
                            setShowDeleteModal(true);
                          }}
                          title="Delete"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-red-100 px-3 py-2 text-xs font-bold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-200"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          {filteredCaregivers.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Users size={48} className="text-slate-300" />
              <p className="font-bold text-slate-500">
                No caregivers match your search.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* ========================================================= */}
      {/* ALERT TOAST */}
      {/* ========================================================= */}

      {alert && (
        <div
          className={`fixed bottom-6 right-6 z-[70] flex items-center gap-3 rounded-2xl border px-5 py-4 shadow-2xl transition-all animate-in fade-in slide-in-from-bottom-4 ${
            alert.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {alert.type === "success" ? (
            <CheckCircle size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <p className="text-sm font-semibold">{alert.message}</p>
          <button onClick={() => setAlert(null)} className="ml-2">
            <X size={16} />
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* PART 3A — CAREGIVER DETAIL MODAL (centered, responsive) */}
      {/* ========================================================= */}

      {selectedCaregiver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">

          {/* Backdrop */}
          <div
            onClick={() => setSelectedCaregiver(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          />

          {/* Modal panel */}
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-200 ease-out animate-in fade-in zoom-in-95">

            {/* Header */}
            <div className="shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-5 text-white sm:px-6 sm:py-6">

              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <Avatar url={selectedCaregiver.avatarUrl} name={selectedCaregiver.fullName} size={56} />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black sm:text-xl">{selectedCaregiver.fullName}</h2>
                    <p className="flex items-center gap-1.5 truncate text-xs text-blue-100 sm:text-sm">
                      <Mail size={13} className="shrink-0" /> <span className="truncate">{selectedCaregiver.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-blue-100 sm:text-sm">
                      <Phone size={13} className="shrink-0" /> {selectedCaregiver.phone || "—"}
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-blue-100 sm:text-sm">
                      <MapPin size={13} className="shrink-0" /> {selectedCaregiver.city || "—"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCaregiver(null)}
                  className="shrink-0 rounded-full bg-white/20 p-2 transition hover:bg-white/30"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {accountBadge(selectedCaregiver.accountStatus)}
                {approvalBadge(selectedCaregiver.approvalStatus)}
              </div>

            </div>

            {/* Tabs */}
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2 sm:px-4">
              {(
                [
                  ["overview", "Overview"],
                  ["bookings", "Bookings"],
                  ["reviews", "Reviews"],
                  ["documents", "Documents"],
                  ["performance", "Performance"],
                  ["account", "Account"],
                ] as [Tab, string][]
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`relative shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-bold transition-all sm:px-4 sm:text-sm ${
                    activeTab === key
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 transition-opacity duration-200 sm:px-6 sm:py-6">

              {/* ================= OVERVIEW TAB ================= */}
              {activeTab === "overview" && (
                <div className="space-y-5">

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                    <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                      Biography
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {selectedCaregiver.bio || "No biography provided."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ["Gender", selectedCaregiver.gender || "—"],
                      ["Date of Birth", formatDate(selectedCaregiver.dob)],
                      ["Experience", `${selectedCaregiver.experienceYears} Years`],
                      ["Hourly Rate", `£${selectedCaregiver.hourlyRate}/hr`],
                      ["City", selectedCaregiver.city || "—"],
                      ["Joined Date", formatDate(selectedCaregiver.joinedAt)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-400">Address</p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {selectedCaregiver.address || "—"}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-400">Services</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedCaregiver.services?.length ? (
                        selectedCaregiver.services.map((s: any, i: number) => (
                          <span
                            key={i}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700"
                          >
                            {typeof s === "string" ? s : s?.name || "Service"}
                          </span>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">No services listed.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <p className="text-xs font-bold uppercase text-slate-400">Availability</p>
                    <p className="mt-1 text-sm text-slate-600">
                      {selectedCaregiver.availability
                        ? typeof selectedCaregiver.availability === "string"
                          ? selectedCaregiver.availability
                          : JSON.stringify(selectedCaregiver.availability)
                        : "Not specified."}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[
                      ["Documents", selectedCaregiver.documents?.length ?? 0],
                      ["Avg Rating", (selectedCaregiver.averageRating || 0).toFixed(1)],
                      ["Total Reviews", selectedCaregiver.totalReviews ?? 0],
                      ["Total Bookings", selectedCaregiver.totalBookings ?? 0],
                      ["Completed", selectedCaregiver.completedBookings ?? 0],
                      ["Cancelled", selectedCaregiver.cancelledBookings ?? 0],
                      ["Pending", selectedCaregiver.pendingBookings ?? 0],
                      ["Accepted", selectedCaregiver.acceptedBookings ?? 0],
                    ].map(([label, value]) => (
                      <div
                        key={label as string}
                        className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-center"
                      >
                        <p className="text-2xl font-black text-blue-700">{value}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* ================= BOOKINGS TAB ================= */}
              {activeTab === "bookings" && (
                <div className="space-y-4">
                  {selectedCaregiver.bookings?.length ? (
                    selectedCaregiver.bookings.map((b) => (
                      <div
                        key={b.id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-slate-800">
                            {b.services?.name || "Service"}
                          </p>
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                              b.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : b.status === "cancelled"
                                ? "bg-red-100 text-red-700"
                                : b.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-blue-100 text-blue-700"
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>

                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar size={13} />
                          {formatDate(b.start_date)} — {formatDate(b.end_date)}
                        </p>

                        {b.status === "cancelled" && (
                          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3">
                            <p className="flex items-center gap-1.5 text-sm font-bold text-red-700">
                              <AlertTriangle size={14} />
                              Cancelled by {b.cancelled_by === "caregiver" ? "Caregiver" : "Family"}
                            </p>
                            {b.cancel_reason && (
                              <p className="mt-1 text-xs text-red-600">
                                Reason: {b.cancel_reason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <EmptyState label="No bookings available" />
                  )}
                </div>
              )}

              {/* ================= REVIEWS TAB ================= */}
              {activeTab === "reviews" && (
                <div className="space-y-4">
                  {selectedCaregiver.reviews?.length ? (
                    selectedCaregiver.reviews.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar
                            url={r.profiles?.avatar_url}
                            name={r.profiles?.full_name || "Reviewer"}
                            size={36}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-bold text-slate-800">
                              {r.profiles?.full_name || "Anonymous"}
                            </p>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  size={13}
                                  className={
                                    i < r.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-slate-200"
                                  }
                                />
                              ))}
                            </div>
                          </div>
                          <p className="shrink-0 text-xs text-slate-400">{formatDate(r.created_at)}</p>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">{r.comment}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState label="No reviews available" />
                  )}
                </div>
              )}

              {/* ================= DOCUMENTS TAB ================= */}
              {activeTab === "documents" && (
                <div className="space-y-4">
                  {selectedCaregiver.documents?.length ? (
                    selectedCaregiver.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-800">
                              {doc.label || doc.type}
                            </p>
                            <p className="text-xs text-slate-400">
                              Uploaded {formatDate(doc.uploaded_at)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                              doc.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : doc.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {doc.status}
                          </span>

                          {(doc.fileUrl || doc.url) && (
                            <button
                              type="button"
                              onClick={() => setPreviewDoc(doc)}
                              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-blue-700 cursor-pointer shadow-sm active:scale-95"
                            >
                              <Eye size={14} />
                              View
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <EmptyState label="No documents available" icon={<ImageOff size={40} className="text-slate-300" />} />
                  )}
                </div>
              )}

              {/* ================= PERFORMANCE TAB ================= */}
              {activeTab === "performance" && (
                <div className="space-y-6">

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-md">
                      <CheckCircle size={24} />
                      <p className="mt-6 text-3xl font-black">
                        {selectedCaregiver.completedBookings}
                      </p>
                      <p className="text-sm text-green-100">Completed</p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-red-500 to-red-600 p-5 text-white shadow-md">
                      <XCircle size={24} />
                      <p className="mt-6 text-3xl font-black">
                        {selectedCaregiver.cancelledBookings}
                      </p>
                      <p className="text-sm text-red-100">Cancelled</p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-500 p-5 text-white shadow-md">
                      <Clock3 size={24} />
                      <p className="mt-6 text-3xl font-black">
                        {selectedCaregiver.pendingBookings}
                      </p>
                      <p className="text-sm text-yellow-50">Pending</p>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-md">
                      <Briefcase size={24} />
                      <p className="mt-6 text-3xl font-black">
                        {selectedCaregiver.acceptedBookings}
                      </p>
                      <p className="text-sm text-blue-100">Accepted</p>
                    </div>
                  </div>

                  {(() => {
                    const total = selectedCaregiver.totalBookings || 0;
                    const completionRate = total
                      ? Math.round((selectedCaregiver.completedBookings / total) * 100)
                      : 0;
                    const cancellationRate = total
                      ? Math.round((selectedCaregiver.cancelledBookings / total) * 100)
                      : 0;
                    const ratingPct = ((selectedCaregiver.averageRating || 0) / 5) * 100;

                    return (
                      <div className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">

                        <ProgressRow
                          icon={<Award size={15} className="text-blue-600" />}
                          label="Rating Progress"
                          value={`${(selectedCaregiver.averageRating || 0).toFixed(1)} / 5.0`}
                          pct={ratingPct}
                          color="bg-blue-600"
                        />

                        <ProgressRow
                          icon={<Star size={15} className="text-yellow-500" />}
                          label="Review Count"
                          value={`${selectedCaregiver.totalReviews} reviews`}
                          pct={Math.min(selectedCaregiver.totalReviews * 5, 100)}
                          color="bg-yellow-500"
                        />

                        <ProgressRow
                          icon={<TrendingUp size={15} className="text-green-600" />}
                          label="Booking Completion %"
                          value={`${completionRate}%`}
                          pct={completionRate}
                          color="bg-green-600"
                        />

                        <ProgressRow
                          icon={<Ban size={15} className="text-red-500" />}
                          label="Cancellation %"
                          value={`${cancellationRate}%`}
                          pct={cancellationRate}
                          color="bg-red-500"
                        />

                      </div>
                    );
                  })()}

                </div>
              )}

              {/* ================= ACCOUNT TAB ================= */}
              {activeTab === "account" && (
                <div className="space-y-4">

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ["Email", selectedCaregiver.email],
                      ["Phone", selectedCaregiver.phone || "—"],
                      ["Approval Status", selectedCaregiver.approvalStatus],
                      ["Account Status", selectedCaregiver.accountStatus],
                      ["Joined Date", formatDate(selectedCaregiver.joinedAt)],
                      ["Deleted", selectedCaregiver.isDeleted ? "Yes" : "No"],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                        <p className="mt-1 truncate text-sm font-bold capitalize text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
                    <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-blue-600">
                      <MapPin size={13} /> Coordinates
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Latitude</p>
                        <p className="font-bold text-slate-800">
                          {selectedCaregiver.latitude ?? "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Longitude</p>
                        <p className="font-bold text-slate-800">
                          {selectedCaregiver.longitude ?? "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>

            {/* ========================================================= */}
            {/* PART 3C — MODAL FOOTER */}
            {/* ========================================================= */}

            <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">

              {selectedCaregiver.approvalStatus === "pending" && (
                <>
                  <button
                    disabled={actionLoading}
                    onClick={() => approveCaregiver(selectedCaregiver.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-green-700 disabled:opacity-50"
                  >
                    <CheckCircle size={15} />
                    Approve
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={() => rejectCaregiver(selectedCaregiver.id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-red-100 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-200 disabled:opacity-50"
                  >
                    <XCircle size={15} />
                    Reject
                  </button>
                </>
              )}

              {selectedCaregiver.accountStatus === "active" && (
                <button
                  disabled={actionLoading}
                  onClick={() => suspendCaregiver(selectedCaregiver.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-100 px-4 py-2.5 text-sm font-bold text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-200 disabled:opacity-50"
                >
                  <Shield size={15} />
                  Suspend
                </button>
              )}

              {selectedCaregiver.accountStatus === "suspended" && (
                <button
                  disabled={actionLoading}
                  onClick={() => reactivateCaregiver(selectedCaregiver.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-4 py-2.5 text-sm font-bold text-green-700 transition hover:-translate-y-0.5 hover:bg-green-200 disabled:opacity-50"
                >
                  <RotateCcw size={15} />
                  Reactivate
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-700"
              >
                <Trash2 size={15} />
                Delete
              </button>

              <button
                onClick={() => setSelectedCaregiver(null)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <X size={15} />
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PART 3B — DELETE MODAL */}
      {/* ========================================================= */}

      {showDeleteModal && selectedCaregiver && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <div
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteReason("");
            }}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />

          <div className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl transition-all animate-in fade-in zoom-in-95">

            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">Delete Caregiver</h3>
                <p className="text-xs text-slate-400">{selectedCaregiver.fullName}</p>
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              This will soft-delete the caregiver's account. Please provide a reason
              for this action — it will be recorded for audit purposes.
            </p>

            <textarea
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Enter reason for deletion..."
              rows={4}
              className="mt-4 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-red-400 focus:bg-white"
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteReason("");
                }}
                className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                disabled={!deleteReason.trim() || actionLoading}
                onClick={deleteCaregiver}
                className="flex-1 rounded-2xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ================= DOCUMENT PREVIEW MODAL ================= */}
      {previewDoc && (
        <div className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-100 max-w-3xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{previewDoc.label || previewDoc.type}</h3>
                  <p className="text-xs text-slate-400 font-semibold">Verification Credential Document</p>
                </div>
              </div>

              <button
                onClick={() => setPreviewDoc(null)}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 p-2 text-slate-500 transition shadow-sm cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Container */}
            <div className="flex-1 overflow-auto bg-slate-950/5 rounded-2xl border border-slate-200/80 p-4 flex items-center justify-center min-h-[320px] max-h-[60vh] relative">
              {(previewDoc.fileUrl || previewDoc.url) ? (
                (previewDoc.fileUrl || previewDoc.url || '').startsWith('data:application/pdf') || (previewDoc.fileUrl || previewDoc.url || '').endsWith('.pdf') ? (
                  <iframe
                    src={previewDoc.fileUrl || previewDoc.url}
                    title={previewDoc.type}
                    className="w-full h-full min-h-[450px] rounded-xl border-0"
                  />
                ) : (previewDoc.fileUrl || previewDoc.url || '').startsWith('data:image') || (previewDoc.fileUrl || previewDoc.url || '').match(/\.(jpeg|jpg|png|gif|webp|svg)/i) || (previewDoc.fileUrl || previewDoc.url || '').includes('placehold.co') || (previewDoc.fileUrl || previewDoc.url || '').includes('unsplash.com') || (previewDoc.fileUrl || previewDoc.url || '').startsWith('http') ? (
                  <img
                    src={previewDoc.fileUrl || previewDoc.url}
                    alt={previewDoc.type}
                    className="max-h-[55vh] max-w-full rounded-xl object-contain shadow-md border border-slate-200 bg-white"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <FileText size={48} className="mx-auto text-blue-500 animate-pulse" />
                    <p className="text-xs font-bold text-slate-700">Verification Document Loaded</p>
                    <p className="text-[10px] text-slate-400 max-w-md mx-auto truncate bg-white p-2 rounded-lg border">{(previewDoc.fileUrl || previewDoc.url || '').slice(0, 120)}...</p>
                  </div>
                )
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <ImageOff size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No file content found for this document.</p>
                </div>
              )}
            </div>

            {/* Footer controls */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                previewDoc.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                previewDoc.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                'bg-yellow-100 text-yellow-700 border-yellow-200'
              }`}>
                Status: {previewDoc.status || 'pending'}
              </span>

              <div className="flex items-center gap-3">
                {(previewDoc.fileUrl || previewDoc.url) && (
                  <button
                    onClick={() => {
                      const fileTarget = previewDoc.fileUrl || previewDoc.url || '';
                      const a = document.createElement('a');
                      a.href = fileTarget;
                      a.download = `${(previewDoc.type || 'document').replace(/\s+/g, '_')}`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition cursor-pointer"
                  >
                    <span>Download File</span>
                  </button>
                )}

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 px-5 py-2.5 text-xs font-bold text-white shadow-md transition cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// ===============================================================
// SHARED SUBCOMPONENTS
// ===============================================================

function EmptyState({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 py-16 text-center">
      {icon || (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-300">
          <Star size={28} />
        </div>
      )}
      <p className="text-sm font-bold text-slate-400">{label}</p>
    </div>
  );
}

function ProgressRow({
  icon,
  label,
  value,
  pct,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  pct: number;
  color: string;
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 font-bold text-slate-700">
          {icon}
          {label}
        </span>
        <span className="font-bold text-slate-500">{value}</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full ${color} transition-all duration-700`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}