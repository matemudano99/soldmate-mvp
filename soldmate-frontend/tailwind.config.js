// tailwind.config.js
//
// Configuración de Tailwind CSS para Soldmate.
// NativeWind v4 usa este mismo archivo en web y mobile.
//
// La paleta de Soldmate: oscura (slate), con acento cálido (amber).
// Inspiración: estética de cocina profesional — hierro, luz cálida, acero.

const { hairlineWidth } = require("nativewind/theme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  // content: le dice a Tailwind qué archivos escanear para eliminar
  // las clases CSS que no se usan (tree-shaking de CSS)
  content: {
    relative: true,
    files: [
      "./apps/**/*.{js,ts,jsx,tsx}",
      "./packages/app/**/*.{js,ts,jsx,tsx}",
    ],
  },

  presets: [
    // Preset de NativeWind: añade soporte para clases de React Native
    require("nativewind/preset")
  ],

  theme: {
    extend: {
      // ── Colores personalizados de la marca Soldmate ──
      colors: {
        brand: {
          50:  "#fffbeb",
          100: "#fef3c7",
          400: "#fbbf24",
          500: "#f59e0b",  // color principal de la marca
          600: "#d97706",
          700: "#b45309",
          900: "#78350f",
        },
        // Paleta pastel derivada del turquesa (para UI tipo glassmorphism)
        turq: {
          50:  "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#134e4a",
        },
      },

      // ── Fuentes ──
      fontFamily: {
        display: ["Syne", "system-ui", "sans-serif"],  // títulos
        mono:    ["DM Mono", "monospace"],             // valores numéricos (stock, precios)
        sans:    ["Syne", "system-ui", "sans-serif"],
      },

      // ── Bordes hairline para React Native ──
      // En React Native, 1px puede verse muy grueso en pantallas de alta densidad
      borderWidth: {
        hairline: hairlineWidth(),
      },
    },
  },

  plugins: [],
};
