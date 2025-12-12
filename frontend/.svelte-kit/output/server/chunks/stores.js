import { w as writable } from "./index.js";
const API_URL = "http://localhost:3000/api";
class APIClient {
  constructor() {
    this.token = this.getToken();
  }
  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }
  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }
  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }
  async request(endpoint, options = {}) {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...isFormData ? {} : { "Content-Type": "application/json" },
      ...options.headers
    };
    const currentToken = this.getToken();
    if (currentToken) {
      headers["Authorization"] = `Bearer ${currentToken}`;
    }
    const url = `${API_URL}${endpoint}`;
    const config = {
      ...options,
      // Si es FormData, enviamos tal cual; de lo contrario serializamos JSON cuando corresponde.
      body: !isFormData && options.body && typeof options.body === "object" && !(options.body instanceof String) ? JSON.stringify(options.body) : options.body,
      headers
    };
    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        const error = await response.json();
        if (response.status === 401) {
          console.warn("🚫 Error 401: Token inválido o expirado");
          this.clearToken();
          if (typeof document !== "undefined") {
            document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
          }
        }
        throw new Error(error.error || `HTTP ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
  }
  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }
  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify(data)
    });
  }
  put(endpoint, data) {
    return this.request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data)
    });
  }
  patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(data)
    });
  }
  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}
const api = new APIClient();
const authService = {
  async login(correo, contraseña) {
    return api.post("/login", { correo, contraseña });
  },
  async logout() {
    api.clearToken();
    if (typeof document !== "undefined") {
      document.cookie = "auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
    return { mensaje: "Sesión cerrada" };
  },
  async me() {
    return api.get("/me");
  },
  async actualizarPerfil(datos) {
    return api.put("/me", datos);
  },
  setToken(token) {
    api.setToken(token);
  },
  getToken() {
    return api.getToken();
  },
  isAuthenticated() {
    return !!api.getToken();
  }
};
const auth = writable({
  token: authService.getToken(),
  usuario: null,
  nombre_rol: null,
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  loggingOut: false,
  error: null
});
const usuarios = writable({
  items: [],
  loading: false,
  error: null
});
const vehiculos = writable({
  items: [],
  loading: false,
  error: null
});
const conductores = writable({
  items: [],
  loading: false,
  error: null
});
const trayectos = writable({
  items: [],
  loading: false,
  error: null
});
const asignaciones = writable({
  items: [],
  loading: false,
  error: null
});
const clientes = writable({
  items: [],
  loading: false,
  error: null
});
const roles = writable({
  items: [],
  loading: false,
  error: null
});
const notificaciones = writable([]);
const addNotificacion = (mensaje, tipo = "info", duracion = 3e3) => {
  const id = Date.now();
  const notificacion = { id, mensaje, tipo };
  notificaciones.update((items) => [...items, notificacion]);
  if (duracion > 0) {
    setTimeout(() => {
      notificaciones.update((items) => items.filter((n) => n.id !== id));
    }, duracion);
  }
  return id;
};
export {
  auth as a,
  authService as b,
  asignaciones as c,
  clientes as d,
  conductores as e,
  addNotificacion as f,
  notificaciones as n,
  roles as r,
  trayectos as t,
  usuarios as u,
  vehiculos as v
};
