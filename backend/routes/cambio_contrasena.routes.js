import express from "express";
import {
  cambiarContrasena
} from "../controllers/cambio_contrasena.controller.js";

const router = express.Router();

/**
 * @swagger
 * /api/cambiar-contrasena:
 *   post:
 *     summary: Cambiar contraseña de un usuario
 *     tags: [Contraseñas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - contrasena_actual
 *               - contrasena_nueva
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico del usuario
 *                 example: usuario@transconecta.com
 *               contrasena_actual:
 *                 type: string
 *                 format: password
 *                 description: Contraseña actual
 *                 example: OldPassword123!
 *               contrasena_nueva:
 *                 type: string
 *                 format: password
 *                 description: Nueva contraseña
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Contraseña cambiada exitosamente
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         description: Contraseña actual incorrecta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Contraseña actual incorrecta
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post("/cambiar-contrasena", cambiarContrasena);
export default router;
