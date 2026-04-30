"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import { SectionCard } from "../components/web-ui";
import { WebErpNavbar } from "../components/web-erp-navbar";
import { CreateIncidentModal } from "../components/create-modals";

export default function IncidentsPage() {
  const [records, setRecords] = useState([
    { title: "Fuga de agua en barra", priority: "HIGH", status: "OPEN" },
    { title: "Nevera 2 no enfría", priority: "CRITICAL", status: "IN PROGRESS" },
    { title: "Campana con ruido", priority: "MEDIUM", status: "CLOSED" },
  ]);
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <WebErpNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-2xl font-bold text-[#1e2040]">Incidencias</h1>
          <Link
            href="/incidents/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#4f6ef7] text-white px-4 py-2.5 text-sm font-semibold shadow-[0_4px_12px_rgba(79,110,247,0.30)] hover:bg-[#3d5ae0] transition-colors"
          >
            + Nueva incidencia
          </Link>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#4f6ef7] text-[#4f6ef7] px-4 py-2.5 text-sm font-semibold hover:bg-[#f0f3ff] transition-colors"
          >
            Modal rápido
          </button>
        </div>
        <SectionCard title="Incidencias activas" subtitle="Mock data · frontend-first">
          <div className="divide-y divide-gray-100">
            {records.map((r) => (
              <div key={r.title} className="py-3.5 flex items-center justify-between">
                <span className="text-sm font-medium text-[#1e2040]">{r.title}</span>
                <div className="flex gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    r.priority === "CRITICAL" ? "bg-red-50 text-red-500" :
                    r.priority === "HIGH"     ? "bg-orange-50 text-orange-500" :
                                                "bg-blue-50 text-blue-500"
                  }`}>{r.priority}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    r.status === "CLOSED"      ? "bg-green-50 text-green-600" :
                    r.status === "IN PROGRESS" ? "bg-violet-50 text-violet-500" :
                                                 "bg-gray-100 text-gray-500"
                  }`}>{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
        {showCreate && (
          <CreateIncidentModal
            onClose={() => setShowCreate(false)}
            onCreate={(payload) =>
              setRecords((prev) => [
                { title: payload.title, priority: payload.priority, status: "OPEN" },
                ...prev,
              ])
            }
          />
        )}
      </main>
    </div>
  );
}
