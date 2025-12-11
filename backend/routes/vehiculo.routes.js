import express from "express";
import {
  crearVehiculo,
  listarVehiculos,
  obtenerVehiculo,
  actualizarVehiculo,
  desactivarVehiculo,
  activarVehiculo,
  eliminarVehiculo,
  registrarEstadoOperativo,
  subirDocumento,
  listarDocumentos,
  obtenerDocumento,
  obtenerHistorialVehiculo,
  descargarDocumento
} from "../controllers/vehiculo.controller.js";
import { upload } from "../config/multer.config.js";
import { verifyToken, puedeCrear, puedeModificar } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/vehiculos:
 *   post:
 *     summary: Crear un nuevo vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - placa
 *               - tipo
 *               - marca
 *               - modelo
 *             properties:
 *               placa:
 *                 type: string
 *                 description: Placa del vehículo
 *                 example: ABC123
 *               tipo:
 *                 type: string
 *                 description: Tipo de vehículo
 *                 example: Camión
 *               marca:
 *                 type: string
 *                 description: Marca del vehículo
 *                 example: Volvo
 *               modelo:
 *                 type: string
 *                 description: Modelo del vehículo
 *                 example: FH16
 *               ano:
 *                 type: integer
 *                 description: Año del vehículo
 *                 example: 2022
 *               capacidad:
 *                 type: string
 *                 description: Capacidad del vehículo
 *                 example: 30 toneladas
 *     responses:
 *       201:
 *         description: Vehículo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Vehículo creado exitosamente
 *                 vehiculo:
 *                   $ref: '#/components/schemas/Vehiculo'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/vehiculos", verifyToken, puedeCrear, crearVehiculo);

/**
 * @swagger
 * /api/vehiculos:
 *   get:
 *     summary: Listar todos los vehículos
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de vehículos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Vehiculo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/vehiculos", verifyToken, listarVehiculos);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}:
 *   get:
 *     summary: Obtener un vehículo por ID
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Vehículo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Vehiculo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/vehiculos/:id_vehiculo", verifyToken, obtenerVehiculo);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}:
 *   put:
 *     summary: Actualizar un vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               placa:
 *                 type: string
 *                 example: ABC123
 *               tipo:
 *                 type: string
 *                 example: Camión
 *               marca:
 *                 type: string
 *                 example: Volvo
 *               modelo:
 *                 type: string
 *                 example: FH16
 *               ano:
 *                 type: integer
 *                 example: 2022
 *               capacidad:
 *                 type: string
 *                 example: 30 toneladas
 *     responses:
 *       200:
 *         description: Vehículo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Vehículo actualizado exitosamente
 *                 vehiculo:
 *                   $ref: '#/components/schemas/Vehiculo'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/vehiculos/:id_vehiculo", verifyToken, puedeModificar, actualizarVehiculo);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}/desactivar:
 *   patch:
 *     summary: Desactivar un vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Vehículo desactivado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch("/vehiculos/:id_vehiculo/desactivar", verifyToken, puedeModificar, desactivarVehiculo);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}/activar:
 *   patch:
 *     summary: Activar un vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Vehículo activado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch("/vehiculos/:id_vehiculo/activar", verifyToken, puedeModificar, activarVehiculo);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}/estado:
 *   patch:
 *     summary: Registrar estado operativo del vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado_operativo
 *             properties:
 *               estado_operativo:
 *                 type: string
 *                 enum: [disponible, en_ruta, mantenimiento, fuera_de_servicio]
 *                 description: Nuevo estado operativo
 *                 example: en_ruta
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch("/vehiculos/:id_vehiculo/estado", verifyToken, puedeModificar, registrarEstadoOperativo);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}:
 *   delete:
 *     summary: Eliminar un vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Vehículo eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/vehiculos/:id_vehiculo", verifyToken, puedeModificar, eliminarVehiculo);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}/documentos:
 *   post:
 *     summary: Subir un documento al vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - archivo
 *               - tipo_documento
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo a subir
 *               tipo_documento:
 *                 type: string
 *                 description: Tipo de documento
 *                 example: SOAT
 *     responses:
 *       201:
 *         description: Documento subido exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/vehiculos/:id_vehiculo/documentos", verifyToken, puedeModificar, upload.single("archivo"), subirDocumento);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}/documentos:
 *   get:
 *     summary: Listar documentos de un vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Lista de documentos
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/vehiculos/:id_vehiculo/documentos", verifyToken, listarDocumentos);

/**
 * @swagger
 * /api/documentos/{id_documento}:
 *   get:
 *     summary: Obtener información de un documento
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_documento
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Información del documento
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/documentos/:id_documento", verifyToken, obtenerDocumento);

/**
 * @swagger
 * /api/documentos/{id_documento}/descargar:
 *   get:
 *     summary: Descargar un documento
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_documento
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *     responses:
 *       200:
 *         description: Archivo descargado
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/documentos/:id_documento/descargar", verifyToken, descargarDocumento);

/**
 * @swagger
 * /api/vehiculos/{id_vehiculo}/historial:
 *   get:
 *     summary: Obtener historial del vehículo
 *     tags: [Vehículos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_vehiculo
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Historial del vehículo
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/vehiculos/:id_vehiculo/historial", verifyToken, obtenerHistorialVehiculo);

export default router;
