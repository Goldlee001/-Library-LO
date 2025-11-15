"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Users, Search, X, Trash2, UserCheck, UserX } from "lucide-react";
import AdminHeader from "@/components/ui/admin-header";
import AdminSidebar from "@/components/ui/admin-sidebar";
import AdminNav from "@/components/ui/admin-nav";

// Helpers
const getStatusClasses = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    case "Suspended":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Active":
      return <UserCheck className="w-4 h-4 mr-1" />;
    case "Suspended":
      return <UserX className="w-4 h-4 mr-1" />;
    default:
      return null;
  }
};

export default function AdminUserManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Modal state for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setError(null);
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        setError(msg?.error || `Failed to load users (${res.status})`);
        setUsers([]);
        return;
      }
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || "Unable to load users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!mounted) return;
      await loadUsers();
    })();
    return () => {
      mounted = false;
    };
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  const handleSuspend = useCallback(
    async (id: string) => {
      setError(null);
      try {
        setLoading(true);
        const current = users.find((u) => u.id === id);
        const newStatus = current?.status === "Suspended" ? "Active" : "Suspended";
        const res = await fetch(`/api/admin/users/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          setError(msg?.error || `Failed to update user (${res.status})`);
          return;
        }
        await loadUsers();
      } catch (e: any) {
        setError(e?.message || "Suspend/activate failed");
      } finally {
        setLoading(false);
      }
    },
    [users, loadUsers]
  );

  // ✅ Replaces window.confirm with modal
  const handleDelete = useCallback((id: string) => {
    setDeleteUserId(id);
    setShowDeleteConfirm(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteUserId) return;
    setShowDeleteConfirm(false);
    setError(null);
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${deleteUserId}`, { method: "DELETE" });
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        setError(msg?.error || `Failed to delete user (${res.status})`);
        return;
      }
      await loadUsers();
    } catch (e: any) {
      setError(e?.message || "Delete failed");
    } finally {
      setLoading(false);
      setDeleteUserId(null);
    }
  }, [deleteUserId, loadUsers]);

  const summary = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const suspended = users.filter((u) => u.status === "Suspended").length;
    const newThisWeek = users.filter(
      (u) => new Date(u.joined) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    return { total, active, suspended, newThisWeek };
  }, [users]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(d);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3edd7]  dark:bg-gray-950 font-inter">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 pb-20 md:pb-8 mb-[50px] md:mb-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              User Management 👥
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage all registered users and their investment status.
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {summary.total}
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400">
                {summary.active}
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">Suspended</p>
              <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400">
                {summary.suspended}
              </h2>
            </div>
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow border border-gray-200 dark:border-gray-800">
              <p className="text-sm text-gray-500 dark:text-gray-400">New This Week</p>
              <h2 className="text-2xl font-semibold text-green-00">{summary.newThisWeek}</h2>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3 mb-6">
            <div className="relative w-full md:w-1/2">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="pl-9 pr-3 py-2 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-[#72a210] outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* User List */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                All Users
              </h2>
              <Users className="w-6 h-6 text-blue-600" />
            </div>

            {loading && (
              <div className="py-6 text-sm text-gray-600 dark:text-gray-400">
                Loading users...
              </div>
            )}
            {error && (
              <div className="py-2 text-sm text-red-600 dark:text-red-400">{error}</div>
            )}

            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-5 gap-6 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              <div>Name</div>
              <div>Email</div>
              <div>Joined</div>
              <div>Status</div>
              <div className="text-right">Actions</div>
            </div>

            {/* User Rows */}
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 gap-5 lg:grid-cols-5 lg:gap-6 lg:items-center border-b border-gray-100 dark:border-gray-800 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{user.name}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(user.joined)}</div>
                  <div>
                    <div
                      className={`flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-[5px] ${getStatusClasses(
                        user.status
                      )}`}
                    >
                      {getStatusIcon(user.status)}
                      {user.status}
                    </div>
                  </div>

                  <div
                    className="
                      flex items-center justify-end gap-2
                      pt-2 sm:pt-0 whitespace-nowrap
                    "
                  >
                    <button
                      onClick={() => handleSuspend(user.id)}
                      className="
                        px-3 py-1.5 
                        bg-yellow-500 text-white rounded-md text-sm font-medium 
                        hover:bg-yellow-600 transition
                      "
                      disabled={loading}
                    >
                      <X className="w-4 h-4 inline mr-1" />{" "}
                      {user.status === "Suspended" ? "Activate" : "Suspend"}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="
                        px-3 py-1.5 
                        bg-red-600 text-white rounded-md text-sm font-medium 
                        hover:bg-red-700 transition
                      "
                      disabled={loading}
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500 dark:text-gray-400">
                <Users className="w-10 h-10 mb-3 text-blue-600" />
                <p className="text-lg font-medium">No users found</p>
                <p className="text-sm">When users register, they’ll appear here.</p>
              </div>
            )}
          </div>
        </main>

        {/* ✅ Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 p-6 text-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to permanently delete this user? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <AdminNav />
      </div>
    </div>
  );
}
