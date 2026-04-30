"use client";

import React from "react";
import { SectionCard } from "../components/web-ui";
import { WebErpNavbar } from "../components/web-erp-navbar";
import { Mail, Phone, Tag } from "lucide-react";

const SUPPLIERS = [
  { name: "Frutas Martínez S.L.",   category: "Frutas y verduras", phone: "+34 600 111 222", email: "pedidos@frutas.com" },
  { name: "Bebidas Ibérica",         category: "Bebidas",           phone: "+34 600 333 444", email: "info@bibérica.com" },
  { name: "Limpieza Plus",           category: "Limpieza",          phone: "+34 600 555 666", email: "comercial@lplus.com" },
];

export default function SuppliersPage() {
  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <WebErpNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#1e2040] mb-5">Proveedores</h1>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SUPPLIERS.map((s) => (
            <div key={s.name} className="bg-white rounded-2xl p-5 shadow-[0_2px_16px_rgba(149,157,165,0.10)] border border-gray-50">
              <h3 className="font-semibold text-[#1e2040] mb-1">{s.name}</h3>
              <div className="flex items-center gap-1.5 mb-3">
                <Tag size={11} className="text-gray-400" />
                <span className="text-xs text-gray-400">{s.category}</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <Phone size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">{s.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={12} className="text-gray-400" />
                  <span className="text-xs text-gray-600">{s.email}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
