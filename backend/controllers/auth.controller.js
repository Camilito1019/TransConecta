import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "clave_secreta_super_segura";

function decodeToken(req) {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.replace("Bearer ", "") : null;
  const cookieToken = req.cookies?.auth_token;
  const jwtToken = token || cookieToken;
  if (!jwtToken) return null;
  try {
    return jwt.verify(jwtToken, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export const loginUsuario = async (req, res) => {
  try {
    const { correo, contraseña } = req.body;

    // Validación de campos
    if (!correo || !contraseña) {
      return res.status(400).json({ error: "correo y contraseña son obligatorios" });
    }

    // Buscar al usuario en la base de datos con su rol
    const query = `
      SELECT u.*, r.nombre_rol
      FROM Usuario u
      LEFT JOIN Rol r ON r.id_rol = u.id_rol
      WHERE u.correo = $1
    `;
    const result = await db.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "El correo no está registrado" });
    }

    const usuario = result.rows[0];

    // Comparar contraseñas (bcrypt)
    const coincide = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!coincide) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // Crear el token JWT
    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        correo: usuario.correo
      },
      JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      mensaje: "Inicio de sesión exitoso",
      descripcion: "Usuario autenticado correctamente",
      id_usuario: usuario.id_usuario,
      id_rol: usuario.id_rol,
      nombre_usuario: usuario.nombre_usuario,
      correo: usuario.correo,
      estado: usuario.estado,
      nombre_rol: usuario.nombre_rol || null,
      token
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ error: "Error en el servidor" });
  }
};

// Logout: agrega el token a una blacklist en la BD para invalidarlo
export const logoutUsuario = async (req, res) => {
  // Opción A: logout del lado del cliente.
  // El servidor no almacena ni invalida tokens.
  // Instruye al cliente a eliminar el token (localStorage/cookie).
  return res.json({ mensaje: 'Logout exitoso. Elimina el token en el cliente.' });
};

// Obtener perfil del usuario autenticado
export const obtenerPerfil = async (req, res) => {
  const decoded = decodeToken(req);
  if (!decoded?.id_usuario) {
    return res.status(401).json({ error: "Token inválido o ausente" });
  }

  try {
    const result = await db.query(
      `SELECT u.id_usuario, u.id_rol, u.nombre_usuario, u.correo, u.estado, r.nombre_rol
       FROM Usuario u
       LEFT JOIN Rol r ON r.id_rol = u.id_rol
       WHERE u.id_usuario = $1`,
      [decoded.id_usuario]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "Usuario no encontrado" });

    res.json({ usuario: result.rows[0] });
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ error: "Error al obtener perfil" });
  }
};

// Actualizar perfil del usuario autenticado
export const actualizarPerfil = async (req, res) => {
  const decoded = decodeToken(req);
  if (!decoded?.id_usuario) {
    return res.status(401).json({ error: "Token inválido o ausente" });
  }

  const { nombre_usuario, correo, contraseña } = req.body;

  if (nombre_usuario && (typeof nombre_usuario !== "string" || nombre_usuario.length > 100)) {
    return res.status(400).json({ error: "nombre_usuario inválido" });
  }

  if (correo && (!/^\S+@\S+\.\S+$/.test(correo) || correo.length > 150)) {
    return res.status(400).json({ error: "correo inválido" });
  }

  if (contraseña && (typeof contraseña !== "string" || contraseña.length < 6)) {
    return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
  }

  try {
    // Verificar unicidad del correo
    if (correo) {
      const exists = await db.query(
        "SELECT id_usuario FROM Usuario WHERE correo = $1 AND id_usuario <> $2",
        [correo, decoded.id_usuario]
      );
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: "El correo ya está registrado" });
      }
    }

    const hashed = contraseña ? await bcrypt.hash(contraseña, 10) : null;

    const update = await db.query(
      `UPDATE Usuario
       SET nombre_usuario = COALESCE($1, nombre_usuario),
           correo = COALESCE($2, correo),
           "contraseña" = COALESCE($3, "contraseña")
       WHERE id_usuario = $4
       RETURNING id_usuario, id_rol, nombre_usuario, correo, estado`,
      [nombre_usuario || null, correo || null, hashed || null, decoded.id_usuario]
    );

    const usuario = update.rows[0];

    const rol = await db.query("SELECT nombre_rol FROM Rol WHERE id_rol = $1", [usuario.id_rol]);

    res.json({
      mensaje: "Perfil actualizado",
      usuario: { ...usuario, nombre_rol: rol.rows[0]?.nombre_rol || null }
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
};
