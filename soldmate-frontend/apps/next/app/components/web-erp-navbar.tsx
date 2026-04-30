"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, CreditCard, BarChart2,
  FileText, Calendar, HelpCircle, Power, ChevronDown,
  Sparkles, Bell,
} from "lucide-react";

const NAV_MAIN = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/incidents", label: "People",    Icon: Users },
  { href: "/finances",  label: "Finances",  Icon: CreditCard },
  { href: "/stats",     label: "Statistics",Icon: BarChart2 },
  { href: "/documents", label: "Documents", Icon: FileText },
  { href: "/calendar",  label: "Calendar",  Icon: Calendar },
] as const;

export function WebErpNavbar() {
  const pathname = usePathname() ?? "/";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white h-screen flex flex-col border-r border-gray-100 shadow-[2px_0_20px_rgba(149,157,165,0.06)]">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 flex items-center gap-2">
        <div className="w-9 h-9 bg-[#4f6ef7] rounded-xl flex items-center justify-center shadow-[0_4px_12px_rgba(79,110,247,0.35)]">
          <Sparkles size={17} color="white" />
        </div>
        <ChevronDown size={13} className="text-gray-300 ml-0.5" />
      </div>

      {/* Request for */}
      <div className="px-4 mb-6">
        <button className="w-full bg-[#4f6ef7] text-white text-sm font-semibold rounded-xl py-2.5 shadow-[0_4px_12px_rgba(79,110,247,0.30)] hover:bg-[#3d5ae0] transition-colors">
          Request for
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_MAIN.map(({ href, label, Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
                active
                  ? "bg-[#f0f3ff] text-[#4f6ef7]"
                  : "text-[#9095a0] hover:bg-gray-50 hover:text-gray-600"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#4f6ef7] rounded-r-full" />
              )}
              <Icon size={16} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-6 space-y-0.5">
        <Link
          href="/alerts"
          className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
            pathname === "/alerts"
              ? "bg-[#f0f3ff] text-[#4f6ef7]"
              : "text-[#9095a0] hover:bg-gray-50 hover:text-gray-600"
          }`}
        >
          <HelpCircle size={16} strokeWidth={1.8} />
          <span className="text-sm font-medium">Support</span>
        </Link>

        <div className="pt-3 px-3">
          <button className="w-9 h-9 rounded-full border-2 border-gray-200 flex items-center justify-center text-gray-400 hover:border-red-200 hover:text-red-400 transition-colors">
            <Power size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
