"use client";

import type { PropsWithChildren, ReactNode } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-6 md:py-10">{children}</div>
    </main>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  right,
}: PropsWithChildren<{ title?: string; subtitle?: string; right?: ReactNode }>) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/85 p-5 shadow-xl shadow-black/20">
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-sm text-slate-400">{subtitle}</p>}
          </div>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}

export function KpiTile({
  label,
  value,
  tone = "amber",
  helper,
}: {
  label: string;
  value: string | number;
  tone?: "amber" | "red" | "green" | "blue";
  helper?: string;
}) {
  const toneMap = {
    amber: "text-amber-300 border-amber-500/30 bg-amber-500/10",
    red: "text-red-300 border-red-500/30 bg-red-500/10",
    green: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10",
    blue: "text-sky-300 border-sky-500/30 bg-sky-500/10",
  };
  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone]}`}>
      <p className="text-xs uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
    </div>
  );
}

export function InputField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-300">{label}</span>
      <input
        {...props}
        className={`w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-white outline-none transition focus:border-amber-500 ${props.className ?? ""}`}
      />
    </label>
  );
}

export function PrimaryButton({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-white transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
