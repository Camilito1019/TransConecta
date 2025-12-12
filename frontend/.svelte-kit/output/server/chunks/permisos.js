import { w as writable, g as get } from "./index.js";
import { a as auth } from "./stores.js";
const MODULOS = [
  "dashboard",
  "usuarios",
  "clientes",
  "roles",
  "modulos",
  "vehiculos",
  "conductores",
  "trayectos",
  "asignaciones",
  "registroHoras"
];
const ACCIONES = ["ver", "crear", "editar", "eliminar", "desactivar"];
const defaultConfig = {
  ADMINISTRADOR: Object.fromEntries(
    MODULOS.map((m) => [m, { sidebar: true, acciones: Object.fromEntries(ACCIONES.map((a) => [a, true])) }])
  ),
  COORDINADOR: {
    dashboard: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } },
    usuarios: { sidebar: true, acciones: { ver: true, crear: true, editar: false, eliminar: false, desactivar: false } },
    clientes: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    roles: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
    modulos: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
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
    modulos: { sidebar: false, acciones: { ver: false, crear: false, editar: false, eliminar: false, desactivar: false } },
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
const modulosConfig = writable(normalizeConfig(defaultConfig));
const modulosCargando = writable(false);
function getConfigForRol(rol) {
  const cfg = get(modulosConfig);
  return cfg?.[(rol || "").toUpperCase()] || mergeDefaults((rol || "").toUpperCase(), {});
}
function puedeAccionModulo(modulo, accion, rol) {
  const role = (rol || "").toUpperCase();
  const cfgRol = getConfigForRol(role);
  const moduloCfg = cfgRol?.[modulo];
  if (!moduloCfg) return false;
  return moduloCfg.acciones?.[accion] === true;
}
function getRolActual() {
  const authState = get(auth);
  return authState?.usuario?.nombre_rol?.toUpperCase() || null;
}
function esAdministrador() {
  return getRolActual() === "ADMINISTRADOR";
}
function puedeCrear(modulo) {
  if (modulo) return puedeAccion(modulo, "crear");
  const rol = getRolActual();
  return rol === "ADMINISTRADOR" || rol === "COORDINADOR";
}
function puedeEditar(modulo) {
  if (modulo) return puedeAccion(modulo, "editar");
  return esAdministrador();
}
function puedeEliminar(modulo) {
  if (modulo) return puedeAccion(modulo, "eliminar");
  return esAdministrador();
}
function puedeCambiarEstado(modulo) {
  if (modulo) return puedeAccion(modulo, "desactivar");
  return esAdministrador();
}
function puedeAccion(modulo, accion) {
  const rol = getRolActual();
  if (!rol) return false;
  return puedeAccionModulo(modulo, accion, rol);
}
export {
  MODULOS as M,
  puedeCrear as a,
  puedeEditar as b,
  puedeEliminar as c,
  puedeCambiarEstado as d,
  modulosCargando as e,
  getRolActual as g,
  modulosConfig as m,
  puedeAccion as p
};
