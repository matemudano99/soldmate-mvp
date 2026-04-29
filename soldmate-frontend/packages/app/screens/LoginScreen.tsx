// packages/app/screens/LoginScreen.tsx
//
// Pantalla de inicio de sesión.
// Esta pantalla se usa tanto en la web (Next.js) como en el móvil (Expo)
// gracias a Solito: el mismo código, dos plataformas.
//
// Flujo:
//   1. Usuario introduce email + contraseña
//   2. Se llama al backend: POST /api/v1/auth/login
//   3. Si ok → guardamos el JWT en Zustand → navegamos al Dashboard
//   4. Si error → mostramos mensaje de error

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "../lib/router";
import { authApi } from "../lib/api";
import { useAuthStore } from "../lib/store";
import { Input, Button } from "../components/ui";

export function LoginScreen() {
  const router = useRouter();
  const login  = useAuthStore((state) => state.login);

  // Estado del formulario
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  // Validación básica en el cliente antes de llamar al backend
  const validate = (): boolean => {
    if (!email.includes("@")) {
      setError("Introduce un email válido");
      return false;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      // Llamada al backend
      const data = await authApi.login(email.trim().toLowerCase(), password);

      // Guardamos los datos en el store global de Zustand
      login(data);

      // Navegamos al dashboard
      router.push("/dashboard");
    } catch (err: any) {
      // El backend devuelve el mensaje de error como texto plano
      setError(err.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView: evita que el teclado tape los inputs en mobile
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-slate-950"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center"
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-6 py-12 max-w-md w-full mx-auto gap-8">

          {/* ── Logo y título ── */}
          <View className="items-center gap-2">
            <View className="w-16 h-16 bg-amber-500 rounded-2xl items-center justify-center mb-2">
              <Text className="text-3xl">🍽️</Text>
            </View>
            <Text className="text-white text-3xl font-bold tracking-tight">
              Soldmate
            </Text>
            <Text className="text-slate-400 text-sm text-center">
              ERP para hostelería · Inicia sesión
            </Text>
          </View>

          {/* ── Formulario ── */}
          <View className="gap-4">
            <Input
              label="Email"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(null); }}
              placeholder="admin@mirestaurante.com"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <Input
              label="Contraseña"
              value={password}
              onChangeText={(t) => { setPassword(t); setError(null); }}
              placeholder="••••••••"
              secureTextEntry
            />

            {/* Mensaje de error global del formulario */}
            {error && (
              <View className="bg-red-950 border border-red-800 rounded-xl px-4 py-3">
                <Text className="text-red-400 text-sm">{error}</Text>
              </View>
            )}

            <Button onPress={handleLogin} loading={loading}>
              Iniciar sesión
            </Button>
          </View>

          {/* ── Enlace a registro ── */}
          <View className="flex-row items-center justify-center gap-1">
            <Text className="text-slate-400 text-sm">¿Sin cuenta?</Text>
            <TouchableOpacity onPress={() => router.push("/register")}>
              <Text className="text-amber-400 text-sm font-semibold">
                Registra tu negocio
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
