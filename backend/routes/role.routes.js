import express from "express";
import {
  obtenerRoles,
  crearRol,
  obtenerRolPorId,
  actualizarRol,
  asignarRolAUsuario,
  obtenerUsuarioConRol,
  obtenerUsuariosConRoles,
  eliminarRol
} from "../controllers/role.controller.js";
import { verifyToken, requierePermiso, requiereAlgunoPermiso } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Obtener todos los roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Rol'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  "/roles",
  verifyToken,
  requiereAlgunoPermiso([
    { modulo: "roles", accion: "ver" },
    { modulo: "usuarios", accion: "ver" },
    { modulo: "usuarios", accion: "crear" },
    { modulo: "usuarios", accion: "editar" },
    { modulo: "usuarios", accion: "desactivar" },
    { modulo: "usuarios", accion: "eliminar" }
  ]),
  obtenerRoles
);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Crear un nuevo rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre_rol
 *             properties:
 *               nombre_rol:
 *                 type: string
 *                 description: Nombre del rol
 *                 example: SUPERVISOR
 *               puede_crear:
 *                 type: boolean
 *                 description: Permiso para crear recursos
 *                 example: true
 *               puede_modificar:
 *                 type: boolean
 *                 description: Permiso para modificar recursos
 *                 example: false
 *               puede_eliminar:
 *                 type: boolean
 *                 description: Permiso para eliminar recursos
 *                 example: false
 *               acceso_hseq:
 *                 type: boolean
 *                 description: Acceso a funcionalidades HSEQ
 *                 example: false
 *     responses:
 *       201:
 *         description: Rol creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Rol creado exitosamente
 *                 rol:
 *                   $ref: '#/components/schemas/Rol'
 *       400:
 *         $ref: '#/components/responses/BadRequestError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post("/roles", verifyToken, requierePermiso('roles', 'crear'), crearRol);

/**
 * @swagger
 * /api/roles/{id_rol}:
 *   get:
 *     summary: Obtener un rol por ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_rol
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Rol encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Rol'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  "/roles/:id_rol",
  verifyToken,
  requiereAlgunoPermiso([
    { modulo: "roles", accion: "ver" },
    { modulo: "usuarios", accion: "ver" },
    { modulo: "usuarios", accion: "crear" },
    { modulo: "usuarios", accion: "editar" },
    { modulo: "usuarios", accion: "desactivar" },
    { modulo: "usuarios", accion: "eliminar" }
  ]),
  obtenerRolPorId
);

/**
 * @swagger
 * /api/roles/{id_rol}:
 *   put:
 *     summary: Actualizar un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_rol
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre_rol:
 *                 type: string
 *                 example: SUPERVISOR
 *               puede_crear:
 *                 type: boolean
 *                 example: true
 *               puede_modificar:
 *                 type: boolean
 *                 example: true
 *               puede_eliminar:
 *                 type: boolean
 *                 example: false
 *               acceso_hseq:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: Rol actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Rol actualizado exitosamente
 *                 rol:
 *                   $ref: '#/components/schemas/Rol'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/roles/:id_rol", verifyToken, requierePermiso('roles', 'editar'), actualizarRol);

/**
 * @swagger
 * /api/roles/{id_rol}:
 *   delete:
 *     summary: Eliminar un rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_rol
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del rol
 *     responses:
 *       200:
 *         description: Rol eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Rol eliminado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.delete("/roles/:id_rol", verifyToken, requierePermiso('roles', 'eliminar'), eliminarRol);

/**
 * @swagger
 * /api/usuarios/{id_usuario}/rol:
 *   put:
 *     summary: Asignar un rol a un usuario
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_rol
 *             properties:
 *               id_rol:
 *                 type: integer
 *                 description: ID del rol a asignar
 *                 example: 2
 *     responses:
 *       200:
 *         description: Rol asignado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: Rol asignado exitosamente
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.put("/usuarios/:id_usuario/rol", verifyToken, requierePermiso('roles', 'editar'), asignarRolAUsuario);

/**
 * @swagger
 * /api/usuarios/{id_usuario}/con-rol:
 *   get:
 *     summary: Obtener usuario con su rol
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id_usuario
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario con rol
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get("/usuarios/:id_usuario/con-rol", verifyToken, requierePermiso('roles', 'ver'), obtenerUsuarioConRol);

/**
 * @swagger
 * /api/usuarios/con-roles/todos:
 *   get:
 *     summary: Obtener todos los usuarios con sus roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios con roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usuario'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get("/usuarios/con-roles/todos", verifyToken, requierePermiso('roles', 'ver'), obtenerUsuariosConRoles);

export default router;
