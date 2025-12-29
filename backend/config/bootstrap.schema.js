import bcrypt from 'bcryptjs';
import { db } from './db.js';

export async function ensureCoreTables() {
  // Roles del sistema
  await db.query(`
    CREATE TABLE IF NOT EXISTS rol (
      id_rol SERIAL PRIMARY KEY,
      nombre_rol VARCHAR(120) NOT NULL UNIQUE,
      estado VARCHAR(20) NOT NULL DEFAULT 'activo',
      fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
  `);

  // Usuarios del sistema
  await db.query(`
    CREATE TABLE IF NOT EXISTS usuario (
      id_usuario SERIAL PRIMARY KEY,
      nombre_usuario VARCHAR(120) NOT NULL,
      correo VARCHAR(150) NOT NULL UNIQUE,
      "contraseña" TEXT NOT NULL,
      id_rol INT REFERENCES rol(id_rol),
      estado VARCHAR(20) NOT NULL DEFAULT 'activo',
      requiere_cambio_contrasena BOOLEAN NOT NULL DEFAULT false,
      fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
      fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
    );
  `);
}

export async function seedDefaultRoles() {
  const roles = ['ADMINISTRADOR', 'COORDINADOR', 'HSEQ'];

  // No asumimos que exista un UNIQUE/EXCLUSION constraint sobre nombre_rol
  // (por ejemplo si la tabla viene de un backup con definición distinta).
  await Promise.all(
    roles.map((nombre_rol) =>
      db.query(
        `INSERT INTO rol (nombre_rol)
         SELECT $1::varchar
         WHERE NOT EXISTS (
           SELECT 1 FROM rol WHERE UPPER(nombre_rol) = UPPER($1::varchar)
         );`,
        [nombre_rol]
      )
    )
  );
}

export async function seedBootstrapAdmin() {
  const email = process.env.BOOTSTRAP_ADMIN_EMAIL;
  const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
  const name = process.env.BOOTSTRAP_ADMIN_NAME || 'Administrador';

  if (!email || !password) return;

  const rolRes = await db.query('SELECT id_rol FROM rol WHERE nombre_rol = $1', ['ADMINISTRADOR']);
  const id_rol = rolRes.rows[0]?.id_rol;
  if (!id_rol) return;

  const exists = await db.query('SELECT 1 FROM usuario WHERE correo = $1', [email]);
  if (exists.rows.length > 0) return;

  const hashed = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO usuario (nombre_usuario, correo, "contraseña", id_rol, estado, requiere_cambio_contrasena)
     VALUES ($1, $2, $3, $4, 'activo', false);`,
    [name, email, hashed, id_rol]
  );
}

export async function bootstrapSchema() {
  await ensureCoreTables();
  await seedDefaultRoles();
  await seedBootstrapAdmin();
}
