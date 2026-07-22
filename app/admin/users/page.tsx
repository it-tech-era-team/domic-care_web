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
  Calendar,
  X,
  AlertTriangle,
  RotateCcw,
  User,
  CalendarDays,
  UserCheck,
  TrendingUp,
  Award,
  ChevronRight,
  MessageSquare,
} from "lucide-react";

interface Booking {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  notes: string;
  serviceName: string;
  caregiverName: string;
  caregiverAvatar: string;
  createdAt: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  caregiverName: string;
  createdAt: string;
}

interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: string;
  accountStatus: string;
  isDeleted: boolean;
  joinedAt: string;

  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  activeBookings: number;
  pendingBookings: number;

  bookings: Booking[];
  reviews: Review[];
}

type Alert = { type: "success" | "error"; message: string } | null;
type Tab = "overview" | "bookings" | "reviews" | "performance" | "account";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [alert, setAlert] = useState<Alert>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users");
      setUsers(data.users ?? []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => setAlert(null), 4000);
    return () => clearTimeout(timer);
  }, [alert]);

  useEffect(() => {
    if (!selectedUser) return;
    const fresh = users.find((u) => u.id === selectedUser.id);
    if (fresh) setSelectedUser(fresh);
  }, [users]);

  useEffect(() => {
    if (selectedUser) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [selectedUser]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.phone.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "all"
          ? true
          : u.accountStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, search, statusFilter]);

  const stats = {
    total: users.length,
    active: users.filter((u) => u.accountStatus === "active" && !u.isDeleted).length,
    suspended: users.filter((u) => u.accountStatus === "suspended").length,
    deleted: users.filter((u) => u.accountStatus === "deleted" || u.isDeleted).length,
  };

  function viewUser(u: UserAccount) {
    setSelectedUser(u);
    setActiveTab("overview");
  }

  async function suspendUser(id: string) {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users?id=${id}&action=suspend`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAlert({ type: "success", message: "User suspended successfully." });
      await loadUsers();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to suspend user." });
    } finally {
      setActionLoading(false);
    }
  }

  async function reactivateUser(id: string) {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users?id=${id}&action=reactivate`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAlert({ type: "success", message: "User reactivated successfully." });
      await loadUsers();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to reactivate user." });
    } finally {
      setActionLoading(false);
    }
  }

  async function deleteUser() {
    if (!selectedUser || !deleteReason.trim()) return;

    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users?id=${selectedUser.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAlert({ type: "success", message: "User deleted successfully." });
      setShowDeleteModal(false);
      setDeleteReason("");
      setSelectedUser(null);
      await loadUsers();
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Failed to delete user." });
    } finally {
      setActionLoading(false);
    }
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
            Failed to load users
          </h2>
          <p className="mt-3 text-sm text-slate-600">{error}</p>
          <button
            onClick={loadUsers}
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

      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              User Management
            </h1>

            <p className="mt-2 text-slate-500">
              Manage user accounts, monitor bookings, reviews and account activity.
            </p>
          </div>

          <button
            onClick={loadUsers}
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

            <h2 className="mt-8 text-5xl font-black">{stats.total}</h2>
            <p className="mt-2 text-blue-100">Registered Users</p>
          </div>

          <div className="rounded-3xl border border-green-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <CheckCircle className="text-green-600" size={34} />
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                Active
              </span>
            </div>

            <h2 className="mt-8 text-5xl font-black text-green-600">{stats.active}</h2>
            <p className="mt-2 text-slate-500">Active Users</p>
          </div>

          <div className="rounded-3xl border border-yellow-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <Clock3 className="text-yellow-600" size={34} />
              <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-700">
                Suspended
              </span>
            </div>

            <h2 className="mt-8 text-5xl font-black text-yellow-500">{stats.suspended}</h2>
            <p className="mt-2 text-slate-500">Suspended Accounts</p>
          </div>

          <div className="rounded-3xl border border-red-200 bg-white p-7 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <XCircle className="text-red-600" size={34} />
              <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                Deleted
              </span>
            </div>

            <h2 className="mt-8 text-5xl font-black text-red-600">{stats.deleted}</h2>
            <p className="mt-2 text-slate-500">Deleted Accounts</p>
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
                placeholder="Search by user name, phone or email..."
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
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white"
                >
                  <option value="all">All Users</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="deleted">Deleted</option>
                </select>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================= */}
        {/* USER TABLE */}
        {/* ========================================================= */}

        <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left text-sm">

              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Bookings</th>
                  <th className="px-5 py-4">Account</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-50 transition hover:bg-blue-50/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar url={u.avatarUrl} name={u.fullName} />
                        <div>
                          <p className="font-bold text-slate-900">{u.fullName}</p>
                          <p className="text-xs text-slate-400">Joined {formatDate(u.joinedAt)}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600">{u.email || "—"}</td>

                    <td className="px-5 py-4 text-slate-600">{u.phone || "—"}</td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <span className="font-bold text-slate-800">{u.totalBookings} Total</span>
                        <span className="text-green-600">{u.completedBookings} Completed</span>
                        <span className="text-red-500">{u.cancelledBookings} Cancelled</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">{accountBadge(u.accountStatus)}</td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewUser(u)}
                          title="View"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-blue-700"
                        >
                          <Eye size={14} />
                          View
                        </button>

                        {u.accountStatus === "active" && (
                          <button
                            onClick={() => suspendUser(u.id)}
                            title="Suspend"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-200"
                          >
                            <Shield size={14} />
                            Suspend
                          </button>
                        )}

                        {u.accountStatus === "suspended" && (
                          <button
                            onClick={() => reactivateUser(u.id)}
                            title="Reactivate"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-3 py-2 text-xs font-bold text-green-700 transition hover:-translate-y-0.5 hover:bg-green-200"
                          >
                            <RotateCcw size={14} />
                            Reactivate
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedUser(u);
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

          {filteredUsers.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <Users size={48} className="text-slate-300" />
              <p className="font-bold text-slate-500">
                No users match your search.
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
      {/* USER DETAIL MODAL */}
      {/* ========================================================= */}

      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">

          {/* Backdrop */}
          <div
            onClick={() => setSelectedUser(null)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          />

          {/* Modal panel */}
          <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl transition-all duration-200 ease-out animate-in fade-in zoom-in-95">

            {/* Header */}
            <div className="shrink-0 bg-gradient-to-br from-blue-600 to-blue-700 px-5 py-5 text-white sm:px-6 sm:py-6">

              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                  <Avatar url={selectedUser.avatarUrl} name={selectedUser.fullName} size={56} />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black sm:text-xl">{selectedUser.fullName}</h2>
                    <p className="flex items-center gap-1.5 truncate text-xs text-blue-100 sm:text-sm">
                      <Mail size={13} className="shrink-0" /> <span className="truncate">{selectedUser.email}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-blue-100 sm:text-sm">
                      <Phone size={13} className="shrink-0" /> {selectedUser.phone || "—"}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedUser(null)}
                  className="shrink-0 rounded-full bg-white/20 p-2 transition hover:bg-white/30"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {accountBadge(selectedUser.accountStatus)}
              </div>

            </div>

            {/* Tabs */}
            <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-100 bg-white px-3 py-2 sm:px-4">
              {(
                [
                  ["overview", "Overview"],
                  ["bookings", "Bookings"],
                  ["reviews", "Reviews"],
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

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {[
                      ["Full Name", selectedUser.fullName],
                      ["Email Address", selectedUser.email || "—"],
                      ["Phone Number", selectedUser.phone || "—"],
                      ["Account Role", "Family Client"],
                      ["Account Status", selectedUser.accountStatus],
                      ["Joined Date", formatDate(selectedUser.joinedAt)],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                        <p className="text-xs font-bold uppercase text-slate-400">{label}</p>
                        <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[
                      ["Total Bookings", selectedUser.totalBookings ?? 0],
                      ["Completed", selectedUser.completedBookings ?? 0],
                      ["Cancelled", selectedUser.cancelledBookings ?? 0],
                      ["Active", selectedUser.activeBookings ?? 0],
                      ["Pending", selectedUser.pendingBookings ?? 0],
                      ["Reviews Given", selectedUser.reviews?.length ?? 0],
                    ].map(([label, value]) => (
                      <div
                        key={label as string}
                        className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 text-center"
                      >
                        <p className="text-2xl font-black text-blue-700">{value}</p>
                        <p className="mt-1 text-xs font-bold text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* ================= BOOKINGS TAB ================= */}
              {activeTab === "bookings" && (
                <div className="space-y-4">
                  {selectedUser.bookings?.length ? (
                    selectedUser.bookings.map((b) => (
                      <div
                        key={b.id}
                        className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar url={b.caregiverAvatar} name={b.caregiverName} size={40} />
                          <div>
                            <p className="font-bold text-slate-800">{b.serviceName} with {b.caregiverName}</p>
                            <p className="text-xs text-slate-400">Scheduled: {formatDate(b.startDate)}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${
                          b.status === "completed" ? "bg-green-100 text-green-700 border-green-200" :
                          b.status === "cancelled" ? "bg-red-100 text-red-700 border-red-200" :
                          "bg-blue-100 text-blue-700 border-blue-200"
                        }`}>
                          {b.status}
                        </span>
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
                  {selectedUser.reviews?.length ? (
                    selectedUser.reviews.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-slate-800">For {r.caregiverName}</p>
                          <div className="flex items-center gap-1 font-bold text-yellow-500 text-xs">
                            <Star size={14} className="fill-yellow-400 text-yellow-400" />
                            {r.rating}.0
                          </div>
                        </div>
                        <p className="text-xs text-slate-600 italic">&ldquo;{r.comment}&rdquo;</p>
                        <p className="text-[10px] text-slate-400">{formatDate(r.createdAt)}</p>
                      </div>
                    ))
                  ) : (
                    <EmptyState label="No reviews available" />
                  )}
                </div>
              )}

              {/* ================= PERFORMANCE TAB ================= */}
              {activeTab === "performance" && (
                <div className="space-y-6">

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase text-slate-400">Total Activity</p>
                      <p className="mt-2 text-2xl font-black text-slate-800">
                        {selectedUser.totalBookings} Sessions
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                      <p className="text-xs font-bold uppercase text-slate-400">Completion Rate</p>
                      <p className="mt-2 text-2xl font-black text-green-600">
                        {selectedUser.totalBookings > 0
                          ? Math.round((selectedUser.completedBookings / selectedUser.totalBookings) * 100)
                          : 100}%
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
                    <p className="text-xs font-bold uppercase text-slate-400">Booking Performance Distribution</p>
                    
                    <ProgressRow
                      icon={<CheckCircle size={16} className="text-green-600" />}
                      label="Completed Sessions"
                      value={`${selectedUser.completedBookings}`}
                      pct={selectedUser.totalBookings ? (selectedUser.completedBookings / selectedUser.totalBookings) * 100 : 0}
                      color="bg-green-500"
                    />

                    <ProgressRow
                      icon={<CalendarDays size={16} className="text-blue-600" />}
                      label="Active Sessions"
                      value={`${selectedUser.activeBookings}`}
                      pct={selectedUser.totalBookings ? (selectedUser.activeBookings / selectedUser.totalBookings) * 100 : 0}
                      color="bg-blue-500"
                    />

                    <ProgressRow
                      icon={<XCircle size={16} className="text-red-500" />}
                      label="Cancelled Sessions"
                      value={`${selectedUser.cancelledBookings}`}
                      pct={selectedUser.totalBookings ? (selectedUser.cancelledBookings / selectedUser.totalBookings) * 100 : 0}
                      color="bg-red-500"
                    />
                  </div>

                </div>
              )}

              {/* ================= ACCOUNT TAB ================= */}
              {activeTab === "account" && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">Account Status</p>
                      <p className="text-xs text-slate-400 mt-0.5">Currently {selectedUser.accountStatus}</p>
                    </div>

                    {selectedUser.accountStatus === "active" ? (
                      <button
                        onClick={() => suspendUser(selectedUser.id)}
                        disabled={actionLoading}
                        className="rounded-xl bg-orange-100 px-4 py-2 text-xs font-bold text-orange-700 transition hover:bg-orange-200 cursor-pointer"
                      >
                        Suspend User
                      </button>
                    ) : (
                      <button
                        onClick={() => reactivateUser(selectedUser.id)}
                        disabled={actionLoading}
                        className="rounded-xl bg-green-100 px-4 py-2 text-xs font-bold text-green-700 transition hover:bg-green-200 cursor-pointer"
                      >
                        Reactivate User
                      </button>
                    )}
                  </div>

                  <div className="rounded-2xl border border-red-100 bg-red-50/30 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-red-900">Delete Account</p>
                      <p className="text-xs text-red-600 mt-0.5">Permanently soft-delete this user account</p>
                    </div>

                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700 cursor-pointer"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="flex shrink-0 flex-wrap gap-2 border-t border-slate-100 bg-white px-5 py-4 sm:px-6">

              {selectedUser.accountStatus === "active" && (
                <button
                  disabled={actionLoading}
                  onClick={() => suspendUser(selectedUser.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-orange-100 px-4 py-2.5 text-sm font-bold text-orange-700 transition hover:-translate-y-0.5 hover:bg-orange-200 disabled:opacity-50 cursor-pointer"
                >
                  <Shield size={15} />
                  Suspend
                </button>
              )}

              {selectedUser.accountStatus === "suspended" && (
                <button
                  disabled={actionLoading}
                  onClick={() => reactivateUser(selectedUser.id)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-4 py-2.5 text-sm font-bold text-green-700 transition hover:-translate-y-0.5 hover:bg-green-200 disabled:opacity-50 cursor-pointer"
                >
                  <RotateCcw size={15} />
                  Reactivate
                </button>
              )}

              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-red-700 cursor-pointer"
              >
                <Trash2 size={15} />
                Delete
              </button>

              <button
                onClick={() => setSelectedUser(null)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:-translate-y-0.5 hover:bg-slate-50 cursor-pointer"
              >
                <X size={15} />
                Close
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ========================================================= */}
      {/* PART 3B — DELETE CONFIRMATION MODAL */}
      {/* ========================================================= */}

      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <div
            onClick={() => setShowDeleteModal(false)}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl transition-all duration-200 ease-out animate-in fade-in zoom-in-95">

            <div className="flex flex-col items-center text-center">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                <Trash2 size={24} />
              </div>

              <h3 className="mt-4 text-lg font-black text-slate-900">
                Delete User Account?
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Are you sure you want to delete{" "}
                <span className="font-bold text-slate-800">
                  {selectedUser.fullName}
                </span>
                ? This action will disable login and soft-delete user records.
              </p>

              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="Reason for deletion (required)..."
                className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-red-500 focus:bg-white"
                rows={3}
              />

              <div className="mt-6 flex w-full gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  disabled={actionLoading || !deleteReason.trim()}
                  onClick={deleteUser}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? "Deleting..." : "Delete"}
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
