// packages/app/features/dashboard/screen.tsx
//
// PANTALLA DASHBOARD — Soldmate
//
// Esta pantalla se reutiliza en:
//   - Web (Next.js):       apps/next/app/dashboard/page.tsx la importa
//   - Mobile (Expo / RN):  apps/expo/app/(tabs)/index.tsx la importa
//
// Solito nos permite escribir la lógica UNA sola vez.
// NativeWind v4 traduce las clases Tailwind a estilos nativos en RN
// y a CSS normal en Next.js.

import { useEffect, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
  ActivityIndicator,
} from 'react-native'
import { useLink } from 'solito/link'
import { AlertTriangle, Package, Wrench, TrendingDown, Plus } from 'lucide-react-native'

// ─── Tipos ──────────────────────────────────────────────────────────────────

type Product = {
  id: number
  name: string
  currentStock: number
  minStock: number
  unit: string
  category: string
  lowStock: boolean
}

type Incident = {
  id: number
  title: string
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  createdAt: string
}

type DashboardStats = {
  totalProducts: number
  lowStockCount: number
  openIncidents: number
  companyName: string
}

// ─── Hooks ──────────────────────────────────────────────────────────────────

/**
 * useDashboard: hook que centraliza toda la lógica de datos del dashboard.
 *
 * En React, un hook personalizado es una función que empieza por "use"
 * y puede usar otros hooks (useState, useEffect, etc.).
 * Separa la lógica de los datos de la lógica de presentación (la UI).
 */
function useDashboard(token: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])
  const [openIncidents, setOpenIncidents] = useState<Incident[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

  const fetchData = async () => {
    try {
      setError(null)
      const headers = { Authorization: `Bearer ${token}` }

      // Hacemos las dos peticiones en paralelo (más rápido que una tras otra)
      const [inventoryRes, incidentsRes] = await Promise.all([
        fetch(`${API_URL}/api/v1/inventory`, { headers }),
        fetch(`${API_URL}/api/v1/incidents?status=OPEN&limit=5`, { headers }),
      ])

      if (!inventoryRes.ok || !incidentsRes.ok) {
        throw new Error('Error al cargar datos del servidor')
      }

      const products: Product[]  = await inventoryRes.json()
      const incidents: Incident[] = await incidentsRes.json()

      const low = products.filter((p) => p.lowStock)

      setLowStockProducts(low.slice(0, 5))   // máximo 5 en el dashboard
      setOpenIncidents(incidents.slice(0, 5))
      setStats({
        totalProducts: products.length,
        lowStockCount: low.length,
        openIncidents: incidents.length,
        companyName: 'Mi Restaurante',        // TODO: vendrá del JWT / perfil
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [token])

  const onRefresh = () => {
    setRefreshing(true)
    fetchData()
  }

  return { stats, lowStockProducts, openIncidents, loading, refreshing, error, onRefresh }
}

// ─── Componentes pequeños ────────────────────────────────────────────────────

/**
 * StatCard: tarjeta de estadística con icono.
 * Las clases NativeWind son idénticas a Tailwind CSS.
 */
type StatCardProps = {
  label: string
  value: number | string
  icon: React.ReactNode
  accent?: 'amber' | 'red' | 'blue' | 'green'
}

function StatCard({ label, value, icon, accent = 'blue' }: StatCardProps) {
  const accentClasses = {
    amber: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    red:   'bg-red-50   border-red-200   dark:bg-red-950   dark:border-red-800',
    blue:  'bg-blue-50  border-blue-200  dark:bg-blue-950  dark:border-blue-800',
    green: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
  }

  const textClasses = {
    amber: 'text-amber-700 dark:text-amber-300',
    red:   'text-red-700   dark:text-red-300',
    blue:  'text-blue-700  dark:text-blue-300',
    green: 'text-green-700 dark:text-green-300',
  }

  return (
    <View className={`flex-1 rounded-2xl border p-4 ${accentClasses[accent]}`}>
      <View className="mb-2">{icon}</View>
      <Text className={`text-2xl font-bold ${textClasses[accent]}`}>
        {value}
      </Text>
      <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</Text>
    </View>
  )
}

/**
 * SkeletonBox: placeholder animado mientras carga.
 * Simula la forma del contenido real para evitar el "salto" al cargar.
 */
function SkeletonBox({ className }: { className: string }) {
  return (
    <View
      className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700 ${className}`}
    />
  )
}

function DashboardSkeleton() {
  return (
    <View className="px-4 pt-4">
      {/* Cabecera */}
      <SkeletonBox className="mb-1 h-6 w-48" />
      <SkeletonBox className="mb-6 h-4 w-32" />
      {/* Tarjetas de stats */}
      <View className="mb-6 flex-row gap-3">
        <SkeletonBox className="h-24 flex-1 rounded-2xl" />
        <SkeletonBox className="h-24 flex-1 rounded-2xl" />
        <SkeletonBox className="h-24 flex-1 rounded-2xl" />
      </View>
      {/* Lista */}
      {[1, 2, 3].map((i) => (
        <SkeletonBox key={i} className="mb-3 h-16 w-full" />
      ))}
    </View>
  )
}

/**
 * PriorityBadge: pastilla de color según prioridad de la incidencia.
 */
function PriorityBadge({ priority }: { priority: Incident['priority'] }) {
  const styles: Record<Incident['priority'], string> = {
    LOW:      'bg-gray-100   text-gray-600   dark:bg-gray-800 dark:text-gray-300',
    MEDIUM:   'bg-amber-100  text-amber-700  dark:bg-amber-900 dark:text-amber-300',
    HIGH:     'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
    CRITICAL: 'bg-red-100    text-red-700    dark:bg-red-900   dark:text-red-300',
  }
  const labels: Record<Incident['priority'], string> = {
    LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta', CRITICAL: 'Crítica',
  }
  return (
    <View className={`rounded-full px-2 py-0.5 ${styles[priority]}`}>
      <Text className={`text-xs font-medium ${styles[priority]}`}>
        {labels[priority]}
      </Text>
    </View>
  )
}

// ─── Pantalla principal ──────────────────────────────────────────────────────

/**
 * DashboardScreen: pantalla principal de Soldmate.
 *
 * Props:
 *   token → JWT del usuario autenticado (se pasa desde el contexto de auth)
 */
export function DashboardScreen({ token }: { token: string }) {
  const { stats, lowStockProducts, openIncidents, loading, refreshing, error, onRefresh } =
    useDashboard(token)

  // useLink de Solito: navegación que funciona en web y mobile
  const inventoryLink = useLink({ href: '/inventory' })
  const incidentsLink = useLink({ href: '/incidents' })
  const newIncidentLink = useLink({ href: '/incidents/new' })

  // ── Estado de carga ──────────────────────────────────────────────────────
  if (loading) return <DashboardSkeleton />

  // ── Estado de error ──────────────────────────────────────────────────────
  if (error) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <AlertTriangle
          size={48}
          color="#f59e0b"
          className="mb-4"
        />
        <Text className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
          Algo salió mal
        </Text>
        <Text className="mb-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {error}
        </Text>
        <Pressable
          onPress={onRefresh}
          className="rounded-xl bg-blue-600 px-6 py-3 active:opacity-80"
        >
          <Text className="font-semibold text-white">Reintentar</Text>
        </Pressable>
      </View>
    )
  }

  // ── Pantalla normal ──────────────────────────────────────────────────────
  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerClassName="pb-8"
      refreshControl={
        // Pull-to-refresh en móvil; en web simplemente no aparece
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* ── Cabecera ── */}
      <View className="bg-white px-4 pb-4 pt-6 shadow-sm dark:bg-gray-900">
        <Text className="text-xs font-medium uppercase tracking-widest text-blue-500">
          Soldmate ERP
        </Text>
        <Text className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-gray-100">
          {stats?.companyName ?? 'Dashboard'}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          Resumen de hoy
        </Text>
      </View>

      <View className="px-4 pt-5">

        {/* ── Tarjetas de estadísticas ── */}
        <View className="mb-6 flex-row gap-3">
          <StatCard
            label="Productos"
            value={stats?.totalProducts ?? 0}
            accent="blue"
            icon={<Package size={20} color="#3b82f6" />}
          />
          <StatCard
            label="Stock bajo"
            value={stats?.lowStockCount ?? 0}
            accent={stats?.lowStockCount ? 'amber' : 'green'}
            icon={<TrendingDown size={20} color={stats?.lowStockCount ? '#f59e0b' : '#22c55e'} />}
          />
          <StatCard
            label="Incidencias"
            value={stats?.openIncidents ?? 0}
            accent={stats?.openIncidents ? 'red' : 'green'}
            icon={<Wrench size={20} color={stats?.openIncidents ? '#ef4444' : '#22c55e'} />}
          />
        </View>

        {/* ── Sección: Stock bajo ── */}
        <View className="mb-6">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Alertas de stock
            </Text>
            <Pressable {...inventoryLink} className="active:opacity-70">
              <Text className="text-sm text-blue-500">Ver todo →</Text>
            </Pressable>
          </View>

          {lowStockProducts.length === 0 ? (
            // Estado vacío: buen feedback cuando no hay alertas
            <View className="items-center rounded-2xl bg-green-50 py-6 dark:bg-green-950">
              <Text className="text-2xl">✅</Text>
              <Text className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
                Todo el stock está al día
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {lowStockProducts.map((product) => (
                <View
                  key={product.id}
                  className="flex-row items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-gray-900"
                >
                  <View className="flex-1">
                    <Text
                      className="font-medium text-gray-900 dark:text-gray-100"
                      numberOfLines={1}
                    >
                      {product.name}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {product.category}
                    </Text>
                  </View>
                  {/* Indicador de stock actual vs mínimo */}
                  <View className="items-end">
                    <Text className="font-bold text-red-500">
                      {product.currentStock} {product.unit.toLowerCase()}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      mín: {product.minStock}
                    </Text>
                  </View>
                  {/* Barra visual de stock */}
                  <View className="ml-3 h-8 w-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <View
                      className="w-full rounded-full bg-red-400"
                      style={{
                        height: `${Math.min(
                          100,
                          (product.currentStock / product.minStock) * 100
                        )}%`,
                      }}
                    />
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Sección: Incidencias abiertas ── */}
        <View className="mb-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-base font-semibold text-gray-900 dark:text-gray-100">
              Incidencias abiertas
            </Text>
            <Pressable {...incidentsLink} className="active:opacity-70">
              <Text className="text-sm text-blue-500">Ver todo →</Text>
            </Pressable>
          </View>

          {openIncidents.length === 0 ? (
            <View className="items-center rounded-2xl bg-green-50 py-6 dark:bg-green-950">
              <Text className="text-2xl">🎉</Text>
              <Text className="mt-2 text-sm font-medium text-green-700 dark:text-green-300">
                Sin incidencias abiertas
              </Text>
            </View>
          ) : (
            <View className="gap-2">
              {openIncidents.map((incident) => (
                <View
                  key={incident.id}
                  className="flex-row items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-gray-900"
                >
                  {/* Dot de estado */}
                  <View
                    className={`h-2.5 w-2.5 rounded-full ${
                      incident.status === 'IN_PROGRESS'
                        ? 'bg-amber-400'
                        : 'bg-red-400'
                    }`}
                  />
                  <View className="flex-1">
                    <Text
                      className="font-medium text-gray-900 dark:text-gray-100"
                      numberOfLines={1}
                    >
                      {incident.title}
                    </Text>
                    <Text className="text-xs text-gray-400">
                      {new Date(incident.createdAt).toLocaleDateString('es-ES')}
                    </Text>
                  </View>
                  <PriorityBadge priority={incident.priority} />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── Botón de acción rápida (para el camarero en móvil) ── */}
        <Pressable
          {...newIncidentLink}
          className="mt-2 flex-row items-center justify-center gap-2 rounded-2xl bg-blue-600 py-4 active:bg-blue-700 active:opacity-90"
        >
          <Plus size={20} color="white" />
          <Text className="font-semibold text-white">Reportar incidencia</Text>
        </Pressable>

      </View>
    </ScrollView>
  )
}
