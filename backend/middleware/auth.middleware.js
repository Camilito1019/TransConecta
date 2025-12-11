import jwt from 'jsonwebtoken';
import { db } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'transconecta_secret_key_2024';

/**
 * Middleware para verificar el token JWT
 */
export const verifyToken = async (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'No se proporcionó un token de autenticación' 
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar y decodificar el token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Buscar el usuario en la base de datos
    const result = await db.query(
      `SELECT u.id_usuario, u.nombre_usuario, u.correo, 
              u.estado, u.id_rol, r.nombre_rol
       FROM usuario u
       LEFT JOIN rol r ON u.id_rol = r.id_rol
       WHERE u.id_usuario = $1`,
      [decoded.id_usuario]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    const usuario = result.rows[0];

    // Verificar que el usuario esté activo
    if (usuario.estado !== 'activo') {
      return res.status(403).json({ 
        error: 'Usuario inactivo' 
      });
    }

    // Adjuntar información del usuario a la request
    req.usuario = {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      correo: usuario.correo,
      id_rol: usuario.id_rol,
      nombre_rol: usuario.nombre_rol
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado' 
      });
    }
    console.error('Error en verificación de token:', error);
    return res.status(500).json({ 
      error: 'Error al verificar autenticación' 
    });
  }
};

/**
 * Middleware para verificar roles específicos
 * 
 * Reglas del proyecto:
 * - ADMINISTRADOR: Acceso total
 * - COORDINADOR: Puede crear pero no editar/eliminar
 * - HSEQ: Solo registrar horas de conducción
 * 
 * @param {string[]} rolesPermitidos - Array de roles que pueden acceder
 */
export const checkRole = (rolesPermitidos) => {
  return (req, res, next) => {
    try {
      if (!req.usuario || !req.usuario.nombre_rol) {
        return res.status(401).json({ 
          error: 'Usuario no autenticado' 
        });
      }

      const rolUsuario = req.usuario.nombre_rol.toUpperCase();

      // Convertir roles permitidos a mayúsculas para comparación
      const rolesPermitidosUpper = rolesPermitidos.map(rol => rol.toUpperCase());

      if (!rolesPermitidosUpper.includes(rolUsuario)) {
        return res.status(403).json({ 
          error: 'No tienes permisos para realizar esta acción',
          rol_requerido: rolesPermitidos,
          tu_rol: req.usuario.nombre_rol
        });
      }

      next();
    } catch (error) {
      console.error('Error en verificación de rol:', error);
      return res.status(500).json({ 
        error: 'Error al verificar permisos' 
      });
    }
  };
};

/**
 * Middleware para verificar permisos de modificación
 * Solo ADMINISTRADOR puede editar/eliminar
 */
export const soloAdministrador = checkRole(['ADMINISTRADOR']);

/**
 * Middleware para operaciones de creación
 * ADMINISTRADOR y COORDINADOR pueden crear
 */
export const puedeCrear = checkRole(['ADMINISTRADOR', 'COORDINADOR']);

/**
 * Middleware para operaciones de edición/eliminación
 * Solo ADMINISTRADOR
 */
export const puedeModificar = checkRole(['ADMINISTRADOR']);

/**
 * Middleware para operaciones de HSEQ
 * Solo HSEQ y ADMINISTRADOR pueden acceder a registro de horas
 */
export const accesoHSEQ = checkRole(['ADMINISTRADOR', 'HSEQ']);

/**
 * Middleware para verificar si el usuario puede realizar una acción específica
 */
export const verificarAccion = (accion) => {
  return (req, res, next) => {
    const rolUsuario = req.usuario?.nombre_rol?.toUpperCase();

    if (!rolUsuario) {
      return res.status(401).json({ 
        error: 'Usuario no autenticado' 
      });
    }

    // ADMINISTRADOR puede hacer todo
    if (rolUsuario === 'ADMINISTRADOR') {
      return next();
    }

    // COORDINADOR: solo puede crear
    if (rolUsuario === 'COORDINADOR') {
      if (accion === 'crear') {
        return next();
      }
      return res.status(403).json({ 
        error: 'Los coordinadores solo pueden crear registros, no modificarlos ni eliminarlos' 
      });
    }

    // HSEQ: solo acceso a registro de horas
    if (rolUsuario === 'HSEQ') {
      if (accion === 'horas') {
        return next();
      }
      return res.status(403).json({ 
        error: 'HSEQ solo tiene acceso al registro de horas de conducción' 
      });
    }

    return res.status(403).json({ 
      error: 'No tienes permisos para realizar esta acción' 
    });
  };
};

export default {
  verifyToken,
  checkRole,
  soloAdministrador,
  puedeCrear,
  puedeModificar,
  accesoHSEQ,
  verificarAccion
};
