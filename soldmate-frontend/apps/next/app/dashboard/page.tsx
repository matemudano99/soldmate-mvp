"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  DollarSign, Wrench, Package, Users, TrendingUp,
  AlertTriangle, Bell, Search, ChevronRight, Circle,
  CheckCircle2, Clock, Sparkles,
} from "lucide-react";
import { WebErpNavbar } from "../components/web-erp-navbar";
import Link from "next/link";
import { useAuthStore } from "app/lib/store";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const WEEKLY = [
  { day: "Lun", ventas: 1840 },
  { day: "Mar", ventas: 2230 },
  { day: "Mié", ventas: 1980 },
  { day: "Jue", ventas: 2610 },
  { day: "Vie", ventas: 2450 },
  { day: "Sáb", ventas: 3100 },
  { day: "Dom", ventas: 2780 },
];

const KPIS = [
  { label: "Ventas hoy",        value: "€ 3.100", sub: "+12% vs ayer",  Icon: DollarSign, color: "text-[#4f6ef7]", bg: "bg-blue-50   border-blue-100"   },
  { label: "Incidencias",       value: "3",        sub: "2 abiertas",    Icon: Wrench,     color: "text-red-500",   bg: "bg-red-50    border-red-100"     },
  { label: "Stock bajo",        value: "5 items",  sub: "Requieren reposición", Icon: Package, color: "text-amber-500", bg: "bg-amber-50 border-amber-100"  },
  { label: "Equipo activo",     value: "6 / 9",    sub: "67% disponible", Icon: Users,     color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
];

const RECENT_INCIDENTS = [
  { id: 1, title: "Fuga de agua en barra",  priority: "HIGH",     status: "OPEN",        time: "Hace 1h"  },
  { id: 2, title: "Nevera 2 no enfría",     priority: "CRITICAL", status: "IN_PROGRESS", time: "Hace 3h"  },
  { id: 3, title: "Campana con ruido",      priority: "MEDIUM",   status: "CLOSED",      time: "Hace 5h"  },
];

const STOCK_ALERTS = [
  { product: "Aceite de oliva",   current: 2,  min: 5,  unit: "L"   },
  { product: "Harina de trigo",   current: 3,  min: 10, unit: "kg"  },
  { product: "Detergente",        current: 1,  min: 4,  unit: "bot" },
  { product: "Servilletas",       current: 50, min: 200, unit: "ud" },
  { product: "Vino tinto casa",   current: 4,  min: 12, unit: "bot" },
];

const ACTIVITY = [
  { user: "Alice M.",   action: "actualizó stock de Aceite de oliva",   time: "09:12", avatar: "https://i.pravatar.cc/24?img=47" },
  { user: "Carlos R.",  action: "cerró incidencia #12 – Campana",       time: "08:55", avatar: "https://i.pravatar.cc/24?img=33" },
  { user: "Henry P.",   action: "añadió proveedor Bebidas Ibérica",      time: "08:30", avatar: "https://i.pravatar.cc/24?img=68" },
  { user: "Sofia M.",   action: "subió informe semanal KPIs",            time: "07:50", avatar: "https://i.pravatar.cc/24?img=44" },
  { user: "Evan J.",    action: "abrió incidencia #14 – Fuga de agua",   time: "07:20", avatar: "https://i.pravatar.cc/24?img=12" },
];

const QUICK_ACTIONS = [
  { label: "Reportar avería",   href: "/incidents", color: "bg-red-50 text-red-500 hover:bg-red-100",       Icon: Wrench       },
  { label: "Ver inventario",    href: "/suppliers",  color: "bg-blue-50 text-[#4f6ef7] hover:bg-blue-100", Icon: Package      },
  { label: "Añadir persona",    href: "/people",     color: "bg-violet-50 text-violet-500 hover:bg-violet-100", Icon: Users   },
  { label: "Ver estadísticas",  href: "/stats",      color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100", Icon: TrendingUp },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_CFG = {
  OPEN:        { label: "Abierta",  Icon: Circle,       color: "text-red-500",   bg: "bg-red-50"    },
  IN_PROGRESS: { label: "En curso", Icon: Clock,        color: "text-amber-500", bg: "bg-amber-50"  },
  CLOSED:      { label: "Cerrada",  Icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50"  },
};

const PRIORITY_CFG = {
  CRITICAL: "text-red-500",
  HIGH:     "text-orange-500",
  MEDIUM:   "text-amber-500",
  LOW:      "text-blue-400",
};

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-lg text-xs">
      <p className="font-semibold text-[#1e2040] mb-0.5">{label}</p>
      <p className="text-[#4f6ef7] font-bold">€{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const firstName = useAuthStore((s) => s.firstName);
  const lastName = useAuthStore((s) => s.lastName);
  const email = useAuthStore((s) => s.email);
  const today = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
  const todayCap = today.charAt(0).toUpperCase() + today.slice(1);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  const displayName = firstName || fullName || email?.split("@")[0] || "Usuario";
  const initials = ((firstName?.[0] ?? "") + (lastName?.[0] ?? "")).toUpperCase() || "U";

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef1f8] text-[#1e2040]">
      <WebErpNavbar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 px-7 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">{todayCap}</p>
            <h1 className="text-xl font-bold text-[#1e2040]">Bienvenido, {displayName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative max-w-52 w-full hidden md:block">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="w-full bg-white border border-gray-100 rounded-xl pl-9 pr-4 py-2 text-sm placeholder:text-gray-400 shadow-sm outline-none focus:border-[#4f6ef7] transition-colors"
                placeholder="Buscar..."
              />
            </div>
            <button className="relative p-2.5 rounded-xl bg-white border border-gray-100 shadow-sm hover:bg-gray-50">
              <Bell size={16} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="relative">
              <div className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm bg-[#4f6ef7] text-white text-[11px] font-semibold flex items-center justify-center">
                {initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-7 pb-6 space-y-5">
          {/* KPI tiles */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {KPIS.map((k) => (
              <div key={k.label} className={`bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(149,157,165,0.10)] border ${k.bg}`}>
                <div className="flex items-start justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight max-w-[75%]">{k.label}</p>
                  <k.Icon size={16} className={k.color} />
                </div>
                <p className="text-2xl font-bold text-[#1e2040]">{k.value}</p>
                <p className="text-xs text-gray-400 mt-1">{k.sub}</p>
              </div>
            ))}
          </div>

          {/* Charts + quick actions row */}
          <div className="grid lg:grid-cols-[1.6fr_1fr] gap-4">
            {/* Weekly sales chart */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(149,157,165,0.10)] border border-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-[#1e2040]">Ventas esta semana</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Total: €17.990</p>
                </div>
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp size={11} /> +8%
                </span>
              </div>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={WEEKLY} barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f7" vertical={false} />
                  <XAxis dataKey="day" tick={{ fill: "#9095a0", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ventas" fill="#4f6ef7" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick actions */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(149,157,165,0.10)] border border-gray-50">
              <h2 className="text-base font-semibold text-[#1e2040] mb-4">Acciones rápidas</h2>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className={`flex flex-col items-start gap-2.5 rounded-xl p-4 transition-all ${a.color} group`}
                  >
                    <a.Icon size={20} />
                    <span className="text-xs font-semibold leading-tight">{a.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom row */}
          <div className="grid lg:grid-cols-[1.2fr_1fr_1fr] gap-4">
            {/* Recent incidents */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(149,157,165,0.10)] border border-gray-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="text-base font-semibold text-[#1e2040]">Incidencias recientes</h2>
                <Link href="/incidents" className="text-xs text-[#4f6ef7] font-medium hover:underline flex items-center gap-1">
                  Ver todas <ChevronRight size={12} />
                </Link>
              </div>
              <div className="divide-y divide-gray-50">
                {RECENT_INCIDENTS.map((inc) => {
                  const s = STATUS_CFG[inc.status as keyof typeof STATUS_CFG];
                  return (
                    <div key={inc.id} className="px-5 py-3.5 hover:bg-[#fafbff] transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-[#1e2040] truncate flex-1 mr-2">{inc.title}</p>
                        <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${s.bg} ${s.color} whitespace-nowrap`}>
                          <s.Icon size={9} />
                          {s.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold ${PRIORITY_CFG[inc.priority as keyof typeof PRIORITY_CFG]}`}>
                          {inc.priority}
                        </span>
                        <span className="text-[10px] text-gray-300">·</span>
                        <span className="text-[10px] text-gray-400">{inc.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stock alerts */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(149,157,165,0.10)] border border-gray-50 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <h2 className="text-base font-semibold text-[#1e2040]">Stock bajo</h2>
                <span className="text-[10px] font-semibold bg-red-50 text-red-500 px-2 py-0.5 rounded-full">
                  {STOCK_ALERTS.length} items
                </span>
              </div>
              <div className="divide-y divide-gray-50">
                {STOCK_ALERTS.map((s) => {
                  const pct = Math.round((s.current / s.min) * 100);
                  return (
                    <div key={s.product} className="px-5 py-3 hover:bg-[#fafbff] transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#1e2040] truncate">{s.product}</span>
                        <span className="text-xs text-red-500 font-semibold ml-2 flex-shrink-0">
                          {s.current}/{s.min} {s.unit}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-red-400"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Activity feed */}
            <div className="bg-white rounded-2xl shadow-[0_2px_16px_rgba(149,157,165,0.10)] border border-gray-50 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50">
                <h2 className="text-base font-semibold text-[#1e2040]">Actividad reciente</h2>
              </div>
              <div className="divide-y divide-gray-50">
                {ACTIVITY.map((a, i) => (
                  <div key={i} className="px-5 py-3 flex items-start gap-3 hover:bg-[#fafbff] transition-colors">
                    <img src={a.avatar} alt={a.user} className="w-7 h-7 rounded-full flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-[#1e2040] leading-tight">
                        <span className="font-semibold">{a.user}</span>{" "}
                        <span className="text-gray-500">{a.action}</span>
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
