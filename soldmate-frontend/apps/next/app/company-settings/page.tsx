"use client";

import React, { useEffect, useState } from "react";
import { SectionCard } from "../components/web-ui";
import { WebErpNavbar } from "../components/web-erp-navbar";
import { authApi } from "app/lib/api";
import { useAuthStore } from "app/lib/store";

export default function CompanySettingsPage() {
  const token = useAuthStore((s) => s.token);
  const email = useAuthStore((s) => s.email);
  const role = useAuthStore((s) => s.role);
  const firstNameFromStore = useAuthStore((s) => s.firstName);
  const lastNameFromStore = useAuthStore((s) => s.lastName);
  const setProfile = useAuthStore((s) => s.setProfile);

  const [firstName, setFirstName] = useState(firstNameFromStore ?? "");
  const [lastName, setLastName] = useState(lastNameFromStore ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(firstNameFromStore ?? "");
    setLastName(lastNameFromStore ?? "");
  }, [firstNameFromStore, lastNameFromStore]);

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setSaved(false);
    setError(null);
    try {
      const updated = await authApi.updateProfile(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      setProfile({ firstName: updated.firstName, lastName: updated.lastName });
      setSaved(true);
    } catch (err: any) {
      setError(err.message ?? "No se pudo guardar el perfil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#eef1f8]">
      <WebErpNavbar />
      <main className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-2xl font-bold text-[#1e2040] mb-5">Ajustes</h1>
        <div className="max-w-xl">
          <SectionCard title="Mi perfil" subtitle="Datos del usuario autenticado">
            <form onSubmit={onSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre</label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Apellido</label>
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7]"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-gray-100 bg-[#f8f9fc] p-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Email</p>
                  <p className="text-[#1e2040] font-semibold text-sm break-all">{email ?? "-"}</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-[#f8f9fc] p-4">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-1">Rol</p>
                  <p className="text-[#1e2040] font-semibold text-sm">{role === "OWNER" ? "Owner" : "Staff"}</p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              )}
              {saved && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                  Perfil actualizado correctamente
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-[#4f6ef7] text-white px-4 py-2.5 text-sm font-semibold shadow-[0_4px_12px_rgba(79,110,247,0.30)] hover:bg-[#3d5ae0] disabled:opacity-60"
              >
                {loading ? "Guardando..." : "Guardar perfil"}
              </button>
            </form>
          </SectionCard>

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
