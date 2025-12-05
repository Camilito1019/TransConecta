import { db } from "../config/db.js";
import bcrypt from "bcryptjs";

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre_usuario, correo, contraseña, id_rol } = req.body;
    const rolId = Number(id_rol);

    if (!nombre_usuario || !correo || !contraseña || id_rol === undefined || id_rol === null || id_rol === '') {
      return res.status(400).json({ error: "nombre_usuario, correo, contraseña e id_rol son obligatorios" });
    }

    if (!isValidEmail(correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    if (!Number.isInteger(rolId)) {
      return res.status(400).json({ error: "id_rol inválido" });
    }

    // Verificar si el rol existe
    const rol = await db.query('SELECT id_rol FROM Rol WHERE id_rol = $1', [rolId]);
    if (rol.rows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    // Verificar si el correo ya existe
    const existe = await db.query(
      "SELECT 1 FROM Usuario WHERE correo = $1",
      [correo]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    if (typeof contraseña !== 'string' || contraseña.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Insertar en la base de datos
    const query = `
      INSERT INTO Usuario (nombre_usuario, correo, "contraseña", id_rol, estado)
      VALUES ($1, $2, $3, $4, 'activo')
      RETURNING id_usuario, id_rol, nombre_usuario, correo, estado, fecha_creacion
    `;

    const values = [nombre_usuario, correo, hashedPassword, rolId];

    const result = await db.query(query, values);

    return res.status(201).json({
      mensaje: "Usuario registrado con éxito",
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error("Error registrando usuario:", error);
    return res.status(500).json({ error: "Error en el servidor" });
  }
};

// Helper: validación simple de email
function isValidEmail(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
}

// Listar todos los usuarios (sin contraseña)
export const listarUsuarios = async (req, res) => {
  try {
    const query = `
      SELECT u.id_usuario,
             u.id_rol,
             u.nombre_usuario,
             u.correo,
             u.estado,
             u.fecha_creacion,
             r.nombre_rol AS nombre_rol
      FROM Usuario u
      LEFT JOIN Rol r ON r.id_rol = u.id_rol
      ORDER BY u.id_usuario
    `;
    const result = await db.query(query);
    res.json({ total: result.rows.length, usuarios: result.rows });
  } catch (error) {
    console.error("Error listando usuarios:", error);
    res.status(500).json({ error: "Error al listar usuarios" });
  }
};

// Ver un usuario por id (sin contraseña)
export const verUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: "id_usuario inválido" });
    }

    const query = `
      SELECT id_usuario, id_rol, nombre_usuario, correo, estado, fecha_creacion
      FROM Usuario
      WHERE id_usuario = $1
    `;
    const result = await db.query(query, [id_usuario]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error obteniendo usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
};

// Actualizar usuario (nombre, correo, estado, id_rol, opcional contraseña)
export const actualizarUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    const { nombre_usuario, correo, estado, id_rol, contraseña } = req.body;
    const rolId = id_rol !== undefined && id_rol !== null && id_rol !== '' ? Number(id_rol) : null;

    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: "id_usuario inválido" });
    }

    // Verificar existencia
    const userQuery = `SELECT * FROM Usuario WHERE id_usuario = $1`;
    const userResult = await db.query(userQuery, [id_usuario]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    // Validaciones básicas
    if (nombre_usuario && (typeof nombre_usuario !== 'string' || nombre_usuario.length > 100)) {
      return res.status(400).json({ error: 'nombre_usuario inválido' });
    }

    if (correo && (!isValidEmail(correo) || correo.length > 150)) {
      return res.status(400).json({ error: 'correo inválido' });
    }

    if (estado && !['activo', 'inactivo'].includes(String(estado).toLowerCase())) {
      return res.status(400).json({ error: "estado debe ser 'activo' o 'inactivo'" });
    }

    // Si se cambia el correo, verificar unicidad
    if (correo) {
      const exists = await db.query('SELECT id_usuario FROM Usuario WHERE correo = $1 AND id_usuario <> $2', [correo, id_usuario]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: 'El correo ya está registrado por otro usuario' });
      }
    }

    // Si se proporciona id_rol, verificar que exista en la tabla Rol

    if (id_rol !== undefined && id_rol !== null && id_rol !== '') {
      if (!Number.isInteger(rolId)) {
        return res.status(400).json({ error: 'id_rol inválido' });
      }
      const roleCheck = await db.query('SELECT id_rol FROM Rol WHERE id_rol = $1', [rolId]);
      if (roleCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Rol no encontrado' });
      }
    }

    // Si hay contraseña nueva, hashearla

    let hashed = null;
    if (contraseña) {
      if (typeof contraseña !== 'string' || contraseña.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }
      hashed = await bcrypt.hash(contraseña, 10);
    }

    const updateQuery = `
      WITH updated AS (
        UPDATE Usuario
        SET nombre_usuario = COALESCE($1, nombre_usuario),
            correo = COALESCE($2, correo),
            estado = COALESCE($3, estado),
            id_rol = COALESCE($4, id_rol),
            "contraseña" = COALESCE($5, "contraseña")
        WHERE id_usuario = $6
        RETURNING id_usuario, id_rol, nombre_usuario, correo, estado, fecha_creacion
      )
      SELECT u.*, r.nombre_rol AS nombre_rol
      FROM updated u
      LEFT JOIN Rol r ON r.id_rol = u.id_rol
    `;

    const values = [nombre_usuario || null, correo || null, estado ? String(estado).toLowerCase() : null, rolId, hashed || null, id_usuario];
    const result = await db.query(updateQuery, values);
    res.json({ mensaje: 'Usuario actualizado', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Inactivar usuario (soft delete)
export const inactivarUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: "id_usuario inválido" });
    }

    const update = `
      WITH updated AS (
        UPDATE Usuario SET estado = 'inactivo' WHERE id_usuario = $1 RETURNING id_usuario, id_rol, nombre_usuario, correo, estado
      )
      SELECT u.*, r.nombre_rol AS nombre_rol FROM updated u LEFT JOIN Rol r ON r.id_rol = u.id_rol
    `;
    const result = await db.query(update, [id_usuario]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario inactivado', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error inactivando usuario:', error);
    res.status(500).json({ error: 'Error al inactivar usuario' });
  }
};

// Eliminar usuario (borrar físicamente)
export const eliminarUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: "id_usuario inválido" });
    }

    const del = `DELETE FROM Usuario WHERE id_usuario = $1 RETURNING id_usuario, nombre_usuario, correo`;
    const result = await db.query(del, [id_usuario]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario eliminado', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

export const activarUsuario = async (req, res) => {
  try {
    const { id_usuario } = req.params;
    if (!id_usuario || isNaN(id_usuario)) {
      return res.status(400).json({ error: "id_usuario inválido" });
    }

    const update = `
      WITH updated AS (
        UPDATE Usuario SET estado = 'activo' WHERE id_usuario = $1 RETURNING id_usuario, id_rol, nombre_usuario, correo, estado
      )
      SELECT u.*, r.nombre_rol AS nombre_rol FROM updated u LEFT JOIN Rol r ON r.id_rol = u.id_rol
    `;
    const result = await db.query(update, [id_usuario]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json({ mensaje: 'Usuario activado', usuario: result.rows[0] });
  } catch (error) {
    console.error('Error activando usuario:', error);
    res.status(500).json({ error: 'Error al activar usuario' });
  }
};