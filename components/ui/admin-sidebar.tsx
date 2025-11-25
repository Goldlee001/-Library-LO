"use client";

import { useState } from "react";
import { Files } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  CreditCard,
  Users,
  Coins,
  DollarSign,
  LayoutDashboard,
  Settings,
  LogOut,
  UserSquare2,
  GraduationCap,
  Briefcase,
  Wallet,
  X,
  Upload,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminSidebar({
  sidebarOpen,
  setSidebarOpen,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isUploadsOpen, setIsUploadsOpen] = useState(false); // 👈 state for dropdown

  const basePath = "/admin-dashboard";

  const sidebarItems = [
    {
      name: "All Content",
      icon: Files,
      href: `${basePath}/all-content`,
    },
    {
      name: "User Management",
      icon: Users,
      href: `${basePath}/user-management`,
    },
    {
      name: "Role Settings",
      icon: Settings,
      href: `${basePath}/settings`,
    },
    {
      name: "Switch to User",
      icon: GraduationCap,
      href: `/user-dashboard/dashboard`,
    },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const handleLogout = () => {
    setShowLogoutConfirm(false);
    router.push("/auth/login");
  };

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-30 
        w-[85%] sm:w-[70%] md:w-[60%] lg:w-64
        transform bg-[#f3edd7] dark:bg-[#251d1d] border-r border-gray-200 dark:border-[#1a1515]
        transition-transform duration-200 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 shadow-xl`}
      >
        {/* ✅ Logo + Close Button */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-[#1a1518]">
          <Link
            href="/"
            className="text-2xl font-serif font-extrabold text-blue-700"
          >
            <Image
              src="/images/logo.jpg" // replace with your image path
              alt="Logo" // description for accessibility
              width={40}
              height={40}
              className="rounded-full border border-gray-300 object-cover"
            />
          </Link>
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* ✅ Navigation Items */}
        <nav className="px-3 py-6 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {/* 🔽 Uploads Dropdown */}
          <div>
            <button
              onClick={() => setIsUploadsOpen(!isUploadsOpen)}
              className={`flex items-center justify-between w-full px-3 py-2 rounded-md transition-colors duration-200 ${
                pathname?.startsWith(`${basePath}/uploads`)
                  ? "text-blue-500 font-medium bg-gray-100"
                  : "text-gray-700 hover:bg-blue-600 hover:text-white"
              }`}
            >
              <span className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Uploads
              </span>
              {isUploadsOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {/* Dropdown content */}
            {isUploadsOpen && (
              <div className="ml-8 mt-1 space-y-1">
                <Link
                  href={`${basePath}/uploads/dashboard-upload`}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    isActive(`${basePath}/uploads/dashboard-upload`)
                      ? "text-blue-500 font-medium bg-gray-100"
                      : "text-gray-700 hover:bg-blue-600 hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  Dashboard Upload
                </Link>
                <Link
                  href={`${basePath}/uploads/pages-upload`}
                  className={`block px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                    isActive(`${basePath}/uploads/pages-upload`)
                      ? "text-blue-500 font-medium bg-gray-100"
                      : "text-gray-700 hover:bg-blue-600 hover:text-white"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  Pages Upload
                </Link>
              </div>
            )}
          </div>

          {/* Other Sidebar Items */}
          {sidebarItems.map(({ name, icon: Icon, href }) => (
            <Link
              key={name}
              href={href}
              className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 ${
                isActive(href)
                  ? "text-blue-500 font-medium bg-gray-100"
                  : "text-gray-700 hover:bg-blue-600 hover:text-white"
              }`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 mr-2" /> {name}
            </Link>
          ))}

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center w-full px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-600 hover:text-white transition-colors duration-200 rounded-md"
          >
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </button>
        </nav>
      </aside>

      {/* ✅ Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-80 p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Confirm Logout
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to log out of your account?
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
