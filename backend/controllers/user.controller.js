import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import { createTransport } from "nodemailer";

// Configuración de Gmail SMTP
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tu-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'tu-app-password'
  }
});

const CONTRASENA_POR_DEFECTO = "TransConecta123*";

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre_usuario, correo, id_rol } = req.body;
    const rolId = Number(id_rol);

    if (!nombre_usuario || !correo || id_rol === undefined || id_rol === null || id_rol === '') {
      return res.status(400).json({ error: "nombre_usuario, correo e id_rol son obligatorios" });
    }

    if (!isValidEmail(correo)) {
      return res.status(400).json({ error: "Correo inválido" });
    }

    if (!Number.isInteger(rolId)) {
      return res.status(400).json({ error: "id_rol inválido" });
    }

    // Verificar si el rol existe
    const rol = await db.query('SELECT nombre_rol FROM rol WHERE id_rol = $1', [rolId]);
    if (rol.rows.length === 0) {
      return res.status(404).json({ error: 'Rol no encontrado' });
    }

    const nombre_rol = rol.rows[0].nombre_rol;

    // Verificar si el correo ya existe
    const existe = await db.query(
      "SELECT 1 FROM usuario WHERE correo = $1",
      [correo]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    // Usar contraseña por defecto
    const hashedPassword = await bcrypt.hash(CONTRASENA_POR_DEFECTO, 10);

    // Insertar en la base de datos con flag requiere_cambio_contrasena = true
    const query = `
      INSERT INTO usuario (nombre_usuario, correo, "contraseña", id_rol, estado, requiere_cambio_contrasena)
      VALUES ($1, $2, $3, $4, 'activo', true)
      RETURNING id_usuario, id_rol, nombre_usuario, correo, estado, fecha_creacion, requiere_cambio_contrasena
    `;

    const values = [nombre_usuario, correo, hashedPassword, rolId];

    const result = await db.query(query, values);

    // Enviar correo con las credenciales
    try {
      const mailOptions = {
        from: {
          name: 'TransConecta',
          address: process.env.EMAIL_USER || 'tu-email@gmail.com'
        },
        to: correo,
        subject: '¡Bienvenido a TransConecta! - Tus credenciales de acceso',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #e3473c, #c23630); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { margin: 0; font-size: 28px; }
              .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
              .credentials-box { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 2px solid #e3473c; }
              .credential-item { margin: 15px 0; }
              .credential-label { font-weight: bold; color: #666; font-size: 14px; }
              .credential-value { font-size: 18px; color: #e3473c; font-weight: bold; font-family: monospace; background: #f5f5f5; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-top: 5px; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .button { display: inline-block; background: linear-gradient(135deg, #e3473c, #c23630); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚀 Bienvenido a TransConecta</h1>
                <p>Plataforma de Gestión de Transporte</p>
              </div>
              <div class="content">
                <h2>¡Hola ${nombre_usuario}!</h2>
                <p>Tu cuenta ha sido creada exitosamente en TransConecta. A continuación encontrarás tus credenciales de acceso:</p>
                
                <div class="credentials-box">
                  <div class="credential-item">
                    <div class="credential-label">👤 Usuario / Correo:</div>
                    <div class="credential-value">${correo}</div>
                  </div>
                  <div class="credential-item">
                    <div class="credential-label">🔑 Contraseña temporal:</div>
                    <div class="credential-value">${CONTRASENA_POR_DEFECTO}</div>
                  </div>
                  <div class="credential-item">
                    <div class="credential-label">🎭 Rol asignado:</div>
                    <div class="credential-value">${nombre_rol}</div>
                  </div>
                </div>

                <div class="warning">
                  <strong>⚠️ Importante - Seguridad:</strong>
                  <ul style="margin: 10px 0;">
                    <li><strong>Debes cambiar tu contraseña en el primer inicio de sesión</strong></li>
                    <li>Esta contraseña es temporal y debe ser reemplazada inmediatamente</li>
                    <li>No compartas estas credenciales con nadie</li>
                    <li>Guarda este correo de forma segura o elimínalo después de cambiar tu contraseña</li>
                  </ul>
                </div>

                <center>
                  <a href="http://localhost:5173/login" class="button">Iniciar Sesión Ahora</a>
                </center>

                <p style="margin-top: 20px; font-size: 14px; color: #666;">
                  Al iniciar sesión por primera vez, se te pedirá que cambies tu contraseña por una personalizada y segura.
                </p>
              </div>
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
                <p>&copy; ${new Date().getFullYear()} TransConecta. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await transporter.sendMail(mailOptions);
      console.log('✅ Correo de bienvenida enviado a:', correo);
    } catch (emailError) {
      console.error('❌ Error enviando correo:', emailError);
      // No fallar la creación del usuario si el correo falla
    }

    return res.status(201).json({
      mensaje: "Usuario registrado con éxito. Se ha enviado un correo con las credenciales de acceso.",
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
      FROM usuario u
      LEFT JOIN rol r ON r.id_rol = u.id_rol
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
      FROM usuario
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
    const userQuery = `SELECT * FROM usuario WHERE id_usuario = $1`;
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
      const exists = await db.query('SELECT id_usuario FROM usuario WHERE correo = $1 AND id_usuario <> $2', [correo, id_usuario]);
      if (exists.rows.length > 0) {
        return res.status(409).json({ error: 'El correo ya está registrado por otro usuario' });
      }
    }

    // Si se proporciona id_rol, verificar que exista en la tabla Rol

    if (id_rol !== undefined && id_rol !== null && id_rol !== '') {
      if (!Number.isInteger(rolId)) {
        return res.status(400).json({ error: 'id_rol inválido' });
      }
      const roleCheck = await db.query('SELECT id_rol FROM rol WHERE id_rol = $1', [rolId]);
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
        UPDATE usuario
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
      LEFT JOIN rol r ON r.id_rol = u.id_rol
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
        UPDATE usuario SET estado = 'inactivo' WHERE id_usuario = $1 RETURNING id_usuario, id_rol, nombre_usuario, correo, estado
      )
      SELECT u.*, r.nombre_rol AS nombre_rol FROM updated u LEFT JOIN rol r ON r.id_rol = u.id_rol
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

    const del = `DELETE FROM usuario WHERE id_usuario = $1 RETURNING id_usuario, nombre_usuario, correo`;
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
        UPDATE usuario SET estado = 'activo' WHERE id_usuario = $1 RETURNING id_usuario, id_rol, nombre_usuario, correo, estado
      )
      SELECT u.*, r.nombre_rol AS nombre_rol FROM updated u LEFT JOIN rol r ON r.id_rol = u.id_rol
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