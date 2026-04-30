"use client";

import React from "react";
import { SectionCard } from "../components/web-ui";
import { WebErpNavbar } from "../components/web-erp-navbar";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

const ALERTS = [
  { text: "Stock crítico en bebidas",     type: "critical", icon: AlertTriangle },
  { text: "Incidencia abierta > 24h",     type: "warning",  icon: Clock },
  { text: "3 tareas vencen hoy",          type: "warning",  icon: Clock },
  { text: "Proveedor confirmado",         type: "success",  icon: CheckCircle },
];

export default function AlertsPage() {
  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <WebErpNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#1e2040] mb-5">Alertas</h1>
        <div className="max-w-xl">
          <SectionCard title="Alertas recientes" subtitle="Mock data · frontend-first">
            <div className="flex flex-col gap-2">
              {ALERTS.map((a) => {
                const Icon = a.icon;
                const styles =
                  a.type === "critical" ? "bg-red-50 border-red-100 text-red-600" :
                  a.type === "warning"  ? "bg-amber-50 border-amber-100 text-amber-600" :
                                          "bg-green-50 border-green-100 text-green-600";
                return (
                  <div key={a.text} className={`flex items-center gap-3 rounded-xl border p-3.5 ${styles}`}>
                    <Icon size={15} className="flex-shrink-0" />
                    <span className="text-sm font-medium">{a.text}</span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
