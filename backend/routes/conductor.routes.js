import express from "express";
import {
  crearConductor,
  listarConductores,
  obtenerConductor,
  actualizarConductor,
  desactivarConductor,
  activarConductor,
  eliminarConductor,
  verDetallesConductor,
  obtenerHistorialConductor,
  registrarHorasConduccion,
  registrarAlertaFatiga
} from "../controllers/conductor.controller.js";
import { verifyToken, puedeCrear, puedeModificar, accesoHSEQ } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/conductores:
 *   post:
 *     summary: Crear un nuevo conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - cedula
 *               - licencia
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre completo del conductor
 *                 example: Carlos Ramírez
 *               cedula:
 *                 type: string
 *                 description: Número de cédula
 *                 example: 1234567890
 *               licencia:
 *                 type: string
 *                 description: Número de licencia de conducción
 *                 example: C2-98765432
 *               telefono:
 *                 type: string
 *                 description: Teléfono del conductor
 *                 example: 3001234567
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Correo electrónico
 *                 example: carlos.ramirez@transconecta.com
 *     responses:
 *       201:
 *         description: Conductor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Conductor creado exitosamente
 *                 conductor:
 *                   $ref: '#/components/schemas/Conductor'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/conductores", verifyToken, puedeCrear, crearConductor);

/**
 * @swagger
 * /api/conductores:
 *   get:
 *     summary: Listar todos los conductores
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conductores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conductor'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/conductores", verifyToken, listarConductores);

/**
 * @swagger
 * /api/conductores/{id_conductor}:
 *   get:
 *     summary: Obtener un conductor por ID
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Conductor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conductor'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/conductores/:id_conductor", verifyToken, obtenerConductor);

/**
 * @swagger
 * /api/conductores/{id_conductor}:
 *   put:
 *     summary: Actualizar un conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Carlos Ramírez
 *               cedula:
 *                 type: string
 *                 example: 1234567890
 *               licencia:
 *                 type: string
 *                 example: C2-98765432
 *               telefono:
 *                 type: string
 *                 example: 3001234567
 *               email:
 *                 type: string
 *                 format: email
 *                 example: carlos.ramirez@transconecta.com
 *     responses:
 *       200:
 *         description: Conductor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Conductor actualizado exitosamente
 *                 conductor:
 *                   $ref: '#/components/schemas/Conductor'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/conductores/:id_conductor", verifyToken, puedeModificar, actualizarConductor);

/**
 * @swagger
 * /api/conductores/{id_conductor}/desactivar:
 *   patch:
 *     summary: Desactivar un conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Conductor desactivado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch("/conductores/:id_conductor/desactivar", verifyToken, puedeModificar, desactivarConductor);

/**
 * @swagger
 * /api/conductores/{id_conductor}/activar:
 *   patch:
 *     summary: Activar un conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Conductor activado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch("/conductores/:id_conductor/activar", verifyToken, puedeModificar, activarConductor);

/**
 * @swagger
 * /api/conductores/{id_conductor}:
 *   delete:
 *     summary: Eliminar un conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Conductor eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/conductores/:id_conductor", verifyToken, puedeModificar, eliminarConductor);

/**
 * @swagger
 * /api/conductores/{id_conductor}/detalles:
 *   get:
 *     summary: Ver detalles completos del conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Detalles del conductor
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/conductores/:id_conductor/detalles", verifyToken, verDetallesConductor);

/**
 * @swagger
 * /api/conductores/{id_conductor}/historial:
 *   get:
 *     summary: Obtener historial del conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Historial del conductor
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/conductores/:id_conductor/historial", verifyToken, obtenerHistorialConductor);

/**
 * @swagger
 * /api/conductores/{id_conductor}/horas:
 *   post:
 *     summary: Registrar horas de conducción (Solo HSEQ y Administrador)
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - horas
 *               - fecha
 *             properties:
 *               horas:
 *                 type: number
 *                 format: float
 *                 description: Horas de conducción
 *                 example: 8.5
 *               fecha:
 *                 type: string
 *                 format: date
 *                 description: Fecha de las horas
 *                 example: 2024-12-10
 *     responses:
 *       201:
 *         description: Horas registradas exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/conductores/:id_conductor/horas", verifyToken, accesoHSEQ, registrarHorasConduccion);

/**
 * @swagger
 * /api/conductores/{id_conductor}/alertas-fatiga:
 *   post:
 *     summary: Registrar alerta de fatiga (Solo HSEQ y Administrador)
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_conductor
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del conductor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nivel_alerta
 *               - descripcion
 *             properties:
 *               nivel_alerta:
 *                 type: string
 *                 enum: [bajo, medio, alto, critico]
 *                 description: Nivel de la alerta
 *                 example: alto
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la alerta
 *                 example: Conductor excedió 10 horas de conducción continua
 *     responses:
 *       201:
 *         description: Alerta registrada exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/conductores/:id_conductor/alertas-fatiga", verifyToken, accesoHSEQ, registrarAlertaFatiga);

export default router;
