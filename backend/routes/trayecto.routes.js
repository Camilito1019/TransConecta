import express from "express";
import {
  crearTrayecto,
  listarTrayectos,
  asignarTrayecto,
  verTrayectoAsignado,
  actualizarTrayecto,
  actualizarAsignacion,
  desasignarTrayecto,
  eliminarTrayecto,
  listarAsignaciones
} from "../controllers/trayecto.controller.js";
import { verifyToken, puedeCrear, puedeModificar } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/trayectos:
 *   post:
 *     summary: Crear un nuevo trayecto
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - origen
 *               - destino
 *             properties:
 *               origen:
 *                 type: string
 *                 description: Lugar de origen
 *                 example: Bogotá
 *               destino:
 *                 type: string
 *                 description: Lugar de destino
 *                 example: Medellín
 *               distancia_km:
 *                 type: number
 *                 format: float
 *                 description: Distancia en kilómetros
 *                 example: 415.5
 *               duracion_estimada:
 *                 type: string
 *                 description: Duración estimada del viaje
 *                 example: 8 horas
 *               descripcion:
 *                 type: string
 *                 description: Descripción adicional del trayecto
 *                 example: Ruta por autopista principal
 *               id_cliente:
 *                 type: integer
 *                 description: ID del cliente asociado (opcional)
 *                 example: 3
 *     responses:
 *       201:
 *         description: Trayecto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Trayecto creado exitosamente
 *                 trayecto:
 *                   $ref: '#/components/schemas/Trayecto'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/trayectos", verifyToken, puedeCrear, crearTrayecto);

/**
 * @swagger
 * /api/trayectos:
 *   get:
 *     summary: Listar todos los trayectos
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de trayectos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trayecto'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/trayectos", verifyToken, listarTrayectos);

/**
 * @swagger
 * /api/trayectos/{id_trayecto}:
 *   put:
 *     summary: Actualizar un trayecto
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_trayecto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trayecto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               origen:
 *                 type: string
 *                 example: Bogotá
 *               destino:
 *                 type: string
 *                 example: Medellín
 *               distancia_km:
 *                 type: number
 *                 format: float
 *                 example: 415.5
 *               duracion_estimada:
 *                 type: string
 *                 example: 8 horas
 *               descripcion:
 *                 type: string
 *                 example: Ruta por autopista principal
 *               id_cliente:
 *                 type: integer
 *                 description: ID del cliente asociado (opcional)
 *                 example: 3
 *     responses:
 *       200:
 *         description: Trayecto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Trayecto actualizado exitosamente
 *                 trayecto:
 *                   $ref: '#/components/schemas/Trayecto'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/trayectos/:id_trayecto", verifyToken, puedeModificar, actualizarTrayecto);

/**
 * @swagger
 * /api/trayectos/{id_trayecto}:
 *   delete:
 *     summary: Eliminar un trayecto
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_trayecto
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trayecto
 *     responses:
 *       200:
 *         description: Trayecto eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/trayectos/:id_trayecto", verifyToken, puedeModificar, eliminarTrayecto);

/**
 * @swagger
 * /api/asignaciones:
 *   post:
 *     summary: Asignar un trayecto a conductor y vehículo
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_trayecto
 *               - id_conductor
 *               - id_vehiculo
 *             properties:
 *               id_trayecto:
 *                 type: integer
 *                 description: ID del trayecto
 *                 example: 1
 *               id_conductor:
 *                 type: integer
 *                 description: ID del conductor
 *                 example: 5
 *               id_vehiculo:
 *                 type: integer
 *                 description: ID del vehículo
 *                 example: 3
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de inicio del viaje
 *                 example: 2024-12-15T08:00:00Z
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha estimada de finalización
 *                 example: 2024-12-15T16:00:00Z
 *     responses:
 *       201:
 *         description: Asignación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Asignación creada exitosamente
 *                 asignacion:
 *                   $ref: '#/components/schemas/Asignacion'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/asignaciones", verifyToken, puedeCrear, asignarTrayecto);

/**
 * @swagger
 * /api/asignaciones:
 *   get:
 *     summary: Listar todas las asignaciones
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Asignacion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/asignaciones", verifyToken, listarAsignaciones);

/**
 * @swagger
 * /api/asignaciones/{id_asignacion}:
 *   get:
 *     summary: Ver detalles de una asignación
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_asignacion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación
 *     responses:
 *       200:
 *         description: Detalles de la asignación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Asignacion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/asignaciones/:id_asignacion", verifyToken, verTrayectoAsignado);

/**
 * @swagger
 * /api/asignaciones/{id_asignacion}:
 *   put:
 *     summary: Actualizar una asignación
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_asignacion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_conductor:
 *                 type: integer
 *                 example: 5
 *               id_vehiculo:
 *                 type: integer
 *                 example: 3
 *               fecha_inicio:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-15T08:00:00Z
 *               fecha_fin:
 *                 type: string
 *                 format: date-time
 *                 example: 2024-12-15T16:00:00Z
 *               estado:
 *                 type: string
 *                 enum: [programado, en_progreso, completado, cancelado]
 *                 example: en_progreso
 *     responses:
 *       200:
 *         description: Asignación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Asignación actualizada exitosamente
 *                 asignacion:
 *                   $ref: '#/components/schemas/Asignacion'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/asignaciones/:id_asignacion", verifyToken, puedeModificar, actualizarAsignacion);

/**
 * @swagger
 * /api/asignaciones/{id_asignacion}:
 *   delete:
 *     summary: Desasignar (eliminar) una asignación
 *     tags: [Trayectos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_asignacion
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la asignación
 *     responses:
 *       200:
 *         description: Asignación eliminada exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/asignaciones/:id_asignacion", verifyToken, puedeModificar, desasignarTrayecto);

export default router;
