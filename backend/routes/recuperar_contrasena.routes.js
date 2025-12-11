import express from "express";
import {
  solicitarOTP,
  verificarOTP,
  restablecerContrasena
} from "../controllers/recuperar_contrasena.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/solicitar-otp:
 *   post:
 *     summary: Solicitar código OTP para recuperar contraseña
 *     tags: [Contraseñas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: usuario@transconecta.com
 *     responses:
 *       200:
 *         description: OTP enviado al correo electrónico
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Código OTP enviado al correo electrónico
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post("/solicitar-otp", solicitarOTP);

/**
 * @swagger
 * /api/verificar-otp:
 *   post:
 *     summary: Verificar código OTP
 *     tags: [Contraseñas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: usuario@transconecta.com
 *               otp:
 *                 type: string
 *                 description: Código OTP recibido por correo
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verificado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: OTP verificado exitosamente
 *                 token:
 *                   type: string
 *                   description: Token temporal para restablecer contraseña
 *       400:
 *         description: OTP inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: OTP inválido o expirado
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post("/verificar-otp", verificarOTP);

/**
 * @swagger
 * /api/restablecer-contrasena:
 *   post:
 *     summary: Restablecer contraseña con token de verificación
 *     tags: [Contraseñas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - contrasena_nueva
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: usuario@transconecta.com
 *               token:
 *                 type: string
 *                 description: Token temporal obtenido al verificar OTP
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *               contrasena_nueva:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Contraseña restablecida exitosamente
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: Token inválido o expirado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Token inválido o expirado
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post("/restablecer-contrasena", restablecerContrasena);

export default router;
