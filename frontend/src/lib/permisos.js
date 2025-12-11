import { get } from 'svelte/store';
import { auth } from './stores.js';
import { puedeVerModulo as configPuedeVerModulo, puedeAccionModulo } from './modulos.js';

/**
 * Helper para validar permisos según el rol del usuario
 * 
 * Reglas del proyecto TransConecta:
 * - ADMINISTRADOR: Acceso total
 * - COORDINADOR: Puede crear pero no editar/eliminar
 * - HSEQ: Solo registrar horas de conducción
 */

/**
 * Obtiene el rol actual del usuario
 * @returns {string|null}
 */
export function getRolActual() {
  const authState = get(auth);
  return authState?.usuario?.nombre_rol?.toUpperCase() || null;
}

/**
 * Verifica si el usuario es Administrador
 * @returns {boolean}
 */
export function esAdministrador() {
  return getRolActual() === 'ADMINISTRADOR';
}

/**
 * Verifica si el usuario es Coordinador
 * @returns {boolean}
 */
export function esCoordinador() {
  return getRolActual() === 'COORDINADOR';
}

/**
 * Verifica si el usuario es HSEQ
 * @returns {boolean}
 */
export function esHSEQ() {
  return getRolActual() === 'HSEQ';
}

/**
 * Verifica si el usuario puede crear registros
 * ADMINISTRADOR y COORDINADOR pueden crear
 * @returns {boolean}
 */
export function puedeCrear(modulo) {
  if (modulo) return puedeAccion(modulo, 'crear');
  const rol = getRolActual();
  return rol === 'ADMINISTRADOR' || rol === 'COORDINADOR';
}

/**
 * Verifica si el usuario puede editar registros
 * Solo ADMINISTRADOR puede editar
 * @returns {boolean}
 */
export function puedeEditar(modulo) {
  if (modulo) return puedeAccion(modulo, 'editar');
  return esAdministrador();
}

/**
 * Verifica si el usuario puede eliminar registros
 * Solo ADMINISTRADOR puede eliminar
 * @returns {boolean}
 */
export function puedeEliminar(modulo) {
  if (modulo) return puedeAccion(modulo, 'eliminar');
  return esAdministrador();
}

/**
 * Verifica si el usuario puede desactivar/activar registros
 * Solo ADMINISTRADOR puede cambiar estados
 * @returns {boolean}
 */
export function puedeCambiarEstado(modulo) {
  if (modulo) return puedeAccion(modulo, 'desactivar');
  return esAdministrador();
}

// Permisos basados en configuración de módulos
export function puedeVerModulo(modulo) {
  const rol = getRolActual();
  if (!rol) return false;
  return configPuedeVerModulo(modulo, rol);
}

export function puedeAccion(modulo, accion) {
  const rol = getRolActual();
  if (!rol) return false;
  return puedeAccionModulo(modulo, accion, rol);
}

/**
 * Verifica si el usuario tiene acceso a usuarios
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoUsuarios() {
  return puedeVerModulo('usuarios');
}

/**
 * Verifica si el usuario tiene acceso a vehículos
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoVehiculos() {
  return puedeVerModulo('vehiculos');
}

/**
 * Verifica si el usuario tiene acceso a conductores
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoConductores() {
  return puedeVerModulo('conductores');
}

/**
 * Verifica si el usuario tiene acceso a trayectos
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoTrayectos() {
  return puedeVerModulo('trayectos');
}

/**
 * Verifica si el usuario tiene acceso a asignaciones
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoAsignaciones() {
  return puedeVerModulo('asignaciones');
}

/**
 * Verifica si el usuario tiene acceso a roles
 * Solo ADMINISTRADOR
 * @returns {boolean}
 */
export function tieneAccesoRoles() {
  return puedeVerModulo('roles');
}

/**
 * Verifica si el usuario tiene acceso a clientes
 * Solo ADMINISTRADOR
 * @returns {boolean}
 */
export function tieneAccesoClientes() {
  return puedeVerModulo('clientes');
}

/**
 * Verifica si el usuario puede registrar horas de conducción
 * HSEQ y ADMINISTRADOR pueden registrar horas
 * @returns {boolean}
 */
export function puedeRegistrarHoras() {
  return puedeVerModulo('registroHoras');
}

/**
 * Obtiene las opciones de menú disponibles según el rol
 * @returns {Array}
 */
export function getOpcionesMenu() {
  const rol = getRolActual();

  const menuCompleto = [
    { path: '/', label: 'Dashboard', icon: 'home', modulo: 'dashboard' },
    { path: '/usuarios', label: 'Usuarios', icon: 'users', modulo: 'usuarios' },
    { path: '/clientes', label: 'Clientes', icon: 'person', modulo: 'clientes' },
    { path: '/vehiculos', label: 'Vehículos', icon: 'truck', modulo: 'vehiculos' },
    { path: '/conductores', label: 'Conductores', icon: 'user', modulo: 'conductores' },
    { path: '/trayectos', label: 'Trayectos', icon: 'route', modulo: 'trayectos' },
    { path: '/asignaciones', label: 'Asignaciones', icon: 'calendar', modulo: 'asignaciones' },
    { path: '/roles', label: 'Roles', icon: 'shield', modulo: 'roles' },
    { path: '/operaciones/horas', label: 'Registro de Horas', icon: 'clock', modulo: 'registroHoras' },
  ];

  return menuCompleto.filter((opcion) => puedeVerModulo(opcion.modulo));
}

/**
 * Mensaje de error personalizado según el rol
 * @returns {string}
 */
export function getMensajePermisosDenegados() {
  const rol = getRolActual();
  
  if (rol === 'COORDINADOR') {
    return 'Los coordinadores solo pueden crear registros, no modificarlos ni eliminarlos.';
  }
  
  if (rol === 'HSEQ') {
    return 'El rol HSEQ solo tiene acceso al registro de horas de conducción.';
  }
  
  return 'No tienes permisos para realizar esta acción.';
}

export default {
  getRolActual,
  esAdministrador,
  esCoordinador,
  esHSEQ,
  puedeVerModulo,
  puedeAccion,
  puedeCrear,
  puedeEditar,
  puedeEliminar,
  puedeCambiarEstado,
  tieneAccesoUsuarios,
  tieneAccesoVehiculos,
  tieneAccesoConductores,
  tieneAccesoTrayectos,
  tieneAccesoAsignaciones,
  tieneAccesoRoles,
  tieneAccesoClientes,
  puedeRegistrarHoras,
  getOpcionesMenu,
  getMensajePermisosDenegados
};
