"use client";

import type { PropsWithChildren, ReactNode } from "react";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="flex min-h-screen bg-[#eef1f8] text-[#1e2040]">
      {children}
    </div>
  );
}

export function SectionCard({
  title,
  subtitle,
  children,
  right,
}: PropsWithChildren<{ title?: string; subtitle?: string; right?: ReactNode }>) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_2px_15px_rgba(149,157,165,0.08)]">
      {(title || right) && (
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            {title && <h2 className="text-base font-semibold text-[#1e2040]">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
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
  tone = "blue",
  helper,
}: {
  label: string;
  value: string | number;
  tone?: "amber" | "red" | "green" | "blue";
  helper?: string;
}) {
  const toneMap = {
    amber: "text-amber-600 border-amber-100 bg-amber-50",
    red: "text-red-500 border-red-100 bg-red-50",
    green: "text-emerald-600 border-emerald-100 bg-emerald-50",
    blue: "text-[#4f6ef7] border-blue-100 bg-blue-50",
  };
  return (
    <div className={`rounded-2xl border p-4 ${toneMap[tone]}`}>
      <p className="text-xs uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
      {helper && <p className="mt-1 text-xs opacity-60">{helper}</p>}
    </div>
  );
}

export function InputField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm text-slate-500">{label}</span>
      <input
        {...props}
        className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[#1e2040] outline-none transition focus:border-[#4f6ef7] focus:ring-2 focus:ring-[#4f6ef7]/10 ${props.className ?? ""}`}
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
      className={`rounded-xl bg-[#4f6ef7] px-4 py-2.5 font-semibold text-white transition hover:bg-[#3d5ae0] shadow-[0_4px_12px_rgba(79,110,247,0.35)] disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
