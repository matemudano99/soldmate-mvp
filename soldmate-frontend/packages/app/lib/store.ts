// packages/app/lib/store.ts
//
// Zustand es una librería de estado global muy sencilla.
// Piénsala como una "caja" donde guardas datos que necesitas
// en muchos componentes (el JWT, el rol del usuario, etc.)
//
// Ventaja sobre useState: no necesitas pasar props entre componentes.
// Cualquier componente puede leer y escribir en el store directamente.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthResponse } from "./api";

// ─── Tipos del estado ────────────────────────────────────────────────────────

interface AuthState {
  // Datos del usuario autenticado (null si no ha iniciado sesión)
  token: string | null;
  email: string | null;
  role: "OWNER" | "STAFF" | null;
  tier: "FREE" | "PREMIUM" | null;

  // ¿El usuario está autenticado?
  isAuthenticated: boolean;
  // Modo edición global para módulos ERP (toggle desde navbar)
  editMode: boolean;

  // Acciones (funciones que modifican el estado)
  login: (data: AuthResponse) => void;
  logout: () => void;
  toggleEditMode: () => void;
  setEditMode: (value: boolean) => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
  // Estado inicial: no hay usuario autenticado
  token: null,
  email: null,
  role: null,
  tier: null,
  isAuthenticated: false,
  editMode: false,

  // Acción login: guarda los datos del usuario tras el login/registro
  login: (data: AuthResponse) =>
    set({
      token: data.token,
      email: data.email,
      role: data.role,
      tier: data.tier,
      isAuthenticated: true,
      editMode: false,
    }),

  // Acción logout: limpia todos los datos del usuario
  logout: () =>
    set({
      token: null,
      email: null,
      role: null,
      tier: null,
      isAuthenticated: false,
      editMode: false,
    }),
  toggleEditMode: () =>
    set((s) => ({
      editMode: !s.editMode,
    })),
  setEditMode: (value: boolean) =>
    set({
      editMode: value,
    }),
    }),
    {
      name: "soldmate-auth",
    }
  )
);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Comprueba si el usuario tiene rol OWNER (dueño del negocio) */
export const isOwner = (role: string | null) => role === "OWNER";

/** Comprueba si el usuario tiene plan PREMIUM */
export const isPremium = (tier: string | null) => tier === "PREMIUM";
