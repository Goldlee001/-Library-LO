"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, ChevronDown } from "lucide-react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function UserHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";
  const isAdmin = (session?.user?.role || "user") === "admin";
  const userName = (
    session?.user?.name ||
    session?.user?.username ||
    "User"
  ).toString();
  const userEmail = (session?.user?.email || "").toString();
  const userAvatar = (session?.user?.avatar || "").toString();
  const userInitial = userName?.trim()?.charAt(0)?.toUpperCase() || "U";

  const getLinkClasses = (path) =>
    pathname.startsWith(path)
      ? "px-3 py-1 bg-gray-100 text-blue-700 border-b-4 border-blue-600"
      : "px-3 py-1 text-gray-600";

  return (
    <nav className="fixed top-0 left-0 w-full bg-[#f3edd7] shadow-sm border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4 md:px-8">
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

        <div className="hidden md:flex items-center space-x-6">
          <div className="flex text-sm font-medium border border-gray-300 rounded overflow-hidden">
            <Link href="/user-dashboard/dashboard">
              <button
                className={
                  getLinkClasses("/user-dashboard/dashboard") +
                  " border-r border-gray-300"
                }
              >
                All Content
              </button>
            </Link>
            <Link href="/user-dashboard/videos">
              <button className={getLinkClasses("/user-dashboard/videos")}>
                Videos
              </button>
            </Link>
            <Link href="/user-dashboard/images">
              <button className={getLinkClasses("/user-dashboard/images")}>
                Images
              </button>
            </Link>
            <Link href="/user-dashboard/pdfs">
              <button className={getLinkClasses("/user-dashboard/pdfs")}>
                PDFs
              </button>
            </Link>
          </div>

          {isAuthed && isAdmin && (
            <Link
              href="/admin-dashboard/user-management"
              className="text-sm font-medium"
            >
              <button className="px-3 py-1 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
                Admin Dashboard
              </button>
            </Link>
          )}

          {isAuthed ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                {userAvatar ? (
                  <Image
                    src={userAvatar}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    className="rounded-full border border-gray-300 object-cover"
                    style={{ width: "36px", height: "36px" }}
                  />
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full border border-gray-300 bg-blue-600 text-white"
                    style={{ width: "36px", height: "36px" }}
                    aria-label="User Initial"
                  >
                    <span className="text-sm font-semibold">{userInitial}</span>
                  </div>
                )}
                <span className="text-gray-700 font-medium">{userName}</span>
                <ChevronDown size={18} className="text-gray-600" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-md py-2 animate-fadeIn">
                  <Link
                    href="/user-dashboard/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    My Profile
                  </Link>
                  <Link
                    href="/user-dashboard/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Settings
                  </Link>
                  {isAuthed && isAdmin && (
                    <Link
                      href="/admin-dashboard/user-management"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="text-sm font-medium text-blue-700"
            >
              Sign in
            </Link>
          )}
        </div>

        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      <div
        className={`fixed top-0 left-0 h-full w-full bg-[#f3edd7] shadow-lg flex flex-col justify-between transform transition-transform duration-500 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:hidden z-40`}
      >
        <div>
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <Image
              src="/images/logo.jpg" // replace with your image path
              alt="Logo" // description for accessibility
              width={40}
              height={40}
              className="rounded-full border border-gray-300 object-cover"
            />
            <button onClick={() => setMenuOpen(false)}>
              <X size={24} className="text-gray-700" />
            </button>
          </div>

          <div className="p-4 space-y-4 text-lg font-semibold">
            <Link
              href="/user-dashboard/dashboard"
              className="block text-gray-800 hover:text-[#990000]"
              onClick={() => setMenuOpen(false)}
            >
              All Content
            </Link>
            <Link
              href="/user-dashboard/videos"
              className="block text-gray-700 hover:text-[#990000]"
              onClick={() => setMenuOpen(false)}
            >
              Videos
            </Link>
            <Link
              href="/user-dashboard/images"
              className="block text-gray-700 hover:text-[#990000]"
              onClick={() => setMenuOpen(false)}
            >
              Images
            </Link>
            <Link
              href="/user-dashboard/pdfs"
              className="block text-gray-700 hover:text-[#990000]"
              onClick={() => setMenuOpen(false)}
            >
              PDFs
            </Link>

            {isAuthed && isAdmin && (
              <Link
                href="/admin-dashboard/user-management"
                className="block text-gray-700 hover:text-[#990000]"
                onClick={() => setMenuOpen(false)}
              >
                Admin Dashboard
              </Link>
            )}

            <hr className="border-gray-200" />

            <Link
              href="/user-dashboard/profile"
              className="block text-gray-700 hover:text-[#990000]"
              onClick={() => setMenuOpen(false)}
            >
              My Profile
            </Link>
            <Link
              href="/user-dashboard/settings"
              className="block text-gray-700 hover:text-[#990000]"
              onClick={() => setMenuOpen(false)}
            >
              Settings
            </Link>
            {isAuthed ? (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  signOut({ callbackUrl: "/auth/login" });
                }}
                className="block text-red-600 hover:text-red-700"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="block text-blue-700"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center space-x-3">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt="User Avatar"
              width={40}
              height={40}
              className="rounded-full border border-gray-300 object-cover"
              style={{ width: "40px", height: "40px" }}
            />
          ) : (
            <div
              className="flex items-center justify-center rounded-full border border-gray-300 bg-blue-600 text-white"
              style={{ width: "40px", height: "40px" }}
              aria-label="User Initial"
            >
              <span className="text-base font-semibold">{userInitial}</span>
            </div>
          )}
          <div>
            <p className="text-gray-900 font-bold text-lg">{userName}</p>
            <p className="text-base text-gray-600">{userEmail}</p>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 bg-[#f3edd7] bg-opacity-40 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
