"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const BRAND_COLOR = "#800000"; // Maroon color

export const Header = () => {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Prefetch common routes to make page opens feel instant
  useEffect(() => {
    router.prefetch("/auth/login");
    router.prefetch("/auth/register");
    router.prefetch("/user-dashboard/dashboard");
  }, [router]);

  return (
    <header className="fixed top-0 left-0 w-full py-4 px-6 md:px-8 border-b border-gray-100 bg-[#f3edd7] z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* 🌟 Logo Section */}
        <Link href="/" className="flex items-center space-x-2">
          <span
            className="text-[#2463eb] text-xl font-bold tracking-tight"
          >
            LOZEN
          </span>
        </Link>

        {/* 🧭 Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          {/* Right Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Link href="/auth/register">
              <Button
                variant="outline"
                className="text-gray-700 hover:bg-[#2463eb] hover:text-white h-8 text-sm"
              >
                Register
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button className="bg-[#2463eb] text-white hover:bg-red-700 flex items-center gap-1 h-8 text-sm px-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-log-in"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="m10 17-5-5 5-5" />
                  <path d="M19 12H5" />
                </svg>
                Log In
              </Button>
            </Link>
          </div>
        </div>

        {/* 📱 Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

       {/* Mobile Dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white px-4 py-3 space-y-3 animate-fadeIn">
          <div className="flex items-center space-x-4">
            <Link href="/auth/register">
              <Button
                variant="outline"
                className="text-gray-700 hover:bg-[#2463eb] hover:text-white h-8 text-sm"
              >
                Register
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button className="bg-[#2463eb] text-white hover:bg-red-700 flex items-center gap-1 h-8 text-sm px-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-log-in"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <path d="m10 17-5-5 5-5" />
                  <path d="M19 12H5" />
                </svg>
                Log In
              </Button>
            </Link>
          </div>
          </div>
        )}
    </header>
  );
};

export default Header;
