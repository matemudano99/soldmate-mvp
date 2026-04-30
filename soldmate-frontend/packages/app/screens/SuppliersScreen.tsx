// packages/app/screens/SuppliersScreen.tsx
//
// Gestión de proveedores del negocio.
// Lista con datos de contacto + modal para añadir o editar.
// Solo el OWNER puede crear o eliminar proveedores.

import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, TextInput, RefreshControl, Alert,
} from "react-native";
import { useRouter } from "../lib/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Phone, Mail, Tag, Trash2, User, X,
} from "lucide-react-native";
import { useAuthStore } from "../lib/store";
import { SkeletonLoader, ErrorState, EmptyState, Button } from "../components/ui";
import { ModuleNavbar } from "../components/ModuleNavbar";
import { MobileTopBar } from "../components/MobileTopBar";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:28080";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SupplierResponse {
  id: number;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactPerson: string | null;
  category: string | null;
  notes: string | null;
}

interface SupplierForm {
  name: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  category: string;
  notes: string;
}

const EMPTY_FORM: SupplierForm = {
  name: "", contactEmail: "", contactPhone: "",
  contactPerson: "", category: "", notes: "",
};

// ─── Hook de datos ────────────────────────────────────────────────────────────

function useSuppliers() {
  const token = useAuthStore((s) => s.token)!;
  const qc    = useQueryClient();

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const query = useQuery<SupplierResponse[]>({
    queryKey: ["suppliers"],
    queryFn:  async () => {
      const r = await fetch(`${BASE_URL}/api/v1/suppliers`, { headers: authHeaders });
      if (!r.ok) throw new Error("Error al cargar proveedores");
      return r.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async (data: SupplierForm) => {
      const r = await fetch(`${BASE_URL}/api/v1/suppliers`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`${BASE_URL}/api/v1/suppliers/${id}`, {
        method: "DELETE", headers: authHeaders,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  return { query, createMut, deleteMut };
}

// ─── Modal de creación ────────────────────────────────────────────────────────

interface SupplierModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (form: SupplierForm) => void;
  isLoading: boolean;
}

function SupplierModal({ visible, onClose, onCreate, isLoading }: SupplierModalProps) {
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const update = (field: keyof SupplierForm, value: string) =>
    setForm((p) => ({ ...p, [field]: value }));

  const handleCreate = () => {
    if (!form.name.trim()) { setError("El nombre es obligatorio"); return; }
    onCreate(form);
    setForm(EMPTY_FORM);
    setError(null);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <ScrollView
          className="bg-slate-900 border-t border-slate-700 rounded-t-3xl"
          keyboardShouldPersistTaps="handled"
        >
          <View className="p-6 gap-5 pb-10">
            <View className="w-12 h-1 bg-slate-600 rounded-full self-center" />

            <View className="flex-row items-center justify-between">
              <Text className="text-white font-bold text-xl">Nuevo proveedor</Text>
              <TouchableOpacity onPress={onClose} className="bg-slate-800 rounded-xl p-2">
                <X size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Campos del formulario usando un componente de fila reutilizable */}
            {[
              { field: "name" as const,          label: "Nombre *",           placeholder: "Frutas Martínez S.L.",    icon: <User size={16} color="#64748b" />  },
              { field: "contactPerson" as const,  label: "Persona de contacto", placeholder: "Paco Martínez",          icon: <User size={16} color="#64748b" />  },
              { field: "contactPhone" as const,   label: "Teléfono",            placeholder: "+34 600 000 000",         icon: <Phone size={16} color="#64748b" /> },
              { field: "contactEmail" as const,   label: "Email",               placeholder: "pedidos@proveedor.com",   icon: <Mail size={16} color="#64748b" />  },
              { field: "category" as const,       label: "Categoría",           placeholder: "Frutas y verduras",       icon: <Tag size={16} color="#64748b" />   },
            ].map(({ field, label, placeholder, icon }) => (
              <View key={field} className="gap-1.5">
                <Text className="text-slate-300 text-sm font-medium">{label}</Text>
                <View className="flex-row items-center bg-slate-800 border border-slate-600 rounded-xl px-3 gap-2">
                  {icon}
                  <TextInput
                    value={form[field]}
                    onChangeText={(t) => update(field, t)}
                    placeholder={placeholder}
                    placeholderTextColor="#475569"
                    className="flex-1 py-3.5 text-white text-sm"
                    keyboardType={field === "contactPhone" ? "phone-pad" : field === "contactEmail" ? "email-address" : "default"}
                    autoCapitalize={field === "contactEmail" ? "none" : "sentences"}
                  />
                </View>
              </View>
            ))}

            {/* Notas (campo largo) */}
            <View className="gap-1.5">
              <Text className="text-slate-300 text-sm font-medium">Notas</Text>
              <TextInput
                value={form.notes}
                onChangeText={(t) => update("notes", t)}
                placeholder="Días de reparto, condiciones de pago…"
                placeholderTextColor="#475569"
                multiline
                numberOfLines={3}
                className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3.5 text-white text-sm min-h-[80px]"
                style={{ textAlignVertical: "top" }}
              />
            </View>

            {error && (
              <Text className="text-red-400 text-sm">{error}</Text>
            )}

            <Button onPress={handleCreate} loading={isLoading}>
              Guardar proveedor
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Tarjeta de proveedor ─────────────────────────────────────────────────────

interface SupplierCardProps {
  supplier: SupplierResponse;
  canDelete: boolean;
  onDelete: () => void;
}

function SupplierCard({ supplier, canDelete, onDelete }: SupplierCardProps) {
  const handleDelete = () =>
    Alert.alert(
      "Eliminar proveedor",
      `¿Seguro que quieres eliminar a "${supplier.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: onDelete },
      ]
    );

  return (
    <View className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 gap-3">
      {/* Cabecera: nombre + botón eliminar */}
      <View className="flex-row items-start justify-between gap-2">
        <View className="flex-1">
          <Text className="text-white font-bold text-base">{supplier.name}</Text>
          {supplier.category && (
            <View className="flex-row items-center gap-1 mt-0.5">
              <Tag size={11} color="#64748b" />
              <Text className="text-slate-500 text-xs">{supplier.category}</Text>
            </View>
          )}
        </View>
        {canDelete && (
          <TouchableOpacity
            onPress={handleDelete}
            className="bg-slate-700 rounded-lg p-2"
          >
            <Trash2 size={15} color="#f87171" />
          </TouchableOpacity>
        )}
      </View>

      {/* Datos de contacto */}
      <View className="gap-1.5">
        {supplier.contactPerson && (
          <View className="flex-row items-center gap-2">
            <User size={13} color="#94a3b8" />
            <Text className="text-slate-300 text-sm">{supplier.contactPerson}</Text>
          </View>
        )}
        {supplier.contactPhone && (
          <View className="flex-row items-center gap-2">
            <Phone size={13} color="#94a3b8" />
            <Text className="text-slate-300 text-sm">{supplier.contactPhone}</Text>
          </View>
        )}
        {supplier.contactEmail && (
          <View className="flex-row items-center gap-2">
            <Mail size={13} color="#94a3b8" />
            <Text className="text-slate-300 text-sm">{supplier.contactEmail}</Text>
          </View>
        )}
      </View>

      {supplier.notes && (
        <Text className="text-slate-500 text-xs border-t border-slate-700 pt-2">
          {supplier.notes}
        </Text>
      )}
    </View>
  );
}

// ─── SuppliersScreen ──────────────────────────────────────────────────────────

export function SuppliersScreen() {
  const router = useRouter();
  const role   = useAuthStore((s) => s.role);
  const [showModal, setShowModal] = useState(false);

  const { query, createMut, deleteMut } = useSuppliers();

  return (
    <View className="flex-1 bg-slate-950">

      {/* ── Header ── */}
      <MobileTopBar
        title="Proveedores"
        subtitle={`${query.data?.length ?? 0} proveedores activos`}
        onBack={() => router.back()}
      />
      {role === "OWNER" && (
        <View className="px-4 pt-2 pb-3 border-b border-slate-800 items-end">
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="bg-amber-500 rounded-xl p-2.5"
          >
            <Plus size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Lista ── */}
      {query.isLoading ? (
        <SkeletonLoader lines={3} />
      ) : query.isError ? (
        <ErrorState
          message="No se pudieron cargar los proveedores"
          onRetry={() => query.refetch()}
        />
      ) : (query.data?.length ?? 0) === 0 ? (
        <EmptyState
          icon="🚚"
          title="Sin proveedores"
          subtitle={
            role === "OWNER"
              ? "Añade tu primer proveedor con el botón +"
              : "El dueño aún no ha añadido proveedores"
          }
        />
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="p-4 gap-3 pb-28"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={query.isLoading}
              onRefresh={() => query.refetch()}
              tintColor="#f59e0b"
            />
          }
        >
          {(query.data ?? []).map((supplier) => (
            <SupplierCard
              key={supplier.id}
              supplier={supplier}
              canDelete={role === "OWNER"}
              onDelete={() => deleteMut.mutate(supplier.id)}
            />
          ))}
        </ScrollView>
      )}

      {/* ── Modal de creación ── */}
      <SupplierModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCreate={(form) => {
          createMut.mutate(form, { onSuccess: () => setShowModal(false) });
        }}
        isLoading={createMut.isPending}
      />

      <ModuleNavbar active="suppliers" />
    </View>
  );
}
