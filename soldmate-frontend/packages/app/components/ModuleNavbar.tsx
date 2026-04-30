import React, { useState } from "react";
import { Platform, View, Text, TouchableOpacity } from "react-native";
import { ChevronLeft, ChevronRight, Home, Pencil, Settings, Users, Wrench } from "lucide-react-native";
import { useRouter } from "../lib/router";
import { useAuthStore } from "../lib/store";

type ModuleKey = "dashboard" | "incidents" | "suppliers" | "settings";

const MODULES: Array<{
  key: ModuleKey;
  label: string;
  href: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}> = [
  { key: "dashboard", label: "ERP", href: "/dashboard", Icon: Home },
  { key: "incidents", label: "Incidencias", href: "/incidents", Icon: Wrench },
  { key: "suppliers", label: "Proveedores", href: "/suppliers", Icon: Users },
  { key: "settings", label: "Ajustes", href: "/company-settings", Icon: Settings },
];

export function ModuleNavbar({ active }: { active: ModuleKey }) {
  // Solo en móvil: en web usamos un navbar propio.
  if (Platform.OS === "web") return null;

  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);
  const { editMode, toggleEditMode } = useAuthStore();

  return (
    <View className="absolute left-2 top-28 z-50">
      <View className={`px-2 py-2 rounded-2xl border border-[#2a2e3d] bg-[#0f121c] ${collapsed ? "w-14" : "w-52"}`}>
        <TouchableOpacity
          onPress={() => setCollapsed((s) => !s)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 mb-2 items-center"
        >
          {collapsed ? <ChevronRight size={16} color="#cbd5e1" /> : <ChevronLeft size={16} color="#cbd5e1" />}
        </TouchableOpacity>

        {MODULES.map((m) => {
          const isActive = m.key === active;
          const color = isActive ? "#fde68a" : "#94a3b8";
          const badgeBg = isActive ? "bg-amber-500/20 border border-amber-400/30" : "bg-transparent border border-slate-700";

          return (
            <TouchableOpacity
              key={m.key}
              onPress={() => router.push(m.href)}
              className={`flex-row items-center rounded-xl ${badgeBg} px-2 py-2 mb-2`}
            >
              <m.Icon size={18} color={color} />
              {!collapsed && (
                <Text className={`ml-2 text-xs font-semibold ${isActive ? "text-amber-200" : "text-slate-400"}`}>
                  {m.label}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          onPress={toggleEditMode}
          className={`flex-row items-center rounded-xl border px-2 py-2 ${
            editMode ? "bg-amber-500/20 border-amber-400/30" : "bg-slate-800 border-slate-700"
          }`}
        >
          <Pencil size={16} color={editMode ? "#fde68a" : "#cbd5e1"} />
          {!collapsed && (
            <Text className={`ml-2 text-xs font-semibold ${editMode ? "text-amber-200" : "text-slate-300"}`}>
              {editMode ? "Editar ON" : "Editar OFF"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

