"use client";

import { Facebook, Instagram } from "lucide-react";
import { FaWhatsapp, FaTelegramPlane, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#251d1d] text-[#f3edd7] py-10 px-5">
      {/* === Top Links Section === */}
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm text-[#f3edd7]/90">
        {/* Product */}
        <div>
          <h3 className="font-semibold text-[#f3edd7] mb-3 uppercase">Product</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Features</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Services</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Enterprise</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Pricing</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-semibold text-[#f3edd7] mb-3 uppercase">Company</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Headless</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Commerce</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">B2B Wholesale</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Multi-Channel</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Career</Link></li>
          </ul>
        </div>

        {/* Help Center */}
        <div>
          <h3 className="font-semibold text-[#f3edd7] mb-3 uppercase">Help Center</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Community</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Knowledge Base</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Videos</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Contact</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Tech Support</Link></li>
          </ul>
        </div>

        {/* Partners */}
        <div>
          <h3 className="font-semibold text-[#f3edd7] mb-3 uppercase">Partners</h3>
          <ul className="space-y-2">
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Overview</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Become a Partner</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Find a Partner</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Affiliates</Link></li>
            <li><Link href="#" className="hover:text-[#d9b26f] transition-colors">Revenue</Link></li>
          </ul>
        </div>
      </div>

      {/* === Social Icons Section === */}
      <div className="flex justify-center gap-6 mt-10">
        <Link href="#" className="hover:text-[#d9b26f] transition-colors duration-200">
          <Facebook size={18} />
        </Link>
        <Link
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#d9b26f] transition-colors duration-200"
        >
          <FaXTwitter size={18} />
        </Link>
        <Link
          href="https://wa.me/2348012345678"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#25d366] transition-colors duration-200"
        >
          <FaWhatsapp size={18} />
        </Link>
        <Link
          href="https://t.me/yourTelegramUsername"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#0088cc] transition-colors duration-200"
        >
          <FaTelegramPlane size={18} />
        </Link>
        <Link
          href="https://discord.gg/yourDiscordInvite"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[#7289da] transition-colors duration-200"
        >
          <FaDiscord size={18} />
        </Link>
        <Link href="#" className="hover:text-[#d62976] transition-colors duration-200">
          <Instagram size={18} />
        </Link>
      </div>

      {/* === Copyright Section === */}
      <div className="text-center text-xs mt-8 text-[#f3edd7]/70">
        ©2025 All rights reserved | Built by{" "}
        <Link
          href="http://gold-lee.onrender.com"
          className="text-[#d9b26f] hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Gold Lee
        </Link>
      </div>
    </footer>
  );
}
