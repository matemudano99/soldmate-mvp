"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { WebErpNavbar } from "../../components/web-erp-navbar";
import { CreateIncidentModal } from "../../components/create-modals";

export default function NewIncidentPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <WebErpNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#1e2040] mb-5">Nueva Incidencia</h1>
        <p className="text-sm text-gray-500">Usa el modal reutilizable para crear incidencias.</p>
      </main>
      <CreateIncidentModal onClose={() => router.push("/incidents")} onCreate={() => router.push("/incidents")} />
    </div>
  );
}
