// packages/app/lib/api.ts
//
// Esta librería centraliza TODAS las llamadas al backend.
// Así, si la URL cambia, solo lo cambias en un lugar.
//
// Usamos fetch nativo (funciona tanto en React Native como en Next.js)
// y guardamos el JWT en un store de Zustand.

// ─── URL del backend ────────────────────────────────────────────────────────
// En desarrollo apunta a tu máquina local.
// En producción cambia esto por tu URL de Render / Railway / etc.
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:28080";

// ─── Tipos que coinciden con los DTOs del backend ───────────────────────────

export interface AuthResponse {
  token: string;
  email: string;
  role: "OWNER" | "STAFF";
  tier: "FREE" | "PREMIUM";
  companyId: number;
  firstName: string | null;
  lastName: string | null;
}

export interface ProductResponse {
  id: number;
  name: string;
  currentStock: number;
  minStock: number;
  unit: "KG" | "L" | "UNIT" | "BOX";
  category: string | null;
  vatRate: number;
  lowStock: boolean; // el backend nos dice si está por debajo del mínimo
}

export interface ProductInput {
  name: string;
  currentStock: number;
  minStock: number;
  unit: "KG" | "L" | "UNIT" | "BOX";
  category?: string | null;
  vatRate?: number | null;
}

export interface IncidentResponse {
  id: number;
  title: string;
  description: string | null;
  photoUrl: string | null;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  createdAt: string; // ISO 8601
  reportedBy?: string | null;
}

export interface RegisterRequest {
  companyName: string;
  taxId: string;
  country: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// ─── Contactos CRM ──────────────────────────────────────────────────────────

export interface ContactResponse {
  id: number;
  fullName: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  role: string | null;
  department: string | null;
  location: string | null;
  progress: number;
  active: boolean;
  notes: string | null;
  joinDate: string | null;
  rating: number;
  projects: string | null;
  createdAt: string | null;
}

export interface ContactInput {
  fullName: string;
  email?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: string | null;
  department?: string | null;
  location?: string | null;
  progress?: number;
  active?: boolean;
  notes?: string | null;
  joinDate?: string | null;
  rating?: number;
  projects?: string | null;
}

export interface ContactStats {
  total: number;
  active: number;
  inactive: number;
  avgProgress: number;
}

// ─── Helper: fetch autenticado ───────────────────────────────────────────────
//
// Esta función envuelve fetch y añade automáticamente el JWT al header.
// Así no tienes que repetir headers en cada llamada.

async function authFetch(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
}

// ─── Manejo de errores ───────────────────────────────────────────────────────
//
// Si el servidor devuelve un error (4xx, 5xx), parseamos el mensaje
// y lanzamos una excepción con ese texto (lo mostraremos en la UI).

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authApi = {
  /** Registra empresa + usuario dueño. Devuelve JWT. */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },

  /** Login con email + contraseña. Devuelve JWT. */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse<AuthResponse>(res);
  },

  me: async (token: string): Promise<AuthResponse> => {
    const res = await authFetch("/api/v1/auth/me", token);
    return handleResponse<AuthResponse>(res);
  },

  updateProfile: async (
    token: string,
    data: { firstName: string; lastName: string }
  ): Promise<AuthResponse> => {
    const res = await authFetch("/api/v1/auth/profile", token, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return handleResponse<AuthResponse>(res);
  },
};

// ─── Inventario ──────────────────────────────────────────────────────────────

export const inventoryApi = {
  /** Lista todos los productos de la empresa. */
  getAll: async (token: string): Promise<ProductResponse[]> => {
    const res = await authFetch("/api/v1/inventory", token);
    return handleResponse<ProductResponse[]>(res);
  },

  /** Actualiza el stock de un producto.
   *  quantity positivo = entrada de mercancía
   *  quantity negativo = consumo / merma
   */
  updateStock: async (
    token: string,
    productId: number,
    quantity: number
  ): Promise<ProductResponse> => {
    const res = await authFetch(
      `/api/v1/inventory/${productId}/stock?quantity=${quantity}`,
      token,
      { method: "PATCH" }
    );
    return handleResponse<ProductResponse>(res);
  },

  create: async (token: string, data: ProductInput): Promise<ProductResponse> => {
    const res = await authFetch("/api/v1/inventory", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<ProductResponse>(res);
  },

  update: async (token: string, productId: number, data: ProductInput): Promise<ProductResponse> => {
    const res = await authFetch(`/api/v1/inventory/${productId}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return handleResponse<ProductResponse>(res);
  },

  remove: async (token: string, productId: number): Promise<void> => {
    const res = await authFetch(`/api/v1/inventory/${productId}`, token, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      throw new Error(text || `Error ${res.status}`);
    }
  },
};

// ─── Contactos CRM ───────────────────────────────────────────────────────────

export const contactsApi = {
  getAll: async (token: string): Promise<ContactResponse[]> => {
    const res = await authFetch("/api/v1/contacts", token);
    return handleResponse<ContactResponse[]>(res);
  },

  getStats: async (token: string): Promise<ContactStats> => {
    const res = await authFetch("/api/v1/contacts/stats", token);
    return handleResponse<ContactStats>(res);
  },

  getOne: async (token: string, id: number): Promise<ContactResponse> => {
    const res = await authFetch(`/api/v1/contacts/${id}`, token);
    return handleResponse<ContactResponse>(res);
  },

  create: async (token: string, data: ContactInput): Promise<ContactResponse> => {
    const res = await authFetch("/api/v1/contacts", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<ContactResponse>(res);
  },

  update: async (token: string, id: number, data: ContactInput): Promise<ContactResponse> => {
    const res = await authFetch(`/api/v1/contacts/${id}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return handleResponse<ContactResponse>(res);
  },

  toggleActive: async (token: string, id: number): Promise<ContactResponse> => {
    const res = await authFetch(`/api/v1/contacts/${id}/active`, token, { method: "PATCH" });
    return handleResponse<ContactResponse>(res);
  },

  remove: async (token: string, id: number): Promise<void> => {
    const res = await authFetch(`/api/v1/contacts/${id}`, token, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      throw new Error(text || `Error ${res.status}`);
    }
  },
};

// ─── Incidencias ─────────────────────────────────────────────────────────────

export const incidentsApi = {
  /** Lista las incidencias de la empresa. */
  getAll: async (token: string): Promise<IncidentResponse[]> => {
    const res = await authFetch("/api/v1/incidents", token);
    return handleResponse<IncidentResponse[]>(res);
  },

  /** Crea una nueva incidencia (sin foto). */
  create: async (
    token: string,
    data: { title: string; description: string; priority: string }
  ): Promise<IncidentResponse> => {
    const res = await authFetch("/api/v1/incidents", token, {
      method: "POST",
      body: JSON.stringify(data),
    });
    return handleResponse<IncidentResponse>(res);
  },

  /** Crea una incidencia CON foto.
   *  Usamos multipart/form-data para enviar imagen + datos.
   */
  createWithPhoto: async (
    token: string,
    data: { title: string; description: string; priority: string },
    photoUri: string
  ): Promise<IncidentResponse> => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("priority", data.priority);

    // En React Native, un archivo se añade así:
    // @ts-ignore — el tipo de FormData en RN acepta objetos con uri/name/type
    formData.append("photo", {
      uri: photoUri,
      name: "incident.jpg",
      type: "image/jpeg",
    });

    const res = await fetch(`${BASE_URL}/api/v1/incidents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      // NO ponemos Content-Type aquí: fetch lo detecta solo para FormData
      body: formData,
    });
    return handleResponse<IncidentResponse>(res);
  },

  update: async (
    token: string,
    incidentId: number,
    data: { title: string; description: string; priority: string }
  ): Promise<IncidentResponse> => {
    const res = await authFetch(`/api/v1/incidents/${incidentId}`, token, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return handleResponse<IncidentResponse>(res);
  },

  remove: async (token: string, incidentId: number): Promise<void> => {
    const res = await authFetch(`/api/v1/incidents/${incidentId}`, token, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      throw new Error(text || `Error ${res.status}`);
    }
  },
};
