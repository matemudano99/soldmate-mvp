"use client";

import React from "react";
import { SectionCard } from "../../components/web-ui";
import { WebErpNavbar } from "../../components/web-erp-navbar";

export default function NewIncidentPage() {
  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <WebErpNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#1e2040] mb-5">Nueva Incidencia</h1>
        <div className="max-w-lg">
          <SectionCard title="Reportar avería" subtitle="Mock · sin API">
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Título</label>
                <input
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7] transition-colors"
                  placeholder="Ej: Nevera no enfría"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Descripción</label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7] min-h-28 resize-none transition-colors"
                  placeholder="Describe la avería en detalle..."
                />
              </div>
              <button className="self-start rounded-xl bg-[#4f6ef7] text-white text-sm font-semibold px-5 py-2.5 shadow-[0_4px_12px_rgba(79,110,247,0.30)] hover:bg-[#3d5ae0] transition-colors">
                Guardar
              </button>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
