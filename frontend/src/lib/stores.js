import { writable } from 'svelte/store';
import { authService } from './api/services.js';

/**
 * Store de Autenticación
 */
export const auth = writable({
  token: authService.getToken(),
  usuario: null,
  nombre_rol: null,
  isAuthenticated: authService.isAuthenticated(),
  loading: false,
  loggingOut: false,
  error: null,
});

export const login = async (correo, contraseña) => {
  auth.update((state) => ({ ...state, loading: true, error: null }));
  try {
    const result = await authService.login(correo, contraseña);
    authService.setToken(result.token);
    auth.update((state) => ({
      ...state,
      token: result.token,
      usuario: result.usuario || null,
      nombre_rol: result.usuario?.nombre_rol || null,
      isAuthenticated: true,
      loading: false,
    }));
    return result;
  } catch (error) {
    auth.update((state) => ({
      ...state,
      error: error.message,
      loading: false,
    }));
    throw error;
  }
};

export const logout = () => {
  // Marcar inmediatamente que se está cerrando sesión
  auth.update((state) => ({
    ...state,
    loggingOut: true,
  }));

  authService.logout();

  // Eliminar la cookie auth_token si existe
  if (typeof document !== 'undefined') {
    document.cookie = 'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  auth.update((state) => ({
    ...state,
    token: null,
    usuario: null,
    nombre_rol: null,
    isAuthenticated: false,
    loggingOut: false,
  }));
};

export const setAuthUsuario = (usuario) => {
  auth.update((state) => ({
    ...state,
    usuario: usuario || null,
    nombre_rol: usuario?.nombre_rol || null,
  }));
};

/**
 * Store de Usuarios
 */
export const usuarios = writable({
  items: [],
  loading: false,
  error: null,
});

/**
 * Store de Vehículos
 */
export const vehiculos = writable({
  items: [],
  loading: false,
  error: null,
});

/**
 * Store de Conductores
 */
export const conductores = writable({
  items: [],
  loading: false,
  error: null,
});

/**
 * Store de Trayectos
 */
export const trayectos = writable({
  items: [],
  loading: false,
  error: null,
});

/**
 * Store de Asignaciones
 */
export const asignaciones = writable({
  items: [],
  loading: false,
  error: null,
});

/**
 * Store de Roles
 */
export const roles = writable({
  items: [],
  loading: false,
  error: null,
});

/**
 * Store de Notificaciones
 */
export const notificaciones = writable([]);

export const addNotificacion = (mensaje, tipo = 'info', duracion = 3000) => {
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

export const removeNotificacion = (id) => {
  notificaciones.update((items) => items.filter((n) => n.id !== id));
};
