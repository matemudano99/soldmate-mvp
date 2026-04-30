// packages/app/screens/CompanySettingsScreen.tsx
//
// Pantalla de configuración dinámica de la empresa.
// Solo accesible para usuarios con rol OWNER.
//
// Organiza los ajustes en tres pestañas:
//   IVA        → tipos de IVA y sus porcentajes
//   Categorías → categorías de producto personalizadas
//   Pedidos    → estados del flujo de pedido
//
// El dueño puede:
//   - Editar el valor de cualquier ajuste (ej: cambiar IVA del 10% al 4%)
//   - Añadir nuevos ajustes personalizados
//   - Eliminar ajustes que no necesite

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "../lib/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Pencil, Trash2, Percent, Tag, ClipboardList, X, Check,
} from "lucide-react-native";
import { useAuthStore } from "../lib/store";
import { settingsApi, type SettingResponse } from "../lib/apiSettings";
import { SkeletonLoader, ErrorState } from "../components/ui";
import { ModuleNavbar } from "../components/ModuleNavbar";
import { MobileTopBar } from "../components/MobileTopBar";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type Tab = "VAT" | "CATEGORY" | "ORDER_STATUS";

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  placeholder: { key: string; value: string; label: string };
  valueHint: string;
}

const TABS: TabConfig[] = [
  {
    id: "VAT",
    label: "IVA",
    icon: <Percent size={16} color="currentColor" />,
    placeholder: { key: "VAT_ESPECIAL", value: "4.00", label: "IVA superreducido" },
    valueHint: "Porcentaje (ej: 10.00)",
  },
  {
    id: "CATEGORY",
    label: "Categorías",
    icon: <Tag size={16} color="currentColor" />,
    placeholder: { key: "CAT_DAIRY", value: "Lácteos", label: "Lácteos y derivados" },
    valueHint: "Nombre de la categoría",
  },
  {
    id: "ORDER_STATUS",
    label: "Pedidos",
    icon: <ClipboardList size={16} color="currentColor" />,
    placeholder: { key: "ORDER_WAITING", value: "En espera", label: "En espera" },
    valueHint: "Nombre del estado",
  },
];

// ─── Hook de configuración ────────────────────────────────────────────────────

function useSettings() {
  const token = useAuthStore((s) => s.token)!;
  const qc    = useQueryClient();

  const query = useQuery({
    queryKey: ["settings"],
    queryFn:  () => settingsApi.getAll(token),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, value, label }: { id: number; value: string; label?: string }) =>
      settingsApi.update(token, id, { value, label }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const createMut = useMutation({
    mutationFn: (data: { key: string; value: string; label: string; group: string }) =>
      settingsApi.create(token, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: number) => settingsApi.delete(token, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  return { query, updateMut, createMut, deleteMut };
}

// ─── Fila de ajuste editable ──────────────────────────────────────────────────

interface SettingRowProps {
  setting: SettingResponse;
  valueHint: string;
  onUpdate: (id: number, value: string) => void;
  onDelete: (id: number) => void;
  isUpdating: boolean;
}

function SettingRow({ setting, valueHint, onUpdate, onDelete, isUpdating }: SettingRowProps) {
  const [editing, setEditing] = useState(false);
  const [value,   setValue]   = useState(setting.value);

  const handleSave = () => {
    if (value.trim() === setting.value) { setEditing(false); return; }
    onUpdate(setting.id, value.trim());
    setEditing(false);
  };

  const handleDelete = () => {
    Alert.alert(
      "Eliminar ajuste",
      `¿Seguro que quieres eliminar "${setting.label}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => onDelete(setting.id) },
      ]
    );
  };

  return (
    <View className="flex-row items-center px-4 py-3 border-b border-slate-800 gap-3">
      <View className="flex-1">
        <Text className="text-white text-sm font-medium">{setting.label}</Text>
        <Text className="text-slate-500 text-xs font-mono">{setting.key}</Text>
      </View>

      {editing ? (
        // Modo edición: input inline
        <View className="flex-row items-center gap-2">
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={valueHint}
            placeholderTextColor="#475569"
            autoFocus
            className="bg-slate-700 border border-amber-500 rounded-lg px-3 py-2 text-white text-sm w-28 text-right"
          />
          <TouchableOpacity onPress={handleSave} className="bg-emerald-600 rounded-lg p-2">
            {isUpdating
              ? <ActivityIndicator size="small" color="white" />
              : <Check size={14} color="white" />}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setValue(setting.value); setEditing(false); }}
            className="bg-slate-700 rounded-lg p-2"
          >
            <X size={14} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      ) : (
        // Modo visualización: valor + botones de acción
        <View className="flex-row items-center gap-2">
          <View className="bg-slate-700/60 rounded-lg px-3 py-1.5">
            <Text className="text-amber-300 text-sm font-mono font-semibold">
              {setting.value}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setEditing(true)}
            className="bg-slate-700 rounded-lg p-2"
          >
            <Pencil size={14} color="#94a3b8" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="bg-slate-700 rounded-lg p-2">
            <Trash2 size={14} color="#f87171" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Modal para añadir ajuste ─────────────────────────────────────────────────

interface AddSettingModalProps {
  visible: boolean;
  tab: TabConfig;
  onClose: () => void;
  onCreate: (data: { key: string; value: string; label: string; group: string }) => void;
  isLoading: boolean;
}

function AddSettingModal({ visible, tab, onClose, onCreate, isLoading }: AddSettingModalProps) {
  const [key,   setKey]   = useState("");
  const [value, setValue] = useState("");
  const [label, setLabel] = useState("");

  const handleCreate = () => {
    if (!key.trim() || !value.trim() || !label.trim()) return;
    onCreate({
      key:   key.trim().toUpperCase().replace(/\s+/g, "_"),
      value: value.trim(),
      label: label.trim(),
      group: tab.id,
    });
    // Limpiar y cerrar tras crear
    setKey(""); setValue(""); setLabel("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 gap-5">
          <View className="w-12 h-1 bg-slate-600 rounded-full self-center" />

          <View className="flex-row items-center justify-between">
            <Text className="text-white font-bold text-xl">
              Añadir {tab.label.toLowerCase()}
            </Text>
            <TouchableOpacity onPress={onClose} className="bg-slate-800 rounded-xl p-2">
              <X size={18} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            {/* Etiqueta legible */}
            <View className="gap-1.5">
              <Text className="text-slate-300 text-sm font-medium">Nombre visible</Text>
              <TextInput
                value={label}
                onChangeText={setLabel}
                placeholder={tab.placeholder.label}
                placeholderTextColor="#475569"
                className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3.5 text-white"
              />
            </View>

            {/* Valor */}
            <View className="gap-1.5">
              <Text className="text-slate-300 text-sm font-medium">Valor</Text>
              <TextInput
                value={value}
                onChangeText={setValue}
                placeholder={tab.placeholder.value}
                placeholderTextColor="#475569"
                keyboardType={tab.id === "VAT" ? "decimal-pad" : "default"}
                className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3.5 text-white"
              />
              <Text className="text-slate-500 text-xs">{tab.valueHint}</Text>
            </View>

            {/* Clave interna (se genera desde el nombre si está vacía) */}
            <View className="gap-1.5">
              <Text className="text-slate-300 text-sm font-medium">
                Clave interna{" "}
                <Text className="text-slate-500">(opcional, se genera automáticamente)</Text>
              </Text>
              <TextInput
                value={key}
                onChangeText={setKey}
                placeholder={tab.placeholder.key}
                placeholderTextColor="#475569"
                autoCapitalize="characters"
                className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3.5 text-white font-mono"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCreate}
            disabled={!key.trim() || !value.trim() || !label.trim() || isLoading}
            className={`
              bg-amber-500 rounded-xl py-4 items-center
              ${(!key.trim() || !value.trim() || !label.trim()) ? "opacity-40" : ""}
            `}
          >
            {isLoading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">Guardar ajuste</Text>}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── CompanySettingsScreen ────────────────────────────────────────────────────

export function CompanySettingsScreen() {
  const router = useRouter();
  const role   = useAuthStore((s) => s.role);

  const [activeTab,   setActiveTab]   = useState<Tab>("VAT");
  const [showModal,   setShowModal]   = useState(false);

  const { query, updateMut, createMut, deleteMut } = useSettings();

  // Solo el dueño puede acceder a esta pantalla
  if (role !== "OWNER") {
    return (
      <View className="flex-1 bg-slate-950 items-center justify-center p-8 gap-4">
        <Text className="text-4xl">🔒</Text>
        <Text className="text-white font-bold text-xl text-center">Acceso restringido</Text>
        <Text className="text-slate-400 text-center">
          Solo el dueño puede gestionar la configuración
        </Text>
      </View>
    );
  }

  const currentTabConfig = TABS.find((t) => t.id === activeTab)!;

  // Extraemos los ajustes del grupo activo de la respuesta agrupada
  const groupSettings: SettingResponse[] =
    query.data?.groups?.[activeTab] ?? [];

  return (
    <View className="flex-1 bg-slate-950">

      {/* ── Header ── */}
      <MobileTopBar
        title="Configuración"
        subtitle="IVA · Categorías · Estados de pedido"
        onBack={() => router.back()}
      />

      {/* ── Tabs ── */}
      <View className="flex-row border-b border-slate-800">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex-row items-center justify-center gap-1.5 py-3.5
                ${active ? "border-b-2 border-amber-500" : ""}
              `}
            >
              <Text className={active ? "text-amber-400" : "text-slate-500"}>
                {/* El icono de lucide no acepta "currentColor" en RN directamente */}
              </Text>
              <Text className={`text-sm font-semibold ${active ? "text-amber-400" : "text-slate-500"}`}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── Contenido ── */}
      {query.isLoading ? (
        <SkeletonLoader lines={4} />
      ) : query.isError ? (
        <ErrorState
          message="No se pudo cargar la configuración"
          onRetry={() => query.refetch()}
        />
      ) : (
        <>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerClassName="pb-28">

            {/* Información del grupo activo */}
            <View className="px-4 py-3">
              <Text className="text-slate-400 text-xs">
                {activeTab === "VAT" &&
                  "Define los tipos de IVA aplicables. El porcentaje se usará en el cálculo de facturas."}
                {activeTab === "CATEGORY" &&
                  "Categorías para clasificar tus productos en el inventario."}
                {activeTab === "ORDER_STATUS" &&
                  "Estados que puede tener un pedido desde que se recibe hasta que se entrega."}
              </Text>
            </View>

            {/* Lista de ajustes */}
            {groupSettings.length === 0 ? (
              <View className="items-center py-12 gap-3">
                <Text className="text-4xl">📋</Text>
                <Text className="text-slate-400 text-sm">Sin ajustes en este grupo</Text>
              </View>
            ) : (
              <View className="bg-slate-900/50 mx-4 rounded-2xl overflow-hidden border border-slate-800">
                {groupSettings
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((setting) => (
                    <SettingRow
                      key={setting.id}
                      setting={setting}
                      valueHint={currentTabConfig.valueHint}
                      onUpdate={(id, value) => updateMut.mutate({ id, value })}
                      onDelete={(id) => deleteMut.mutate(id)}
                      isUpdating={updateMut.isPending}
                    />
                  ))}
              </View>
            )}

            {/* Nota informativa */}
            <View className="mx-4 mt-4 bg-slate-800/40 rounded-xl p-3">
              <Text className="text-slate-500 text-xs">
                Los cambios se aplican inmediatamente a todos los usuarios de tu empresa.
                Los ajustes eliminados se desactivan pero no se borran de la base de datos.
              </Text>
            </View>

            <View className="h-24" />
          </ScrollView>

          {/* ── FAB: añadir nuevo ajuste ── */}
          <TouchableOpacity
            onPress={() => setShowModal(true)}
            className="absolute bottom-8 right-6 bg-amber-500 rounded-2xl px-5 py-3.5 flex-row items-center gap-2 shadow-lg"
            style={{
              shadowColor: "#f59e0b",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 8,
              elevation: 8,
            }}
          >
            <Plus size={18} color="white" />
            <Text className="text-white font-semibold">Añadir</Text>
          </TouchableOpacity>
        </>
      )}

      {/* ── Modal de creación ── */}
      <AddSettingModal
        visible={showModal}
        tab={currentTabConfig}
        onClose={() => setShowModal(false)}
        onCreate={(data) => createMut.mutate(data)}
        isLoading={createMut.isPending}
      />

      <ModuleNavbar active="settings" />
    </View>
  );
}
