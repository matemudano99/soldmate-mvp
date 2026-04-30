"use client";

import React from "react";
import { SectionCard } from "../components/web-ui";
import { WebErpNavbar } from "../components/web-erp-navbar";

export default function CompanySettingsPage() {
  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <WebErpNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#1e2040] mb-5">Ajustes</h1>
        <div className="max-w-xl">
          <SectionCard title="Configuración general" subtitle="Mock · frontend-first">
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "IVA por defecto",    value: "10%" },
                { label: "Moneda",             value: "EUR" },
                { label: "Zona horaria",       value: "Europe/Madrid" },
                { label: "Idioma",             value: "Español" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-gray-100 bg-[#f8f9fc] p-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">{s.label}</p>
                  <p className="text-[#1e2040] font-semibold text-lg">{s.value}</p>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
