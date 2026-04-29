"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authApi } from "app/lib/api";
import { useAuthStore } from "app/lib/store";
import { AppShell, InputField, PrimaryButton, SectionCard } from "../components/web-ui";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await authApi.login(email.trim().toLowerCase(), password);
      login(data);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <SectionCard title="Iniciar sesion" subtitle="Accede al panel operativo de tu negocio">
          <form onSubmit={onSubmit} className="space-y-4">
            <InputField
              label="Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner.demo@soldmate.local"
            />
            <InputField
              label="Contrasena"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />

            {error && (
              <div className="rounded-xl border border-red-700 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {error}
              </div>
            )}

            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? "Entrando..." : "Iniciar sesion"}
            </PrimaryButton>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            No tienes cuenta?{" "}
            <Link href="/register" className="font-semibold text-amber-400 hover:text-amber-300">
              Crea tu negocio
            </Link>
          </p>
        </SectionCard>
      </div>
    </AppShell>
  );
}
