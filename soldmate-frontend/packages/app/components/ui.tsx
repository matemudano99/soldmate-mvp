// packages/app/components/ui.tsx
//
// Componentes de UI reutilizables construidos con NativeWind v4.
// Funcionan en React Native (mobile) y Next.js (web) gracias a Solito.
//
// NativeWind v4 te permite usar clases de Tailwind CSS directamente
// en componentes React Native, igual que en web.

import React from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";

export { GlassSurface, GlassCard } from "./GlassSurface";

// ─── StockBadge ──────────────────────────────────────────────────────────────
// Muestra una etiqueta de color según el nivel de stock.

interface StockBadgeProps {
  lowStock: boolean;
  currentStock: number;
  unit: string;
}

export function StockBadge({ lowStock, currentStock, unit }: StockBadgeProps) {
  // Colores: rojo para stock bajo, verde para stock normal
  const badgeClass = lowStock
    ? "bg-red-500/10 border border-red-500/30"
    : "bg-turq-500/10 border border-turq-400/30";

  const textClass = lowStock
    ? "text-red-300 font-semibold"
    : "text-turq-300 font-semibold";

  return (
    <View className={`px-3 py-1 rounded-full ${badgeClass}`}>
      <Text className={`text-xs ${textClass}`}>
        {currentStock} {unit.toLowerCase()}
        {lowStock ? " ⚠" : ""}
      </Text>
    </View>
  );
}

// ─── PriorityBadge ────────────────────────────────────────────────────────────

interface PriorityBadgeProps {
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  LOW:      { bg: "bg-slate-500/10 border border-slate-400/20", text: "text-slate-200", label: "Baja" },
  MEDIUM:   { bg: "bg-turq-400/10 border border-turq-300/25",   text: "text-turq-200",   label: "Media" },
  HIGH:     { bg: "bg-amber-400/10 border border-amber-300/25", text: "text-amber-200",  label: "Alta" },
  CRITICAL: { bg: "bg-red-500/10 border border-red-400/25",    text: "text-red-200 font-bold", label: "Crítica" },
};

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const style = PRIORITY_STYLES[priority];
  return (
    <View className={`px-3 py-1 rounded-full ${style.bg}`}>
      <Text className={`text-xs ${style.text}`}>{style.label}</Text>
    </View>
  );
}

// ─── StatusBadge ──────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
}

const STATUS_LABELS: Record<string, string> = {
  OPEN:        "Abierta",
  IN_PROGRESS: "En curso",
  CLOSED:      "Cerrada",
};

const STATUS_STYLES: Record<string, string> = {
  OPEN:        "bg-red-500/10 border border-red-400/25 text-red-200",
  IN_PROGRESS: "bg-turq-500/10 border border-turq-400/25 text-turq-200",
  CLOSED:      "bg-slate-500/10 border border-slate-400/20 text-slate-200",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <View className={`px-3 py-1 rounded-full ${STATUS_STYLES[status]}`}>
      <Text className={`text-xs ${STATUS_STYLES[status]}`}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────

interface ButtonProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  loading?: boolean;
  disabled?: boolean;
}

export function Button({
  onPress,
  children,
  variant = "primary",
  loading = false,
  disabled = false,
}: ButtonProps) {
  const variants = {
    primary:   "bg-turq-500/90 border border-turq-400/40 active:bg-turq-600/90",
    secondary: "bg-white/5 border border-white/10 active:bg-white/10",
    danger:    "bg-red-500/90 border border-red-400/40 active:bg-red-600/90",
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${variants[variant]}
        ${isDisabled ? "opacity-50" : ""}
        rounded-xl py-4 px-6
        flex-row items-center justify-center gap-2
      `}
    >
      {loading ? (
        <ActivityIndicator color="white" size="small" />
      ) : (
        <Text className="text-white font-semibold text-base">{children}</Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string | null;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  multiline?: boolean;
  numberOfLines?: number;
}

export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  autoCapitalize = "sentences",
  keyboardType = "default",
  multiline = false,
  numberOfLines = 1,
}: InputProps) {
  return (
    <View className="gap-1.5">
      <Text className="text-sm font-medium text-slate-300">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        multiline={multiline}
        numberOfLines={numberOfLines}
        className={`
          bg-white/5 border rounded-xl px-4 py-3.5
          text-white text-base
          ${error ? "border-red-500/60" : "border-white/10"}
          ${multiline ? "min-h-[100px] text-top" : ""}
        `}
      />
      {/* Mensaje de error debajo del input */}
      {error && (
        <Text className="text-red-400 text-xs">{error}</Text>
      )}
    </View>
  );
}

// ─── SkeletonLoader ───────────────────────────────────────────────────────────
// Se muestra mientras se cargan los datos (mejor UX que un spinner vacío).

interface SkeletonProps {
  lines?: number;
}

export function SkeletonLoader({ lines = 3 }: SkeletonProps) {
  return (
    <View className="gap-3 p-4">
      {Array.from({ length: lines }).map((_, i) => (
        <View
          key={i}
          className="h-16 bg-white/10 rounded-xl animate-pulse"
          style={{ opacity: 1 - i * 0.2 }} // cada línea es más tenue
        />
      ))}
    </View>
  );
}

// ─── ErrorState ───────────────────────────────────────────────────────────────
// Estado de error amigable con botón para reintentar.

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <GlassSurface className="flex-1 items-center justify-center gap-4 p-8">
      <Text className="text-4xl">⚠️</Text>
      <Text className="text-slate-300 text-center text-base">{message}</Text>
      {onRetry && (
        <Button onPress={onRetry} variant="secondary">
          Reintentar
        </Button>
      )}
    </GlassSurface>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
}

export function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <GlassSurface className="flex-1 items-center justify-center gap-3 p-8">
      <Text className="text-5xl">{icon}</Text>
      <Text className="text-white font-semibold text-lg text-center">{title}</Text>
      {subtitle && (
        <Text className="text-slate-400 text-sm text-center">{subtitle}</Text>
      )}
    </GlassSurface>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 rounded-xl border border-white/10 bg-white/5">
      <View>
        <Text className="text-white font-bold text-lg">{title}</Text>
        {subtitle && (
          <Text className="text-slate-400 text-sm">{subtitle}</Text>
        )}
      </View>
      {action}
    </View>
  );
}
