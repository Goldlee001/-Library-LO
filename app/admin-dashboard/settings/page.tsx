"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Shield, UserCog, Users, ChevronDown } from "lucide-react";
import AdminHeader from "@/components/ui/admin-header";
import AdminSidebar from "@/components/ui/admin-sidebar";
import AdminNav from "@/components/ui/admin-nav";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

// ✅ Define user type for strong typing
type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

export default function AdminRoleManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧩 Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data: User[] = await res.json();
        setUsers(data);
      } catch (err: unknown) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 🛠️ Handle role update
  const handleRoleChange = async (id: string, newRole: "admin" | "user") => {
    try {
      const res = await fetch(`/api/admin/users/${id}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || "Failed to update user role");
      }

      // Update local state after success
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
      );

      toast.success("Role updated successfully");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Update failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f3edd7]  dark:bg-gray-950 font-inter">
      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <AdminHeader setSidebarOpen={setSidebarOpen} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 pb-20 md:pb-8 mb-[50px] md:mb-0">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Role Management{" "}
              <Shield className="inline w-8 h-8 text-blue-600" />
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Promote or demote users by changing their role below.
            </p>
          </div>

          {/* Users Table */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" /> All Users
              </h2>
              <UserCog className="w-6 h-6 text-blue-600" />
            </div>

            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-4 gap-4 border-b border-gray-200 dark:border-gray-700 pb-2 mb-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div className="text-right">Action</div>
            </div>

            {/* Table Rows */}
            {loading ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                No users found.
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-1 gap-3 lg:grid-cols-4 lg:gap-4 lg:items-center border-b border-gray-100 dark:border-gray-800 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </div>
                  <div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        user.role === "admin"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  {/* React Dropdown for Role Change */}
                  <div className="flex justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                        >
                          Change Role <ChevronDown className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end" className="w-32">
                        <DropdownMenuLabel>Select Role</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, "user")}
                          className="cursor-pointer"
                        >
                          User
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleRoleChange(user.id, "admin")}
                          className="cursor-pointer"
                        >
                          Admin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <AdminNav />
      </div>
    </div>
  );
}
