"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "app/lib/api";
import { useAuthStore } from "app/lib/store";
import { AppShell, InputField, PrimaryButton, SectionCard } from "../components/web-ui";

export default function RegisterPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [form, setForm] = useState({
    companyName: "",
    taxId: "",
    country: "ES",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setLoading(true);
    try {
      const data = await authApi.register({
        companyName: form.companyName.trim(),
        taxId: form.taxId.trim(),
        country: form.country.toUpperCase().trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      login(data);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Error al crear la cuenta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl">
        <SectionCard title="Alta de negocio" subtitle="Crea una cuenta OWNER en menos de un minuto">
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <InputField
                label="Nombre del negocio"
                required
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
              />
            </div>
            <InputField label="NIF / CIF" required value={form.taxId} onChange={(e) => update("taxId", e.target.value)} />
            <InputField
              label="Pais (2 letras)"
              required
              maxLength={2}
              value={form.country}
              onChange={(e) => update("country", e.target.value.toUpperCase())}
            />
            <InputField label="Nombre" required value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
            <InputField label="Apellidos" value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
            <div className="md:col-span-2">
              <InputField
                label="Email"
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </div>
            <InputField
              label="Contrasena"
              type="password"
              required
              minLength={8}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
            <InputField
              label="Repetir contrasena"
              type="password"
              required
              minLength={8}
              value={form.confirmPassword}
              onChange={(e) => update("confirmPassword", e.target.value)}
            />

            {error && (
              <div className="md:col-span-2 rounded-xl border border-red-700 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="md:col-span-2">
              <PrimaryButton type="submit" disabled={loading} className="w-full">
                {loading ? "Creando cuenta..." : "Crear cuenta"}
              </PrimaryButton>
            </div>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            Ya tienes cuenta?{" "}
            <Link href="/login" className="font-semibold text-amber-400 hover:text-amber-300">
              Inicia sesion
            </Link>
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
