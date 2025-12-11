import { writable, get } from 'svelte/store';
import { moduloService } from './api/services.js';

export const MODULOS = [
  'dashboard',
  'usuarios',
  'clientes',
  'roles',
  'vehiculos',
  'conductores',
  'trayectos',
  'asignaciones',
  'registroHoras'
];

export const ACCIONES = ['ver', 'crear', 'editar', 'eliminar', 'desactivar'];

const defaultConfig = {
  ADMINISTRADOR: Object.fromEntries(
    MODULOS.map((m) => [m, { sidebar: true, acciones: Object.fromEntries(ACCIONES.map((a) => [a, true])) }])
  ),
  COORDINADOR: {
    dashboard: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } },
    usuarios: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } },
    clientes: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    roles: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    vehiculos: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } },
    conductores: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } },
    trayectos: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } },
    asignaciones: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } },
    registroHoras: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } }
  },
  HSEQ: {
    dashboard: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    usuarios: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    clientes: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    roles: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    vehiculos: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    conductores: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    trayectos: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    asignaciones: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    registroHoras: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } }
  }
};

function normalizeModuloConfig(moduloConfig = {}) {
  const acciones = moduloConfig.acciones || {};
  return {
    sidebar: moduloConfig.sidebar === true,
    acciones: Object.fromEntries(ACCIONES.map((a) => [a, acciones[a] === true]))
  };
}

function mergeDefaults(rol, configRol = {}) {
  const base = defaultConfig[rol] || {};
  return Object.fromEntries(
    MODULOS.map((modulo) => {
      const cfg = configRol[modulo] || base[modulo] || { sidebar: false, acciones: {} };
      return [modulo, normalizeModuloConfig(cfg)];
    })
  );
}

function normalizeConfig(config = {}) {
  const roles = Object.keys({ ...defaultConfig, ...config });
  return Object.fromEntries(
    roles.map((rol) => {
      const rolUpper = rol.toUpperCase();
      return [rolUpper, mergeDefaults(rolUpper, config[rol] || {})];
    })
  );
}

export const modulosConfig = writable(normalizeConfig(defaultConfig));
export const modulosCargando = writable(false);

export async function cargarConfigModulos() {
  modulosCargando.set(true);
  try {
    const res = await moduloService.listar();
    const normalizada = normalizeConfig(res.config || {});
    modulosConfig.set(normalizada);
    return normalizada;
  } catch (error) {
    console.warn('No se pudo obtener configuración de módulos, usando defaults:', error);
    modulosConfig.set(normalizeConfig(defaultConfig));
    return get(modulosConfig);
  } finally {
    modulosCargando.set(false);
  }
}

export async function cargarConfigRol(rol) {
  const rolUpper = (rol || '').toUpperCase();
  if (!rolUpper) return null;

  modulosCargando.set(true);
  try {
    const res = await moduloService.obtenerPorRol(rolUpper);
    const normalizada = normalizeConfig({ [rolUpper]: res.permisos || {} });
    modulosConfig.update((cfg) => ({ ...cfg, ...normalizada }));
    return normalizada[rolUpper];
  } catch (error) {
    console.warn(`No se pudo obtener permisos para el rol ${rolUpper}`, error);
    throw error;
  } finally {
    modulosCargando.set(false);
  }
}

export async function guardarConfigRol(rol, nuevo) {
  const rolUpper = (rol || '').toUpperCase();
  if (!rolUpper) throw new Error('Rol requerido');
  const payload = mergeDefaults(rolUpper, nuevo || {});
  modulosConfig.update((cfg) => ({ ...cfg, [rolUpper]: payload }));
  await moduloService.actualizarRol(rolUpper, payload);
  return payload;
}

export async function resetConfigBackend() {
  modulosCargando.set(true);
  try {
    const res = await moduloService.reset();
    const normalizada = normalizeConfig(res.config || {});
    modulosConfig.set(normalizada);
    return normalizada;
  } catch (error) {
    modulosConfig.set(normalizeConfig(defaultConfig));
    throw error;
  } finally {
    modulosCargando.set(false);
  }
}

export function getConfigForRol(rol) {
  const cfg = get(modulosConfig);
  return cfg?.[(rol || '').toUpperCase()] || mergeDefaults((rol || '').toUpperCase(), {});
}

export function puedeVerModulo(modulo, rol) {
  const role = (rol || '').toUpperCase();
  const cfgRol = getConfigForRol(role);
  const moduloCfg = cfgRol?.[modulo];
  return moduloCfg?.sidebar === true;
}

export function puedeAccionModulo(modulo, accion, rol) {
  const role = (rol || '').toUpperCase();
  const cfgRol = getConfigForRol(role);
  const moduloCfg = cfgRol?.[modulo];
  if (!moduloCfg) return false;
  return moduloCfg.acciones?.[accion] === true;
}

export function getDefaultConfig() {
  return defaultConfig;
}
