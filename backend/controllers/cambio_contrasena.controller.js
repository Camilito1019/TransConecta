import { db } from "../config/db.js";
import bcrypt from "bcryptjs";

// Cambiar contraseña de usuario
export const cambiarContrasena = async (req, res) => {
  try {
    const { id_usuario, contrasena_actual, contrasena_nueva } = req.body;

    // Validaciones
    if (!id_usuario || !contrasena_actual || !contrasena_nueva) {
      return res.status(400).json({ 
        error: "id_usuario, contrasena_actual y contrasena_nueva son obligatorios" 
      });
    }

    if (isNaN(id_usuario)) {
      return res.status(400).json({ error: "id_usuario inválido" });
    }

    if (contrasena_actual === contrasena_nueva) {
      return res.status(400).json({ 
        error: "La nueva contraseña debe ser diferente a la actual" 
      });
    }

    if (typeof contrasena_nueva !== 'string' || contrasena_nueva.length < 6) {
      return res.status(400).json({ 
        error: "La contraseña nueva debe tener al menos 6 caracteres" 
      });
    }

    // Obtener usuario actual
    const userQuery = `SELECT * FROM Usuario WHERE id_usuario = $1`;
    const userResult = await db.query(userQuery, [id_usuario]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const usuario = userResult.rows[0];

    // Verificar contraseña actual
    const coincide = await bcrypt.compare(contrasena_actual, usuario.contraseña);
    if (!coincide) {
      return res.status(401).json({ error: "Contraseña actual incorrecta" });
    }

    // Hash de la nueva contraseña
    const nuevoHash = await bcrypt.hash(contrasena_nueva, 10);

    // Registrar el cambio en la tabla cambio_contrasena
    const insertQuery = `
      INSERT INTO cambio_contrasena (id_usuario, contrasena_anterior, contrasena_nueva, fecha_cambio)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const insertResult = await db.query(insertQuery, [
      id_usuario,
      usuario.contraseña,
      nuevoHash
    ]);

    // Actualizar contraseña en tabla Usuario
    const updateQuery = `
      UPDATE Usuario 
      SET "contraseña" = $1
      WHERE id_usuario = $2
      RETURNING id_usuario, nombre_usuario, correo, estado
    `;

    const updateResult = await db.query(updateQuery, [nuevoHash, id_usuario]);
    const usuarioActualizado = updateResult.rows[0];

    res.json({
      mensaje: "Contraseña actualizada exitosamente",
      usuario: usuarioActualizado,
      cambio: insertResult.rows[0]
    });
  } catch (error) {
    console.error("Error cambiando contraseña:", error);
    res.status(500).json({ error: "Error al cambiar contraseña" });
  }
};
