import {
  obtenerConfigDesdeDB,
  guardarConfigRol,
  resetConfig,
  MODULOS,
  ACCIONES
} from '../config/modulos.config.js';

function validarPayload(permisos) {
  if (typeof permisos !== 'object' || Array.isArray(permisos) || !permisos) {
    throw new Error('Formato inválido de permisos. Se esperaba un objeto { modulo: { sidebar, acciones } }');
  }

  const modulosInvalidos = Object.keys(permisos).filter((m) => !MODULOS.includes(m));
  if (modulosInvalidos.length) {
    throw new Error(`Módulos no soportados: ${modulosInvalidos.join(', ')}`);
  }

  Object.entries(permisos).forEach(([modulo, cfg]) => {
    if (typeof cfg !== 'object' || Array.isArray(cfg)) {
      throw new Error(`Configuración inválida para módulo ${modulo}`);
    }
    if (typeof cfg.sidebar !== 'undefined' && typeof cfg.sidebar !== 'boolean') {
      throw new Error(`sidebar debe ser booleano para módulo ${modulo}`);
    }
    if (cfg.acciones && typeof cfg.acciones !== 'object') {
      throw new Error(`acciones debe ser un objeto para módulo ${modulo}`);
    }

    if (cfg.acciones) {
      const accionesInvalidas = Object.keys(cfg.acciones).filter((a) => !ACCIONES.includes(a));
      if (accionesInvalidas.length) {
        throw new Error(`Acciones no soportadas en ${modulo}: ${accionesInvalidas.join(', ')}`);
      }
    }
  });
}

export const obtenerPermisosModulos = async (req, res) => {
  try {
    const config = await obtenerConfigDesdeDB();
    res.json({ config });
  } catch (error) {
    console.error('Error obteniendo permisos de módulos:', error);
    res.status(500).json({ error: 'Error al obtener permisos de módulos' });
  }
};

export const actualizarPermisosRol = async (req, res) => {
  try {
    const { rol } = req.params;
    const { permisos } = req.body;

    if (!rol) {
      return res.status(400).json({ error: 'rol es requerido en la URL' });
    }

    try {
      validarPayload(permisos || {});
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const configRol = await guardarConfigRol(rol, permisos || {});
    res.json({ mensaje: 'Permisos actualizados', rol: rol.toUpperCase(), permisos: configRol });
  } catch (error) {
    console.error('Error actualizando permisos de rol:', error);
    res.status(500).json({ error: 'Error al actualizar permisos del rol' });
  }
};

export const restaurarPermisos = async (_req, res) => {
  try {
    const config = await resetConfig();
    res.json({ mensaje: 'Permisos restablecidos a valores por defecto', config });
  } catch (error) {
    console.error('Error restaurando permisos:', error);
    res.status(500).json({ error: 'Error al restablecer permisos' });
  }
};

export const obtenerPermisosDeRol = async (req, res) => {
  try {
    const rolParam = req.params.rol;
    const rolUsuario = req.usuario?.nombre_rol;
    const rolUpper = (rolParam || rolUsuario || '').toUpperCase();

    if (!rolUpper) {
      return res.status(400).json({ error: 'Rol inválido' });
    }

    // Usuarios no administradores solo pueden consultar su propio rol
    if (rolUsuario && rolUsuario.toUpperCase() !== 'ADMINISTRADOR' && rolUsuario.toUpperCase() !== rolUpper) {
      return res.status(403).json({ error: 'Solo puedes consultar permisos de tu rol' });
    }

    const config = await obtenerConfigDesdeDB();
    const permisos = config[rolUpper] || Object.fromEntries(
      MODULOS.map((modulo) => [
        modulo,
        { sidebar: false, acciones: Object.fromEntries(ACCIONES.map((a) => [a, false])) }
      ])
    );

    res.json({ rol: rolUpper, permisos });
  } catch (error) {
    console.error('Error obteniendo permisos del rol:', error);
    res.status(500).json({ error: 'Error al obtener permisos del rol' });
  }
};
