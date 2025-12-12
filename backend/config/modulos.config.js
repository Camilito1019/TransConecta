import { db } from './db.js';

export const MODULOS = [
  'dashboard',
  'usuarios',
  'clientes',
  'roles',
  'modulos',
  'vehiculos',
  'conductores',
  'trayectos',
  'asignaciones',
  'registroHoras'
];

export const ACCIONES = ['ver', 'crear', 'editar', 'eliminar', 'desactivar'];

export const DEFAULT_CONFIG = {
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

function mergeWithDefaults(rol) {
  const rolUpper = (rol || '').toUpperCase();
  const base = DEFAULT_CONFIG[rolUpper] || {};
  return Object.fromEntries(
    MODULOS.map((modulo) => [
      modulo,
      normalizeModuloConfig(base[modulo] || { sidebar: false, acciones: {} })
    ])
  );
}

export async function ensureTablaModuloPermiso() {
  const query = `
    CREATE TABLE IF NOT EXISTS modulo_permiso (
      id_permiso SERIAL PRIMARY KEY,
      rol VARCHAR(120) NOT NULL,
      modulo VARCHAR(120) NOT NULL,
      sidebar BOOLEAN NOT NULL DEFAULT false,
      acciones JSONB NOT NULL DEFAULT '{}'::jsonb,
      fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      CONSTRAINT uq_modulo_rol UNIQUE (rol, modulo)
    );
  `;
  await db.query(query);
}

export async function seedModuloPermisos() {
  const countRes = await db.query('SELECT COUNT(*)::int AS total FROM modulo_permiso');
  const total = countRes.rows[0]?.total || 0;
  if (total > 0) return;

  const inserts = [];
  Object.entries(DEFAULT_CONFIG).forEach(([rol, permisos]) => {
    const rolUpper = rol.toUpperCase();
    MODULOS.forEach((modulo) => {
      const cfg = normalizeModuloConfig(permisos[modulo] || {});
      inserts.push(db.query(
        `INSERT INTO modulo_permiso (rol, modulo, sidebar, acciones)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (rol, modulo) DO UPDATE SET
           sidebar = EXCLUDED.sidebar,
           acciones = EXCLUDED.acciones,
           fecha_actualizacion = NOW();`,
        [rolUpper, modulo, cfg.sidebar, cfg.acciones]
      ));
    });
  });
  await Promise.all(inserts);
}

export async function obtenerConfigDesdeDB() {
  const res = await db.query('SELECT rol, modulo, sidebar, acciones FROM modulo_permiso');
  const base = {};

  res.rows.forEach((row) => {
    const rolUpper = row.rol.toUpperCase();
    if (!base[rolUpper]) {
      base[rolUpper] = mergeWithDefaults(rolUpper);
    }
    base[rolUpper][row.modulo] = normalizeModuloConfig(row);
  });

  // Asegurar defaults incluso si no hay filas para ese rol
  Object.keys(DEFAULT_CONFIG).forEach((rol) => {
    const rolUpper = rol.toUpperCase();
    if (!base[rolUpper]) {
      base[rolUpper] = mergeWithDefaults(rolUpper);
    }
  });

  // Incluir roles creados en la tabla rol aunque aún no tengan filas en modulo_permiso
  try {
    const rolesRes = await db.query('SELECT nombre_rol FROM rol');
    rolesRes.rows.forEach((row) => {
      const rolUpper = (row.nombre_rol || '').toUpperCase();
      if (!rolUpper) return;
      if (!base[rolUpper]) {
        base[rolUpper] = mergeWithDefaults(rolUpper);
      }
    });
  } catch (error) {
    // Si falla, al menos devolvemos los roles ya cargados/por defecto.
    console.warn('No se pudieron listar roles para normalizar permisos:', error);
  }

  return base;
}

export async function obtenerPermisosRolDesdeDB(rol) {
  const rolUpper = (rol || '').toUpperCase();
  if (!rolUpper) {
    // Sin rol, devolver todo false (deny-by-default)
    return mergeWithDefaults('');
  }

  const res = await db.query(
    'SELECT modulo, sidebar, acciones FROM modulo_permiso WHERE rol = $1',
    [rolUpper]
  );

  const permisos = mergeWithDefaults(rolUpper);
  res.rows.forEach((row) => {
    if (!row?.modulo) return;
    permisos[row.modulo] = normalizeModuloConfig(row);
  });

  return permisos;
}

export async function guardarConfigRol(rol, permisosRol) {
  const rolUpper = (rol || '').toUpperCase();
  if (!rolUpper) throw new Error('Rol requerido');

  const records = MODULOS.map((modulo) => {
    const cfg = normalizeModuloConfig(permisosRol?.[modulo] || {});
    return { modulo, ...cfg };
  });

  const ops = records.map((rec) =>
    db.query(
      `INSERT INTO modulo_permiso (rol, modulo, sidebar, acciones)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (rol, modulo) DO UPDATE SET
         sidebar = EXCLUDED.sidebar,
         acciones = EXCLUDED.acciones,
         fecha_actualizacion = NOW();`,
      [rolUpper, rec.modulo, rec.sidebar, rec.acciones]
    )
  );

  await Promise.all(ops);
  return mergeWithDefaults(rolUpper);
}

export async function resetConfig() {
  await db.query('TRUNCATE TABLE modulo_permiso RESTART IDENTITY');
  await seedModuloPermisos();
  return obtenerConfigDesdeDB();
}

export async function bootstrapModuloPermisos() {
  await ensureTablaModuloPermiso();
  await seedModuloPermisos();
}
