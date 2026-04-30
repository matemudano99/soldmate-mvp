"use client";

import React, { useState } from "react";
import {
  Search, Bell, ChevronDown, Grid3X3, List,
  SlidersHorizontal, ChevronLeft, ChevronRight,
  Settings, MessageSquare, MoreVertical, User,
} from "lucide-react";
import { WebErpNavbar } from "../components/web-erp-navbar";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const EMPLOYEES = [
  {
    id: 1, name: "Henry Paulista",  email: "henry.p@mail.com",
    role: "SENIOR CREATIVE DIRECTOR", progress: 100, online: true,
    avatar: "https://i.pravatar.cc/100?img=68",
  },
  {
    id: 2, name: "Evan Jefferson",  email: "jefferson@gmail.com",
    role: "CREATIVE DIRECTOR",        progress: 82,  online: true,
    avatar: "https://i.pravatar.cc/100?img=12",
  },
  {
    id: 3, name: "Mark Thomson",    email: "mark.f@gmail.com",
    role: "SENIOR UI DESIGNER",       progress: 66,  online: false,
    avatar: "https://i.pravatar.cc/100?img=53",
  },
  {
    id: 4, name: "Alice McKenzie",  email: "alice.m@gmail.com",
    role: "SENIOR COPYWRITER",        progress: 100, online: true,
    avatar: "https://i.pravatar.cc/100?img=47",
  },
  {
    id: 5, name: "Jack Ro",         email: "",
    role: "ART DIRECTOR",             progress: 53,  online: false,
    avatar: null,
  },
  {
    id: 6, name: "Anastasia Groetze", email: "anastasia.g@gmail.com",
    role: "SENIOR UX DESIGNER",       progress: 48,  online: true,
    avatar: "https://i.pravatar.cc/100?img=49",
  },
];

const PROJECT_STATS = [
  { label: "TOTAL",       value: 148, color: "#4f6ef7" },
  { label: "COMPLETED",   value: 56,  color: "#34d399" },
  { label: "IN PROGRESS", value: 76,  color: "#60a5fa" },
  { label: "WAITING",     value: 16,  color: "#fbbf24" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function CircleProgress({ percent }: { percent: number }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg viewBox="0 0 100 100" className="w-[108px] h-[108px]">
      <circle cx="50" cy="50" r={r} fill="none" stroke="#eef1f8" strokeWidth="9" />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke="#4f6ef7" strokeWidth="9"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
      />
      <text
        x="50" y="47" textAnchor="middle"
        fill="#1e2040" fontSize="16" fontWeight="700"
      >
        {percent}%
      </text>
      <text x="50" y="60" textAnchor="middle" fill="#9095a0" fontSize="7" fontWeight="500">
        TIME LOG
      </text>
    </svg>
  );
}

function ProgressDots({ percent }: { percent: number }) {
  const total = 5;
  const filled = Math.round((percent / 100) * total);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-5 rounded-full transition-colors ${
            i < filled ? "bg-[#4f6ef7]" : "bg-gray-100"
          }`}
        />
      ))}
    </div>
  );
}

function EmployeeCard({ emp }: { emp: typeof EMPLOYEES[0] }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(149,157,165,0.10)] hover:shadow-[0_4px_24px_rgba(149,157,165,0.18)] transition-shadow border border-gray-50 cursor-pointer">
      <div className="flex justify-between items-start mb-4">
        <div className="relative">
          {emp.avatar ? (
            <img
              src={emp.avatar}
              alt={emp.name}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-white shadow-sm"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center shadow-sm">
              <User className="text-blue-200" size={30} />
            </div>
          )}
          <span
            className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm ${
              emp.online ? "bg-green-400" : "bg-gray-300"
            }`}
          />
        </div>
        <button className="text-gray-300 hover:text-gray-500 p-1 rounded-lg hover:bg-gray-50 transition-colors">
          <MoreVertical size={14} />
        </button>
      </div>

      <h3 className="font-semibold text-[#1e2040] text-sm leading-tight mb-0.5">{emp.name}</h3>
      {emp.email
        ? <p className="text-gray-400 text-xs mb-3">{emp.email}</p>
        : <div className="mb-3 h-4" />
      }

      <div className="flex items-center justify-between mb-1">
        <ProgressDots percent={emp.progress} />
        <span className="text-xs text-gray-500 font-semibold ml-2">{emp.progress}%</span>
      </div>

      <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-3.5 pt-3 border-t border-gray-50">
        {emp.role}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"all" | "org">("all");
  const [viewMode,  setViewMode]  = useState<"grid" | "list">("grid");

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef1f8] text-[#1e2040]">
      {/* Left Sidebar */}
      <WebErpNavbar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="flex-shrink-0 bg-transparent px-7 py-4 flex items-center justify-between gap-4">
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              className="w-full bg-white border border-gray-100 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-600 placeholder:text-gray-400 shadow-sm outline-none focus:border-blue-200 transition-colors"
              placeholder="Search..."
            />
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-sm text-gray-400 hidden md:block">
              {new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })}
            </span>
            <button className="relative p-2 rounded-xl hover:bg-white hover:shadow-sm transition-all">
              <Bell size={17} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <img
                  src="https://i.pravatar.cc/32?img=3"
                  alt="profile"
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <span className="text-sm font-semibold text-[#1e2040]">Charles Merl</span>
              <ChevronDown size={13} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
            </div>
          </div>
        </header>

        {/* People Content */}
        <main className="flex-1 overflow-y-auto px-7 pb-6">
          {/* Title + Tabs */}
          <div className="mb-5">
            <h1 className="text-3xl font-bold text-[#1e2040] mb-3">People</h1>
            <div className="flex gap-6">
              {(["all", "org"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm font-semibold pb-1.5 border-b-2 transition-colors ${
                    activeTab === tab
                      ? "text-[#4f6ef7] border-[#4f6ef7]"
                      : "text-gray-400 border-transparent hover:text-gray-600"
                  }`}
                >
                  {tab === "all" ? "All" : "Organization"}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5 mb-5">
            {/* Search by name */}
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="bg-white border border-gray-100 rounded-xl pl-8 pr-4 py-2 text-xs text-gray-600 placeholder:text-gray-400 shadow-sm outline-none w-36 focus:border-blue-200"
                placeholder="Search by name"
              />
            </div>

            {/* Filter Chips */}
            {["Design Team", "Position", "More"].map((f) => (
              <button
                key={f}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border shadow-sm transition-all hover:shadow-md ${
                  f === "Design Team"
                    ? "bg-white border-[#4f6ef7]/40 text-[#4f6ef7] shadow-[0_2px_8px_rgba(79,110,247,0.12)]"
                    : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"
                }`}
              >
                {f}
                {f === "More"
                  ? <SlidersHorizontal size={11} />
                  : <ChevronDown size={11} />}
              </button>
            ))}

            <div className="flex-1" />

            {/* Sort */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 hidden sm:block">Sort by:</span>
              <button className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white border border-gray-100 rounded-lg px-2.5 py-1.5 shadow-sm hover:border-gray-200">
                All <ChevronDown size={11} />
              </button>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 bg-white border border-gray-100 rounded-xl p-1 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "grid" ? "bg-[#4f6ef7] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <Grid3X3 size={13} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === "list" ? "bg-[#4f6ef7] text-white shadow-sm" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <List size={13} />
              </button>
            </div>
          </div>

          {/* Employee Grid */}
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
            {EMPLOYEES.map((emp) => (
              <EmployeeCard key={emp.id} emp={emp} />
            ))}
          </div>
        </main>
      </div>

      {/* Right Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-white border-l border-gray-100 shadow-[-2px_0_20px_rgba(149,157,165,0.05)] flex flex-col p-5 overflow-y-auto">
        {/* Selected Team */}
        <div className="mb-6">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">SELECTED</p>
          <h2 className="text-xl font-bold text-[#1e2040]">Design Team</h2>
        </div>

        {/* Time Log */}
        <div className="bg-[#f8f9fc] rounded-2xl p-4 mb-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">TIME LOG</span>
            <button className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-white transition-colors">
              <Settings size={13} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-white hover:shadow-sm transition-all">
              <ChevronLeft size={14} />
            </button>
            <CircleProgress percent={74} />
            <button className="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:bg-white hover:shadow-sm transition-all">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-6">
          <h3 className="text-base font-bold text-[#1e2040] mb-3">Projects</h3>
          <div className="grid grid-cols-2 gap-3">
            {PROJECT_STATS.map((stat) => (
              <div key={stat.label} className="bg-[#f8f9fc] rounded-xl p-3 hover:bg-gray-50 transition-colors">
                <p className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest mb-2">{stat.label}</p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-[3px] h-7 rounded-full flex-shrink-0"
                    style={{ backgroundColor: stat.color }}
                  />
                  <span className="text-2xl font-bold text-[#1e2040]">{stat.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Internal Messages */}
        <div className="mt-auto">
          <button className="w-full flex items-center gap-3 bg-[#4f6ef7] rounded-xl p-3.5 text-white hover:bg-[#3d5ae0] transition-colors shadow-[0_4px_15px_rgba(79,110,247,0.25)]">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare size={14} />
            </div>
            <div className="text-left min-w-0">
              <p className="text-[9px] text-blue-200 font-semibold uppercase tracking-wider">DECLARATION CENTER</p>
              <p className="text-sm font-semibold truncate">Internal messages</p>
            </div>
            <ChevronDown size={13} className="ml-auto opacity-60 flex-shrink-0" />
          </button>
        </div>
      </aside>
    </div>
  );
}
