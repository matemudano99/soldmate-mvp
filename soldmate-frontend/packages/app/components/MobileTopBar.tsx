import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, Bell, Search, Sparkles } from "lucide-react-native";

type MobileTopBarProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showProgress?: boolean;
  progressText?: string;
};

export function MobileTopBar({
  title,
  subtitle,
  onBack,
  showProgress = false,
  progressText = "70% completado hoy",
}: MobileTopBarProps) {
  return (
    <View className="px-4 pt-14 pb-4 border-b border-slate-800 bg-slate-950">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          {onBack ? (
            <TouchableOpacity onPress={onBack} className="bg-slate-800 rounded-xl p-2.5">
              <ArrowLeft size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : (
            <View className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 items-center justify-center">
              <Sparkles size={16} color="#fbbf24" />
            </View>
          )}

          <View>
            <Text className="text-white text-xl font-bold">{title}</Text>
            {!!subtitle && <Text className="text-slate-400 text-xs mt-0.5">{subtitle}</Text>}
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center">
            <Bell size={16} color="#cbd5e1" />
          </TouchableOpacity>
          <TouchableOpacity className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 items-center justify-center">
            <Search size={16} color="#cbd5e1" />
          </TouchableOpacity>
          <View className="w-9 h-9 rounded-xl bg-rose-500 items-center justify-center border border-rose-400">
            <Text className="text-white text-xs font-bold">LM</Text>
          </View>
        </View>
      </View>

      {showProgress && (
        <View className="mt-3 self-start rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5">
          <Text className="text-emerald-300 text-xs font-medium">{progressText}</Text>
        </View>
      )}
    </View>
  );
}
