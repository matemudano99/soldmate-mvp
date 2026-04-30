import React from "react";
import { View } from "react-native";

export function GlassSurface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
  // Mantener compatibilidad con la versión nativa.
  intensity?: number;
  tint?: "light" | "dark";
}) {
  // En web evitamos `expo-blur` para no romper el build de Next.
  return (
    <View className={`rounded-2xl bg-white/5 border border-white/10 overflow-hidden ${className}`}>
      <View>{children}</View>
    </View>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <GlassSurface className={`p-5 ${className}`}>{children}</GlassSurface>;
}

