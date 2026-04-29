// packages/app/screens/DashboardScreen.tsx
//
// Dashboard principal de Soldmate.
// Esta pantalla se renderiza en web (Next.js) y mobile (Expo).
//
// Secciones:
//   1. Header con nombre de empresa y rol del usuario
//   2. Tarjetas de resumen (KPI cards): total productos, alertas, incidencias
//   3. Panel de alertas de stock bajo
//   4. Lista de inventario completo con indicadores visuales
//   5. Acceso rápido a reportar incidencia (especialmente útil en mobile)

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "../lib/router";
import { Package, AlertTriangle, Wrench, LogOut, Plus, ChevronRight } from "lucide-react-native";
import { useAuthStore } from "../lib/store";
import { useInventory, useUpdateStock } from "../hooks/useInventory";
import {
  StockBadge,
  SkeletonLoader,
  ErrorState,
  EmptyState,
  SectionHeader,
  Button,
} from "../components/ui";
import type { ProductResponse } from "../lib/api";

// ─── KPI Card ─────────────────────────────────────────────────────────────────
// Tarjeta de resumen pequeña (número + etiqueta + icono)

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  accent?: "amber" | "red" | "green";
  onPress?: () => void;
}

function KpiCard({ label, value, icon, accent = "amber", onPress }: KpiCardProps) {
  const accentColors = {
    amber: "border-amber-500/30 bg-amber-500/10",
    red:   "border-red-500/30 bg-red-500/10",
    green: "border-emerald-500/30 bg-emerald-500/10",
  };

  const textColors = {
    amber: "text-amber-400",
    red:   "text-red-400",
    green: "text-emerald-400",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-1 border rounded-2xl p-4 gap-2 ${accentColors[accent]}`}
      disabled={!onPress}
    >
      <View className="flex-row items-center justify-between">
        {icon}
        {onPress && <ChevronRight size={14} color="#64748b" />}
      </View>
      <Text className={`text-2xl font-bold ${textColors[accent]}`}>{value}</Text>
      <Text className="text-slate-400 text-xs">{label}</Text>
    </TouchableOpacity>
  );
}

// ─── ProductRow ───────────────────────────────────────────────────────────────
// Fila de un producto en la lista de inventario

interface ProductRowProps {
  product: ProductResponse;
  onUpdateStock: (product: ProductResponse) => void;
}

function ProductRow({ product, onUpdateStock }: ProductRowProps) {
  return (
    <View
      className={`
        flex-row items-center justify-between px-4 py-3.5
        border-b border-slate-800
        ${product.lowStock ? "bg-red-950/20" : ""}
      `}
    >
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          {/* Indicador visual de stock bajo */}
          {product.lowStock && (
            <View className="w-1.5 h-1.5 rounded-full bg-red-400" />
          )}
          <Text className="text-white font-medium text-sm">{product.name}</Text>
        </View>
        {product.category && (
          <Text className="text-slate-500 text-xs">{product.category}</Text>
        )}
      </View>

      <View className="flex-row items-center gap-3">
        <StockBadge
          lowStock={product.lowStock}
          currentStock={product.currentStock}
          unit={product.unit}
        />
        {/* Botón para actualizar stock rápidamente desde mobile */}
        <TouchableOpacity
          onPress={() => onUpdateStock(product)}
          className="bg-slate-700 rounded-lg p-2"
        >
          <Plus size={14} color="#94a3b8" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Modal para actualizar stock ──────────────────────────────────────────────

interface UpdateStockModalProps {
  product: ProductResponse | null;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  isLoading: boolean;
}

function UpdateStockModal({ product, onClose, onConfirm, isLoading }: UpdateStockModalProps) {
  const [quantity, setQuantity] = useState("");

  if (!product) return null;

  const handleConfirm = () => {
    const q = parseFloat(quantity);
    if (isNaN(q) || q === 0) return;
    onConfirm(q);
  };

  return (
    <Modal
      visible={!!product}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="bg-slate-900 border-t border-slate-700 rounded-t-3xl p-6 gap-5">

          <View className="w-12 h-1 bg-slate-600 rounded-full self-center" />

          <View>
            <Text className="text-white font-bold text-xl">{product.name}</Text>
            <Text className="text-slate-400 text-sm">
              Stock actual: {product.currentStock} {product.unit.toLowerCase()}
            </Text>
          </View>

          <View className="gap-2">
            <Text className="text-slate-300 text-sm font-medium">
              Cantidad (+ entrada / − consumo)
            </Text>
            <TextInput
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Ej: 5 o -2.5"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3.5 text-white text-base"
            />
          </View>

          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-slate-800 rounded-xl py-4 items-center"
            >
              <Text className="text-slate-300 font-semibold">Cancelar</Text>
            </TouchableOpacity>
            <View className="flex-1">
              <Button onPress={handleConfirm} loading={isLoading}>
                Actualizar
              </Button>
            </View>
          </View>

        </View>
      </View>
    </Modal>
  );
}

// ─── DashboardScreen ──────────────────────────────────────────────────────────

export function DashboardScreen() {
  const router   = useRouter();
  const { email, role, tier, logout } = useAuthStore();
  const { products, lowStockProducts, isLoading, isError, error, refetch } = useInventory();

  // Estado para el modal de actualización de stock
  const [selectedProduct, setSelectedProduct] = useState<ProductResponse | null>(null);
  const { updateStock, isUpdating } = useUpdateStock();

  // Cerrar sesión y volver al login
  const handleLogout = () => {
    logout();
    router.replace("/");
  };

  // Confirmar actualización de stock
  const handleStockUpdate = (quantity: number) => {
    if (!selectedProduct) return;
    updateStock(
      { productId: selectedProduct.id, quantity },
      { onSuccess: () => setSelectedProduct(null) }
    );
  };

  // ── Estado de carga ──
  if (isLoading) {
    return (
      <View className="flex-1 bg-slate-950">
        <View className="px-4 pt-14 pb-4">
          <Text className="text-white text-2xl font-bold">Soldmate</Text>
        </View>
        <SkeletonLoader lines={5} />
      </View>
    );
  }

  // ── Estado de error ──
  if (isError) {
    return (
      <View className="flex-1 bg-slate-950 pt-14">
        <ErrorState
          message={error?.message ?? "No se pudo cargar el inventario"}
          onRetry={refetch}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-950">

      {/* ── Header ── */}
      <View className="px-4 pt-14 pb-4 flex-row items-center justify-between border-b border-slate-800">
        <View>
          <Text className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
            Soldmate {tier === "PREMIUM" ? "· Premium" : ""}
          </Text>
          <Text className="text-white text-xl font-bold">Dashboard</Text>
        </View>
        <View className="flex-row items-center gap-3">
          {/* Indicador de rol */}
          <View className="bg-slate-800 rounded-full px-3 py-1">
            <Text className="text-slate-300 text-xs font-medium">
              {role === "OWNER" ? "Dueño" : "Staff"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-slate-800 rounded-xl p-2.5"
          >
            <LogOut size={18} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          // Pull-to-refresh: desliza hacia abajo para recargar los datos
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor="#f59e0b"
          />
        }
      >

        {/* ── KPI Cards ── */}
        <View className="px-4 pt-5 pb-2">
          <View className="flex-row gap-3">
            <KpiCard
              label="Productos"
              value={products.length}
              icon={<Package size={18} color="#f59e0b" />}
              accent="amber"
            />
            <KpiCard
              label="Stock bajo"
              value={lowStockProducts.length}
              icon={<AlertTriangle size={18} color={lowStockProducts.length > 0 ? "#f87171" : "#4ade80"} />}
              accent={lowStockProducts.length > 0 ? "red" : "green"}
            />
          </View>
        </View>

        {/* ── Alertas de stock bajo ── */}
        {lowStockProducts.length > 0 && (
          <View className="mx-4 my-3 bg-red-950/40 border border-red-900/50 rounded-2xl overflow-hidden">
            <View className="px-4 py-3 flex-row items-center gap-2 border-b border-red-900/30">
              <AlertTriangle size={16} color="#f87171" />
              <Text className="text-red-400 font-semibold text-sm">
                {lowStockProducts.length} producto{lowStockProducts.length > 1 ? "s" : ""} con stock bajo
              </Text>
            </View>
            {lowStockProducts.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => setSelectedProduct(p)}
                className="flex-row items-center justify-between px-4 py-3 border-b border-red-900/20 last:border-b-0"
              >
                <Text className="text-slate-200 text-sm">{p.name}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-red-400 text-xs">
                    {p.currentStock} / {p.minStock} {p.unit.toLowerCase()}
                  </Text>
                  <Plus size={14} color="#f87171" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Acceso rápido: reportar incidencia ── */}
        <View className="mx-4 mb-3">
          <TouchableOpacity
            onPress={() => router.push("/incidents/new")}
            className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-4 flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-3">
              <View className="bg-amber-500/20 rounded-xl p-2">
                <Wrench size={20} color="#f59e0b" />
              </View>
              <View>
                <Text className="text-white font-semibold text-sm">Reportar avería</Text>
                <Text className="text-slate-400 text-xs">Frigorífico, horno, cafetera…</Text>
              </View>
            </View>
            <ChevronRight size={18} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* ── Lista de inventario ── */}
        <SectionHeader
          title="Inventario"
          subtitle={`${products.length} productos`}
          action={
            role === "OWNER" ? (
              <TouchableOpacity
                onPress={() => router.push("/inventory/new")}
                className="bg-amber-500 rounded-xl px-3 py-2 flex-row items-center gap-1"
              >
                <Plus size={14} color="white" />
                <Text className="text-white text-xs font-semibold">Añadir</Text>
              </TouchableOpacity>
            ) : null
          }
        />

        {products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="Sin productos"
            subtitle="El dueño puede añadir productos desde aquí"
          />
        ) : (
          <View className="bg-slate-900/50 mx-4 rounded-2xl overflow-hidden border border-slate-800 mb-8">
            {products.map((product) => (
              <ProductRow
                key={product.id}
                product={product}
                onUpdateStock={setSelectedProduct}
              />
            ))}
          </View>
        )}

      </ScrollView>

      {/* ── Modal de actualización de stock ── */}
      <UpdateStockModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onConfirm={handleStockUpdate}
        isLoading={isUpdating}
      />

    </View>
  );
}
