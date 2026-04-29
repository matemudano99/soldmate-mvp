"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "app/lib/store";
import { AppShell, PrimaryButton, SectionCard } from "./components/web-ui";

export default function IndexPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <AppShell>
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <section>
          <p className="inline-flex rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-300">
            Demo lista para hosteleria
          </p>
          <h1 className="mt-4 text-4xl font-extrabold text-white md:text-5xl">
            Soldmate ERP
          </h1>
          <p className="mt-3 max-w-xl text-slate-300">
            Controla inventario, incidencias y proveedores con datos demo persistentes para
            mostrar el producto desde el primer minuto.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <PrimaryButton onClick={() => router.push("/login")}>Entrar a la demo</PrimaryButton>
            <Link href="/register" className="rounded-xl border border-slate-700 px-4 py-2.5 font-semibold text-slate-200 hover:border-slate-500">
              Crear negocio
            </Link>
          </div>
        </section>
        <SectionCard title="Cuenta demo recomendada" subtitle="Seed persistente en backend">
          <p className="text-sm text-slate-300">
            Usa estas credenciales para probar el dashboard inmediatamente:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-200">
            <li><span className="text-slate-400">Email:</span> owner.demo@soldmate.local</li>
            <li><span className="text-slate-400">Password:</span> Demo12345!</li>
          </ul>
        </SectionCard>
      </div>
    </AppShell>
  );
}
