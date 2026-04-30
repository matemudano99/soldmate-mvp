"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

type ModalShellProps = {
  title: string;
  subtitle: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  submitLabel: string;
  submitting?: boolean;
};

function ModalShell({
  title,
  subtitle,
  onClose,
  onSubmit,
  children,
  submitLabel,
  submitting = false,
}: ModalShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <div>
            <h2 className="text-base font-bold text-[#1e2040]">{title}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="px-6 py-5 space-y-4">
          {children}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-gray-200 text-gray-500 font-semibold py-2.5 text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#4f6ef7] text-white font-semibold py-2.5 text-sm hover:bg-[#3d5ae0] disabled:opacity-60">
              {submitting ? "Guardando..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-[11px] font-semibold text-gray-500 mb-1.5">{children}</label>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7] ${props.className ?? ""}`} />;
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7] min-h-24 resize-none ${props.className ?? ""}`} />;
}

export type CreateIncidentPayload = { title: string; description: string; priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" };
export function CreateIncidentModal({ onClose, onCreate }: { onClose: () => void; onCreate: (payload: CreateIncidentPayload) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<CreateIncidentPayload["priority"]>("MEDIUM");

  return (
    <ModalShell
      title="Nueva incidencia"
      subtitle="Registra una avería o problema operativo"
      onClose={onClose}
      submitLabel="Crear incidencia"
      onSubmit={(e) => {
        e.preventDefault();
        if (!title.trim()) return;
        onCreate({ title: title.trim(), description: description.trim(), priority });
        onClose();
      }}
    >
      <div>
        <Label>Título *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ej: Nevera no enfría" />
      </div>
      <div>
        <Label>Descripción</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe la incidencia..." />
      </div>
      <div>
        <Label>Prioridad</Label>
        <select value={priority} onChange={(e) => setPriority(e.target.value as CreateIncidentPayload["priority"])} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7]">
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => <option key={p}>{p}</option>)}
        </select>
      </div>
    </ModalShell>
  );
}

export type CreateSupplierPayload = { name: string; category: string; phone: string; email: string };
export function CreateSupplierModal({ onClose, onCreate }: { onClose: () => void; onCreate: (payload: CreateSupplierPayload) => void }) {
  const [form, setForm] = useState<CreateSupplierPayload>({ name: "", category: "", phone: "", email: "" });
  const set = (k: keyof CreateSupplierPayload, v: string) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <ModalShell
      title="Nuevo proveedor"
      subtitle="Añade un proveedor al sistema"
      onClose={onClose}
      submitLabel="Crear proveedor"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onCreate({ ...form, name: form.name.trim() });
        onClose();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nombre *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
        <div><Label>Categoría</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
      </div>
    </ModalShell>
  );
}

export type CreatePersonPayload = { name: string; department: string; role: string; email: string; phone: string; location: string; online: boolean };
export function CreatePersonModal({
  onClose,
  onCreate,
  departments,
}: { onClose: () => void; onCreate: (payload: CreatePersonPayload) => void; departments: string[] }) {
  const [form, setForm] = useState<CreatePersonPayload>({ name: "", department: departments[0] ?? "Design", role: "", email: "", phone: "", location: "", online: true });
  const set = (k: keyof CreatePersonPayload, v: string | boolean) => setForm((s) => ({ ...s, [k]: v as never }));

  return (
    <ModalShell
      title="Añadir persona"
      subtitle="Completa los datos del nuevo miembro"
      onClose={onClose}
      submitLabel="Añadir"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onCreate({ ...form, name: form.name.trim() });
        onClose();
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Nombre *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
        <div>
          <Label>Departamento</Label>
          <select value={form.department} onChange={(e) => set("department", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7]">
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
      </div>
      <div><Label>Cargo / Rol</Label><Input value={form.role} onChange={(e) => set("role", e.target.value)} /></div>
      <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        <div><Label>Ubicación</Label><Input value={form.location} onChange={(e) => set("location", e.target.value)} /></div>
      </div>
      <div className="flex items-center justify-between py-1">
        <span className="text-sm font-medium text-gray-600">Estado inicial</span>
        <button type="button" onClick={() => set("online", !form.online)} className={`relative w-11 h-6 rounded-full transition-colors ${form.online ? "bg-green-400" : "bg-gray-200"}`}>
          <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.online ? "left-6" : "left-1"}`} />
        </button>
      </div>
    </ModalShell>
  );
}

export type UploadDocumentPayload = { name: string; category: string; type: "pdf" | "xlsx" | "img" | "other"; size: string };
export function UploadDocumentModal({ onClose, onCreate }: { onClose: () => void; onCreate: (payload: UploadDocumentPayload) => void }) {
  const [form, setForm] = useState<UploadDocumentPayload>({ name: "", category: "Informes", type: "pdf", size: "120 KB" });
  const set = (k: keyof UploadDocumentPayload, v: string) => setForm((s) => ({ ...s, [k]: v as never }));

  return (
    <ModalShell
      title="Subir documento"
      subtitle="Registra un nuevo documento en el repositorio"
      onClose={onClose}
      submitLabel="Subir documento"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        onCreate({ ...form, name: form.name.trim() });
        onClose();
      }}
    >
      <div><Label>Nombre del documento *</Label><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Categoría</Label><Input value={form.category} onChange={(e) => set("category", e.target.value)} /></div>
        <div>
          <Label>Tipo</Label>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7]">
            {["pdf", "xlsx", "img", "other"].map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div><Label>Tamaño</Label><Input value={form.size} onChange={(e) => set("size", e.target.value)} placeholder="Ej: 300 KB" /></div>
    </ModalShell>
  );
}

export type CreateCalendarTaskPayload = { day: string; time: string; title: string };
export function CreateCalendarTaskModal({ onClose, onCreate, days }: { onClose: () => void; onCreate: (payload: CreateCalendarTaskPayload) => void; days: string[] }) {
  const [form, setForm] = useState<CreateCalendarTaskPayload>({ day: days[0] ?? "Mon", time: "09:00", title: "" });
  const set = (k: keyof CreateCalendarTaskPayload, v: string) => setForm((s) => ({ ...s, [k]: v }));

  return (
    <ModalShell
      title="Nueva tarea de calendario"
      subtitle="Programa una tarea o evento semanal"
      onClose={onClose}
      submitLabel="Crear tarea"
      onSubmit={(e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        onCreate({ ...form, title: form.title.trim() });
        onClose();
      }}
    >
      <div><Label>Título *</Label><Input value={form.title} onChange={(e) => set("title", e.target.value)} required /></div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Día</Label>
          <select value={form.day} onChange={(e) => set("day", e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-[#1e2040] outline-none focus:border-[#4f6ef7]">
            {days.map((d) => <option key={d}>{d}</option>)}
          </select>
        </div>
        <div><Label>Hora</Label><Input value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="09:00" /></div>
      </div>
    </ModalShell>
  );
}

