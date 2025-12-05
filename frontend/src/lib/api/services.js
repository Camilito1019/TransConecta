import { api } from './client.js';

/**
 * Servicio de Autenticación
 */
export const authService = {
  async login(correo, contraseña) {
    return api.post('/login', { correo, contraseña });
  },

  async logout() {
    api.clearToken();
    return { mensaje: 'Sesión cerrada' };
  },

  setToken(token) {
    api.setToken(token);
  },

  getToken() {
    return api.getToken();
  },

  isAuthenticated() {
    return !!api.getToken();
  },
};

/**
 * Servicio de Usuarios
 */
export const usuarioService = {
  async registrar(nombre_usuario, correo, contraseña) {
    return api.post('/usuarios', { nombre_usuario, correo, contraseña, estado: 'activo' });
  },

  async listar() {
    return api.get('/usuarios');
  },

  async obtener(id_usuario) {
    return api.get(`/usuarios/${id_usuario}`);
  },

  async actualizar(id_usuario, datos) {
    return api.put(`/usuarios/${id_usuario}`, datos);
  },

  async inactivar(id_usuario) {
    return api.patch(`/usuarios/${id_usuario}/inactivar`, {});
  },

  async activar(id_usuario) {
    return api.patch(`/usuarios/${id_usuario}/activar`, {});
  },

  async eliminar(id_usuario) {
    return api.delete(`/usuarios/${id_usuario}`);
  },

  async asignarRol(id_usuario, id_rol) {
    return api.put(`/usuarios/${id_usuario}/rol`, { id_rol });
  },

  async cambiarContraseña(contraseña_actual, contraseña_nueva) {
    return api.post('/cambiar-contrasena', { contraseña_actual, contraseña_nueva });
  },
};

/**
 * Servicio de Roles
 */
export const rolService = {
  async listar() {
    return api.get('/roles');
  },

  async crear(nombre, descripcion) {
    return api.post('/roles', { nombre, descripcion });
  },

  async obtener(id_rol) {
    return api.get(`/roles/${id_rol}`);
  },

  async actualizar(id_rol, nombre, descripcion) {
    return api.put(`/roles/${id_rol}`, { nombre, descripcion });
  },

  async eliminar(id_rol) {
    return api.delete(`/roles/${id_rol}`);
  },
};

/**
 * Servicio de Vehículos
 */
export const vehiculoService = {
  async crear(datos) {
    return api.post('/vehiculos', datos);
  },

  async listar() {
    return api.get('/vehiculos');
  },

  async obtener(id_vehiculo) {
    return api.get(`/vehiculos/${id_vehiculo}`);
  },

  async actualizar(id_vehiculo, datos) {
    return api.put(`/vehiculos/${id_vehiculo}`, datos);
  },

  async desactivar(id_vehiculo) {
    return api.patch(`/vehiculos/${id_vehiculo}/desactivar`, {});
  },

  async activar(id_vehiculo) {
    return api.patch(`/vehiculos/${id_vehiculo}/activar`, {});
  },

  async cambiarEstado(id_vehiculo, estado_operativo) {
    return api.patch(`/vehiculos/${id_vehiculo}/estado`, { estado_operativo });
  },

  async obtenerHistorial(id_vehiculo) {
    return api.get(`/vehiculos/${id_vehiculo}/historial`);
  },
};

/**
 * Servicio de Documentos de Vehículos
 */
export const documentoService = {
  async subirDocumento(id_vehiculo, formData) {
    return api.request(`/vehiculos/${id_vehiculo}/documentos`, {
      method: 'POST',
      body: formData,
      headers: {}, // Dejar vacío para que el navegador establezca Content-Type
    });
  },

  async listarDocumentos(id_vehiculo) {
    return api.get(`/vehiculos/${id_vehiculo}/documentos`);
  },

  async obtenerDocumento(id_documento) {
    return api.get(`/documentos/${id_documento}`);
  },

  async descargarDocumento(id_documento) {
    return `http://localhost:3000/api/documentos/${id_documento}/descargar`;
  },
};

/**
 * Servicio de Conductores
 */
export const conductorService = {
  async crear(datos) {
    return api.post('/conductores', datos);
  },

  async listar() {
    return api.get('/conductores');
  },

  async obtener(id_conductor) {
    return api.get(`/conductores/${id_conductor}`);
  },

  async actualizar(id_conductor, datos) {
    return api.put(`/conductores/${id_conductor}`, datos);
  },

  async desactivar(id_conductor) {
    return api.patch(`/conductores/${id_conductor}/desactivar`, {});
  },

  async activar(id_conductor) {
    return api.patch(`/conductores/${id_conductor}/activar`, {});
  },

  async obtenerDetalles(id_conductor) {
    return api.get(`/conductores/${id_conductor}/detalles`);
  },

  async obtenerHistorial(id_conductor) {
    return api.get(`/conductores/${id_conductor}/historial`);
  },

  async registrarHoras(id_conductor, datos) {
    return api.post(`/conductores/${id_conductor}/horas`, datos);
  },

  async registrarAlerta(id_conductor, descripcion) {
    return api.post(`/conductores/${id_conductor}/alertas-fatiga`, { descripcion });
  },
};

/**
 * Servicio de Trayectos
 */
export const trayectoService = {
  async crear(datos) {
    return api.post('/trayectos', datos);
  },

  async listar() {
    return api.get('/trayectos');
  },

  async actualizar(id_trayecto, datos) {
    return api.put(`/trayectos/${id_trayecto}`, datos);
  },

  async asignarTrayecto(datos) {
    return api.post('/asignaciones', datos);
  },

  async listarAsignaciones() {
    return api.get('/asignaciones');
  },

  async obtenerAsignacion(id_asignacion) {
    return api.get(`/asignaciones/${id_asignacion}`);
  },

  async desasignarTrayecto(id_asignacion) {
    return api.delete(`/asignaciones/${id_asignacion}`);
  },
};
