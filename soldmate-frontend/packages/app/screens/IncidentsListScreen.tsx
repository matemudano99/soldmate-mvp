// packages/app/screens/IncidentsListScreen.tsx
//
// Lista de incidencias con:
//   - Filtro por estado (Todas, Abiertas, En curso, Cerradas)
//   - Cambio de estado directamente desde la fila
//   - Pull-to-refresh
//   - Estado vacío e indicadores de prioridad

import React, { useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, Modal, ActivityIndicator,
} from "react-native";
import { useRouter } from "../lib/router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, ChevronDown, AlertTriangle,
  Clock, CheckCircle2, Circle,
} from "lucide-react-native";
import { useAuthStore } from "../lib/store";
import { incidentsApi, type IncidentResponse } from "../lib/api";
import {
  PriorityBadge, SkeletonLoader, ErrorState, EmptyState,
} from "../components/ui";
import { ModuleNavbar } from "../components/ModuleNavbar";
import { MobileTopBar } from "../components/MobileTopBar";

// ─── Tipos y constantes ───────────────────────────────────────────────────────

type Filter = "ALL" | "OPEN" | "IN_PROGRESS" | "CLOSED";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "ALL",         label: "Todas"    },
  { id: "OPEN",        label: "Abiertas" },
  { id: "IN_PROGRESS", label: "En curso" },
  { id: "CLOSED",      label: "Cerradas" },
];

const STATUS_CONFIG = {
  OPEN:        { label: "Abierta",  color: "#f87171", Icon: Circle },
  IN_PROGRESS: { label: "En curso", color: "#fbbf24", Icon: Clock  },
  CLOSED:      { label: "Cerrada",  color: "#4ade80", Icon: CheckCircle2 },
};

const PRIORITY_ORDER = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

// ─── Hook de datos ────────────────────────────────────────────────────────────

function useIncidents() {
  const token = useAuthStore((s) => s.token)!;
  const qc    = useQueryClient();

  const query = useQuery({
    queryKey: ["incidents"],
    queryFn:  () => incidentsApi.getAll(token),
  });

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:28080"}/api/v1/incidents/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      }).then((r) => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["incidents"] }),
  });

  return { query, statusMut };
}

// ─── Selector de estado (modal) ───────────────────────────────────────────────

interface StatusModalProps {
  incident: IncidentResponse | null;
  onClose: () => void;
  onSelect: (status: string) => void;
  isLoading: boolean;
}

function StatusModal({ incident, onClose, onSelect, isLoading }: StatusModalProps) {
  if (!incident) return null;

  const statuses = ["OPEN", "IN_PROGRESS", "CLOSED"] as const;

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 gap-4">
          <View className="w-12 h-1 bg-slate-600 rounded-full self-center" />
          <Text className="text-white font-bold text-lg">{incident.title}</Text>
          <Text className="text-slate-400 text-sm">Cambiar estado a:</Text>

          {statuses.map((s) => {
            const cfg     = STATUS_CONFIG[s];
            const current = s === incident.status;
            return (
              <TouchableOpacity
                key={s}
                onPress={() => onSelect(s)}
                disabled={current || isLoading}
                className={`
                  flex-row items-center gap-3 p-4 rounded-xl border
                  ${current
                    ? "bg-slate-700/50 border-slate-600 opacity-50"
                    : "bg-slate-800 border-slate-700 active:bg-slate-700"}
                `}
              >
                <cfg.Icon size={20} color={cfg.color} />
                <Text className="text-white font-medium flex-1">{cfg.label}</Text>
                {current && (
                  <Text className="text-slate-500 text-xs">Estado actual</Text>
                )}
                {isLoading && !current && (
                  <ActivityIndicator size="small" color="#f59e0b" />
                )}
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            onPress={onClose}
            className="bg-slate-800 rounded-xl py-4 items-center mt-1"
          >
            <Text className="text-slate-300 font-semibold">Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Fila de incidencia ───────────────────────────────────────────────────────

interface IncidentRowProps {
  incident: IncidentResponse;
  onChangeStatus: (incident: IncidentResponse) => void;
}

function IncidentRow({ incident, onChangeStatus }: IncidentRowProps) {
  const cfg = STATUS_CONFIG[incident.status as keyof typeof STATUS_CONFIG];
  const date = new Date(incident.createdAt).toLocaleDateString("es-ES", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <View className="px-4 py-3.5 border-b border-slate-800 gap-2">
      {/* Fila superior: título + prioridad */}
      <View className="flex-row items-start justify-between gap-2">
        <Text className="text-white font-semibold text-sm flex-1" numberOfLines={2}>
          {incident.title}
        </Text>
        <PriorityBadge priority={incident.priority as any} />
      </View>

      {/* Descripción */}
      {incident.description && (
        <Text className="text-slate-400 text-xs" numberOfLines={2}>
          {incident.description}
        </Text>
      )}

      {/* Fila inferior: fecha, quién reportó, botón de estado */}
      <View className="flex-row items-center justify-between">
        <View className="gap-0.5">
          <Text className="text-slate-500 text-xs">{date}</Text>
          {incident.reportedBy && (
            <Text className="text-slate-600 text-xs">{incident.reportedBy}</Text>
          )}
        </View>

        {/* Botón de cambio de estado */}
        <TouchableOpacity
          onPress={() => onChangeStatus(incident)}
          className="flex-row items-center gap-1.5 bg-slate-700 rounded-lg px-3 py-1.5"
        >
          <cfg.Icon size={13} color={cfg.color} />
          <Text className="text-slate-300 text-xs font-medium">{cfg.label}</Text>
          <ChevronDown size={12} color="#64748b" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── IncidentsListScreen ──────────────────────────────────────────────────────

export function IncidentsListScreen() {
  const router = useRouter();
  const [activeFilter,  setActiveFilter]  = useState<Filter>("ALL");
  const [selectedForStatus, setSelectedForStatus] = useState<IncidentResponse | null>(null);

  const { query, statusMut } = useIncidents();

  // Filtra y ordena las incidencias según la pestaña activa
  const incidents = (query.data ?? [])
    .filter((i) => activeFilter === "ALL" || i.status === activeFilter)
    .sort((a, b) =>
      (PRIORITY_ORDER[a.priority as keyof typeof PRIORITY_ORDER] ?? 9) -
      (PRIORITY_ORDER[b.priority as keyof typeof PRIORITY_ORDER] ?? 9)
    );

  // Contadores para las pestañas
  const counts = {
    ALL:         query.data?.length ?? 0,
    OPEN:        query.data?.filter((i) => i.status === "OPEN").length        ?? 0,
    IN_PROGRESS: query.data?.filter((i) => i.status === "IN_PROGRESS").length ?? 0,
    CLOSED:      query.data?.filter((i) => i.status === "CLOSED").length      ?? 0,
  };

  const handleStatusChange = (status: string) => {
    if (!selectedForStatus) return;
    statusMut.mutate(
      { id: selectedForStatus.id, status },
      { onSuccess: () => setSelectedForStatus(null) }
    );
  };

  return (
    <View className="flex-1 bg-slate-950">

      {/* ── Header ── */}
      <MobileTopBar
        title="Incidencias"
        subtitle={`${counts.OPEN + counts.IN_PROGRESS} activas · ${counts.CLOSED} cerradas`}
        onBack={() => router.back()}
      />
      <View className="px-4 pt-2 pb-3 border-b border-slate-800 items-end">
        <TouchableOpacity
          onPress={() => router.push("/incidents/new")}
          className="bg-amber-500 rounded-xl p-2.5"
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* ── Pestañas de filtro ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="border-b border-slate-800"
        contentContainerClassName="px-4 gap-1 py-2"
      >
        {FILTERS.map((f) => {
          const active = f.id === activeFilter;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => setActiveFilter(f.id)}
              className={`
                flex-row items-center gap-1.5 px-4 py-2 rounded-full
                ${active ? "bg-amber-500" : "bg-slate-800"}
              `}
            >
              <Text className={`text-sm font-semibold ${active ? "text-white" : "text-slate-400"}`}>
                {f.label}
              </Text>
              <View className={`px-1.5 py-0.5 rounded-full ${active ? "bg-white/20" : "bg-slate-700"}`}>
                <Text className={`text-xs font-bold ${active ? "text-white" : "text-slate-400"}`}>
                  {counts[f.id]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Contenido ── */}
      {query.isLoading ? (
        <SkeletonLoader lines={4} />
      ) : query.isError ? (
        <ErrorState
          message="No se pudieron cargar las incidencias"
          onRetry={() => query.refetch()}
        />
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={activeFilter === "CLOSED" ? "✅" : "🔧"}
          title={activeFilter === "CLOSED" ? "Sin incidencias cerradas" : "Sin incidencias"}
          subtitle={
            activeFilter === "ALL"
              ? "Pulsa + para reportar una avería"
              : `No hay incidencias en estado "${FILTERS.find((f) => f.id === activeFilter)?.label}"`
          }
        />
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-28"
          refreshControl={
            <RefreshControl
              refreshing={query.isLoading}
              onRefresh={() => query.refetch()}
              tintColor="#f59e0b"
            />
          }
        >
          <View className="bg-slate-900/50 mx-4 my-3 rounded-2xl overflow-hidden border border-slate-800">
            {incidents.map((incident) => (
              <IncidentRow
                key={incident.id}
                incident={incident}
                onChangeStatus={setSelectedForStatus}
              />
            ))}
          </View>
          <View className="h-8" />
        </ScrollView>
      )}

      {/* ── Modal de cambio de estado ── */}
      {selectedForStatus && (
        <StatusModal
          incident={selectedForStatus}
          onClose={() => setSelectedForStatus(null)}
          onSelect={handleStatusChange}
          isLoading={statusMut.isPending}
        />
      )}

      <ModuleNavbar active="incidents" />
    </View>
  );
}
