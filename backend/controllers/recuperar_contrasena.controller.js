import { db } from "../config/db.js";
import bcrypt from "bcryptjs";
import { createTransport } from "nodemailer";
import crypto from "crypto";

// Configuración de Gmail SMTP
const transporter = createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'tu-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'tu-app-password'
  }
});

// Almacenamiento temporal de códigos OTP (en producción usar Redis o base de datos)
const otpStorage = new Map();

/**
 * Generar código OTP de 6 dígitos
 */
function generarOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Solicitar código OTP para recuperar contraseña
 */
export const solicitarOTP = async (req, res) => {
  try {
    console.log('📧 Solicitud OTP recibida:', req.body);
    const { correo } = req.body;

    if (!correo) {
      return res.status(400).json({ error: "El correo es obligatorio" });
    }

    // Verificar que el correo existe
    const result = await db.query(
      "SELECT id_usuario, nombre_usuario, correo FROM usuario WHERE correo = $1",
      [correo]
    );

    if (result.rows.length === 0) {
      console.log('❌ Usuario no encontrado:', correo);
      return res.status(404).json({ error: "No existe una cuenta con este correo" });
    }

    const usuario = result.rows[0];
    const otp = generarOTP();
    const expiracion = Date.now() + 10 * 60 * 1000; // 10 minutos

    console.log('🔑 OTP generado:', otp, 'para usuario:', usuario.nombre_usuario);

    // Guardar OTP con expiración
    otpStorage.set(correo, {
      codigo: otp,
      expiracion: expiracion,
      intentos: 0
    });

    // Configurar el correo
    const mailOptions = {
      from: {
        name: 'TransConecta',
        address: process.env.EMAIL_USER || 'tu-email@gmail.com'
      },
      to: correo,
      subject: 'Código de Recuperación de Contraseña - TransConecta',
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
            .otp-box { background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; border: 2px dashed #e3473c; }
            .otp-code { font-size: 36px; font-weight: bold; color: #e3473c; letter-spacing: 8px; margin: 10px 0; }
            .info { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 TransConecta</h1>
              <p>Recuperación de Contraseña</p>
            </div>
            <div class="content">
              <h2>Hola ${usuario.nombre_usuario},</h2>
              <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
              
              <div class="otp-box">
                <p style="margin: 0; color: #666;">Tu código de verificación es:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 0; color: #666; font-size: 14px;">Válido por 10 minutos</p>
              </div>

              <div class="info">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0;">
                  <li>Este código expirará en 10 minutos</li>
                  <li>No compartas este código con nadie</li>
                  <li>Si no solicitaste este cambio, ignora este mensaje</li>
                </ul>
              </div>

              <p>Ingresa este código en la página de recuperación para crear una nueva contraseña.</p>
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

    // Enviar correo
    console.log('📨 Enviando correo a:', correo);
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado exitosamente');

    res.json({
      mensaje: "Código OTP enviado correctamente",
      correo: correo.replace(/(.{3})(.*)(@.*)/, '$1***$3') // Ocultar parte del correo
    });

  } catch (error) {
    console.error("❌ Error al solicitar OTP:", error);
    res.status(500).json({ error: "Error al enviar el código de verificación" });
  }
};

/**
 * Verificar código OTP
 */
export const verificarOTP = async (req, res) => {
  try {
    const { correo, codigo } = req.body;

    if (!correo || !codigo) {
      return res.status(400).json({ error: "Correo y código son obligatorios" });
    }

    const otpData = otpStorage.get(correo);

    if (!otpData) {
      return res.status(400).json({ error: "No hay un código activo para este correo" });
    }

    // Verificar expiración
    if (Date.now() > otpData.expiracion) {
      otpStorage.delete(correo);
      return res.status(400).json({ error: "El código ha expirado. Solicita uno nuevo" });
    }

    // Verificar intentos (máximo 3)
    if (otpData.intentos >= 3) {
      otpStorage.delete(correo);
      return res.status(400).json({ error: "Demasiados intentos fallidos. Solicita un nuevo código" });
    }

    // Verificar código
    if (otpData.codigo !== codigo) {
      otpData.intentos++;
      otpStorage.set(correo, otpData);
      return res.status(400).json({ 
        error: "Código incorrecto",
        intentosRestantes: 3 - otpData.intentos
      });
    }

    // Código correcto - generar token temporal
    const token = crypto.randomBytes(32).toString('hex');
    otpStorage.set(`reset_${correo}`, {
      token: token,
      expiracion: Date.now() + 15 * 60 * 1000, // 15 minutos para cambiar contraseña
      verificado: true
    });

    // Eliminar el OTP usado
    otpStorage.delete(correo);

    res.json({
      mensaje: "Código verificado correctamente",
      token: token
    });

  } catch (error) {
    console.error("Error al verificar OTP:", error);
    res.status(500).json({ error: "Error al verificar el código" });
  }
};

/**
 * Restablecer contraseña con token de verificación
 */
export const restablecerContrasena = async (req, res) => {
  try {
    const { correo, token, nueva_contrasena } = req.body;

    if (!correo || !token || !nueva_contrasena) {
      return res.status(400).json({ error: "Correo, token y nueva contraseña son obligatorios" });
    }

    // Validar contraseña
    if (typeof nueva_contrasena !== 'string' || nueva_contrasena.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }

    // Verificar token
    const resetData = otpStorage.get(`reset_${correo}`);

    if (!resetData || !resetData.verificado) {
      return res.status(400).json({ error: "Token inválido o no verificado" });
    }

    if (resetData.token !== token) {
      return res.status(400).json({ error: "Token incorrecto" });
    }

    if (Date.now() > resetData.expiracion) {
      otpStorage.delete(`reset_${correo}`);
      return res.status(400).json({ error: "El token ha expirado. Solicita un nuevo código" });
    }

    // Verificar que el usuario existe
    const userResult = await db.query(
      "SELECT id_usuario FROM usuario WHERE correo = $1",
      [correo]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const id_usuario = userResult.rows[0].id_usuario;

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);

    // Actualizar contraseña
    await db.query(
      'UPDATE usuario SET "contraseña" = $1 WHERE id_usuario = $2',
      [hashedPassword, id_usuario]
    );

    // Eliminar token usado
    otpStorage.delete(`reset_${correo}`);

    res.json({
      mensaje: "Contraseña restablecida exitosamente"
    });

  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};

/**
 * Limpiar códigos OTP expirados (ejecutar periódicamente)
 */
export function limpiarOTPsExpirados() {
  const ahora = Date.now();
  for (const [key, value] of otpStorage.entries()) {
    if (value.expiracion && ahora > value.expiracion) {
      otpStorage.delete(key);
    }
  }
}

// Limpiar OTPs expirados cada 5 minutos
setInterval(limpiarOTPsExpirados, 5 * 60 * 1000);
