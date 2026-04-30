import React from "react";
import { StyleSheet, View } from "react-native";
import type { ComponentType } from "react";

// Import directo para native (RN/Expo).
// En web se usará GlassSurface.web.tsx gracias a la extensión *.web.tsx.
const BlurView: ComponentType<any> | null =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  (() => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require("expo-blur").BlurView as ComponentType<any>;
    } catch {
      return null;
    }
  })();

export function GlassSurface({
  children,
  className = "",
  intensity = 55,
  tint = "dark",
}: {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  tint?: "light" | "dark";
}) {
  return (
    <View
      className={`rounded-2xl bg-white/5 border border-white/10 overflow-hidden ${className}`}
    >
      {BlurView ? (
        <BlurView
          intensity={intensity}
          tint={tint}
          style={StyleSheet.absoluteFillObject}
        />
      ) : null}
      <View style={{ position: "relative", zIndex: 1 }}>{children}</View>
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
  return (
    <GlassSurface className={`p-5 ${className}`}>{children}</GlassSurface>
  );
}

