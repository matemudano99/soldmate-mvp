"use client";

import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "app/lib/store";
import { inventoryApi, incidentsApi } from "app/lib/api";
import { AppShell, KpiTile, PrimaryButton, SectionCard } from "../components/web-ui";

// ─── Paleta ───────────────────────────────────────────────────────────────────

const C = {
  amber:  "#f59e0b",
  red:    "#ef4444",
  green:  "#22c55e",
  blue:   "#3b82f6",
  slate:  "#64748b",
};

const INC_COLOR: Record<string, string> = {
  OPEN: C.red, IN_PROGRESS: C.amber, CLOSED: C.green,
};
const INC_LABEL: Record<string, string> = {
  OPEN: "Abiertas", IN_PROGRESS: "En curso", CLOSED: "Cerradas",
};
const PRIORITY_CLS: Record<string, string> = {
  LOW:      "bg-slate-800 text-slate-400 border-slate-700",
  MEDIUM:   "bg-amber-950/40 text-amber-400 border-amber-800",
  HIGH:     "bg-orange-950/40 text-orange-400 border-orange-800",
  CRITICAL: "bg-red-950/40 text-red-400 border-red-800",
};
const STATUS_CLS: Record<string, string> = {
  OPEN:        "bg-red-950/40 text-red-400 border-red-800",
  IN_PROGRESS: "bg-amber-950/40 text-amber-400 border-amber-800",
  CLOSED:      "bg-slate-800 text-slate-500 border-slate-700",
};

// ─── Pequeños componentes ─────────────────────────────────────────────────────

function KpiCard({ label, value, sub, accent = "amber" }:
  { label: string; value: number | string; sub?: string; accent?: string }) {
  const border: Record<string, string> = {
    amber: "border-amber-500/30", red: "border-red-500/30",
    green: "border-emerald-500/30", blue: "border-blue-500/30",
  };
  const text: Record<string, string> = {
    amber: "text-amber-400", red: "text-red-400",
    green: "text-emerald-400", blue: "text-blue-400",
  };
  return (
    <div className={`bg-slate-900 border ${border[accent] ?? border.amber} rounded-2xl p-5 flex flex-col gap-1`}>
      <span className="text-slate-400 text-xs uppercase tracking-widest">{label}</span>
      <span className={`text-3xl font-bold ${text[accent] ?? text.amber}`}>{value}</span>
      {sub && <span className="text-slate-500 text-xs">{sub}</span>}
    </div>
  );
}

function ChartTip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm shadow-xl">
      <p className="text-white font-semibold mb-1 max-w-[180px] truncate">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.fill ?? p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { token, email, role, logout } = useAuthStore();
  const [search,      setSearch]      = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "low">("all");

  const { data: products  = [], isLoading: lprod } = useQuery({
    queryKey: ["inventory"],
    queryFn:  () => inventoryApi.getAll(token!),
    enabled: !!token,
  });
  const { data: incidents = [], isLoading: linc } = useQuery({
    queryKey: ["incidents"],
    queryFn:  () => incidentsApi.getAll(token!),
    enabled: !!token,
  });

  // KPIs
  const lowStockCount    = useMemo(() => products.filter((p) => p.lowStock).length,   [products]);
  const activeIncidents  = useMemo(() => incidents.filter((i) => i.status !== "CLOSED").length, [incidents]);

  // Datos gráfico de barras: top 10 productos
  const stockChart = useMemo(() =>
    products.slice(0, 10).map((p) => ({
      name:     p.name.length > 13 ? p.name.slice(0, 13) + "…" : p.name,
      actual:   +p.currentStock,
      mínimo:   +p.minStock,
      low:      p.lowStock,
    })),
  [products]);

  // Datos gráfico de anillo: incidencias por estado
  const incPie = useMemo(() => {
    const c: Record<string, number> = { OPEN: 0, IN_PROGRESS: 0, CLOSED: 0 };
    incidents.forEach((i) => { c[i.status] = (c[i.status] ?? 0) + 1; });
    return Object.entries(c).filter(([, v]) => v > 0)
      .map(([s, v]) => ({ name: INC_LABEL[s], value: v, status: s }));
  }, [incidents]);

  // Tabla filtrada
  const tableRows = useMemo(() =>
    products
      .filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        (stockFilter === "all" || p.lowStock)
      )
      .sort((a, b) => (a.lowStock === b.lowStock ? 0 : a.lowStock ? -1 : 1)),
  [products, search, stockFilter]);

  if (!token) {
    return (
      <AppShell>
        <SectionCard title="Sesion no iniciada" subtitle="Necesitas autenticarte para ver el dashboard">
          <Link href="/login" className="text-amber-400 hover:text-amber-300">
            Ir a login
          </Link>
        </SectionCard>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <div>
          <p className="text-sm text-slate-400">Panel operativo</p>
          <h1 className="text-2xl font-bold text-white">Dashboard Soldmate</h1>
          <p className="text-sm text-slate-400">{email} · {role}</p>
        </div>
        <div className="flex gap-2">
          <PrimaryButton onClick={() => window.location.reload()} className="bg-slate-700 hover:bg-slate-600">
            Actualizar
          </PrimaryButton>
          <PrimaryButton onClick={logout} className="bg-red-600 hover:bg-red-500">
            Salir
          </PrimaryButton>
        </div>
      </section>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiTile label="Productos" value={products.length} tone="amber" />
          <KpiTile label="Stock bajo" value={lowStockCount} tone={lowStockCount > 0 ? "red" : "green"} helper={lowStockCount > 0 ? "Necesita reposicion" : "Todo estable"} />
          <KpiTile label="Incidencias activas" value={activeIncidents} tone={activeIncidents > 0 ? "red" : "green"} />
          <KpiTile label="Total incidencias" value={incidents.length} tone="blue" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard title="Stock actual vs minimo" subtitle="Top 10 productos">
              {lprod ? (
                <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Cargando…</div>
              ) : stockChart.length === 0 ? (
                <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Sin productos</div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={210}>
                    <BarChart data={stockChart} barGap={2} barCategoryGap="30%">
                      <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTip />} cursor={{ fill: "#1e293b" }} />
                      <Bar dataKey="actual" name="Stock actual" radius={[4,4,0,0]}>
                        {stockChart.map((e, i) => (
                          <Cell key={i} fill={e.low ? C.red : C.amber} />
                        ))}
                      </Bar>
                      <Bar dataKey="mínimo" name="Stock mínimo" fill={C.slate} radius={[4,4,0,0]} opacity={0.45} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="text-slate-600 text-xs mt-1">🟥 Rojo = bajo mínimo · 🟨 Ámbar = normal</p>
                </>
              )}
            </SectionCard>
          </div>

          <SectionCard title="Estado de incidencias">
            {linc ? (
              <div className="h-52 flex items-center justify-center text-slate-500 text-sm">Cargando…</div>
            ) : incPie.length === 0 ? (
              <div className="h-52 flex flex-col items-center justify-center gap-2 text-slate-500 text-sm">
                <span className="text-3xl">✅</span>Sin incidencias
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={incPie} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                    {incPie.map((e, i) => (
                      <Cell key={i} fill={INC_COLOR[e.status] ?? C.slate} />
                    ))}
                  </Pie>
                  <Legend iconType="circle" iconSize={8}
                    formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 12 }}>{v}</span>} />
                  <Tooltip
                    formatter={(v: number) => [v, "Incidencias"]}
                    contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, color: "white" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>

        <SectionCard title="Inventario completo">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto…"
                className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm placeholder-slate-500 outline-none focus:border-amber-500 transition-colors w-44"
              />
              <div className="flex rounded-xl overflow-hidden border border-slate-700">
                {([["all","Todos"],["low","Stock bajo"]] as const).map(([id, lbl]) => (
                  <button key={id} onClick={() => setStockFilter(id)}
                    className={`px-3 py-2 text-xs font-medium transition-colors ${
                      stockFilter === id ? "bg-amber-500 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {lbl}
                    {id === "low" && lowStockCount > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5">{lowStockCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800">
                  {["Producto","Categoría","Stock actual","Mínimo","Unidad","IVA","Estado"].map((h) => (
                    <th key={h} className="text-left text-slate-400 text-xs uppercase tracking-wide pb-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lprod ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">Cargando…</td></tr>
                ) : tableRows.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-8 text-slate-500">Sin resultados</td></tr>
                ) : tableRows.map((p) => (
                  <tr key={p.id} className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${p.lowStock ? "bg-red-950/10" : ""}`}>
                    <td className="py-3 pr-4 font-medium text-white">
                      <div className="flex items-center gap-2">
                        {p.lowStock && <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />}
                        {p.name}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-400">{p.category ?? "—"}</td>
                    <td className="py-3 pr-4 font-mono">
                      <span className={p.lowStock ? "text-red-400 font-bold" : "text-white"}>{p.currentStock}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 font-mono">{p.minStock}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs uppercase">{p.unit}</td>
                    <td className="py-3 pr-4 text-slate-400">{p.vatRate}%</td>
                    <td className="py-3 pr-4">
                      {p.lowStock
                        ? <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-xs px-2.5 py-1 rounded-full font-medium">Stock bajo ⚠</span>
                        : <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-1 rounded-full font-medium">OK</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {tableRows.length > 0 && (
            <p className="text-slate-600 text-xs mt-3">
              {tableRows.length} de {products.length} productos
            </p>
          )}
        </SectionCard>

        <SectionCard title="Incidencias recientes">
          {linc ? (
            <p className="text-slate-500 text-sm">Cargando…</p>
          ) : incidents.length === 0 ? (
            <p className="text-slate-500 text-sm">Sin incidencias registradas.</p>
          ) : (
            <div className="flex flex-col">
              {incidents.slice(0, 8).map((i) => (
                <div key={i.id} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0 gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{i.title}</p>
                    <p className="text-slate-500 text-xs">
                      {new Date(i.createdAt).toLocaleDateString("es-ES")}
                      {i.reportedBy ? ` · ${i.reportedBy}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${PRIORITY_CLS[i.priority]}`}>
                      {i.priority}
                    </span>
                    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${STATUS_CLS[i.status]}`}>
                      {INC_LABEL[i.status]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
