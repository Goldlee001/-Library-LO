"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Files } from "lucide-react"
import { LayoutGrid, Wallet, Settings, User, Upload } from "lucide-react";

export default function UserNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "ALL USER", href: "/admin-dashboard/user-management", icon: User },
    { name: "SETTINGS", href: "/admin-dashboard/settings", icon: Settings, },
    { name: "ALL CONTENT", href: "/admin-dashboard/all-content", icon: Files, },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center bg-[#f3edd7] py-3 rounded-t-3xl shadow-[0_-4px_20px_-2px_rgba(0,0,0,0.4)] lg:hidden">
      {navItems.map(({ name, href, icon: Icon }) => (
        <Link
          key={name}
          href={href}
          className={`flex flex-col items-center text-xs font-semibold transition-colors ${
            isActive(href)
              ? "text-blue-600"
              : "text-gray-400 hover:text-blue-300"
          }`}
        >
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-2xl mb-1 transition-all duration-300 ${
              isActive(href)
                ? "bg-gradient-to-tr from-blue-600 to-blue-500 shadow-md shadow-black/40 text-white"
                : "bg-gray-800"
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          {name.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
