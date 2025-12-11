import { get } from 'svelte/store';
import { auth } from './stores.js';

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
export function puedeCrear() {
  const rol = getRolActual();
  return rol === 'ADMINISTRADOR' || rol === 'COORDINADOR';
}

/**
 * Verifica si el usuario puede editar registros
 * Solo ADMINISTRADOR puede editar
 * @returns {boolean}
 */
export function puedeEditar() {
  return esAdministrador();
}

/**
 * Verifica si el usuario puede eliminar registros
 * Solo ADMINISTRADOR puede eliminar
 * @returns {boolean}
 */
export function puedeEliminar() {
  return esAdministrador();
}

/**
 * Verifica si el usuario puede desactivar/activar registros
 * Solo ADMINISTRADOR puede cambiar estados
 * @returns {boolean}
 */
export function puedeCambiarEstado() {
  return esAdministrador();
}

/**
 * Verifica si el usuario tiene acceso a usuarios
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoUsuarios() {
  return !esHSEQ();
}

/**
 * Verifica si el usuario tiene acceso a vehículos
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoVehiculos() {
  return !esHSEQ();
}

/**
 * Verifica si el usuario tiene acceso a conductores
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoConductores() {
  return !esHSEQ();
}

/**
 * Verifica si el usuario tiene acceso a trayectos
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoTrayectos() {
  return !esHSEQ();
}

/**
 * Verifica si el usuario tiene acceso a asignaciones
 * HSEQ NO tiene acceso
 * @returns {boolean}
 */
export function tieneAccesoAsignaciones() {
  return !esHSEQ();
}

/**
 * Verifica si el usuario tiene acceso a roles
 * Solo ADMINISTRADOR
 * @returns {boolean}
 */
export function tieneAccesoRoles() {
  return esAdministrador();
}

/**
 * Verifica si el usuario puede registrar horas de conducción
 * HSEQ y ADMINISTRADOR pueden registrar horas
 * @returns {boolean}
 */
export function puedeRegistrarHoras() {
  const rol = getRolActual();
  return rol === 'ADMINISTRADOR' || rol === 'HSEQ';
}

/**
 * Obtiene las opciones de menú disponibles según el rol
 * @returns {Array}
 */
export function getOpcionesMenu() {
  const rol = getRolActual();
  
  const menuCompleto = [
    { path: '/', label: 'Dashboard', icon: 'home', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { path: '/usuarios', label: 'Usuarios', icon: 'users', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { path: '/vehiculos', label: 'Vehículos', icon: 'truck', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { path: '/conductores', label: 'Conductores', icon: 'user', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { path: '/trayectos', label: 'Trayectos', icon: 'route', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { path: '/asignaciones', label: 'Asignaciones', icon: 'calendar', roles: ['ADMINISTRADOR', 'COORDINADOR'] },
    { path: '/roles', label: 'Roles', icon: 'shield', roles: ['ADMINISTRADOR'] },
    { path: '/operaciones/horas', label: 'Registro de Horas', icon: 'clock', roles: ['ADMINISTRADOR', 'HSEQ'] },
  ];
  
  // Filtrar opciones según el rol
  return menuCompleto.filter(opcion => opcion.roles.includes(rol));
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
  puedeRegistrarHoras,
  getOpcionesMenu,
  getMensajePermisosDenegados
};
