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
import { verifyToken, puedeModificar } from "../middleware/auth.middleware.js";

const router = express.Router();

// Rutas para Roles - Solo ADMINISTRADOR puede modificar roles
router.get("/roles", verifyToken, obtenerRoles);
router.post("/roles", verifyToken, puedeModificar, crearRol);
router.get("/roles/:id_rol", verifyToken, obtenerRolPorId);
router.put("/roles/:id_rol", verifyToken, puedeModificar, actualizarRol);
router.delete("/roles/:id_rol", verifyToken, puedeModificar, eliminarRol);

// Rutas para Asignación de Roles a Usuarios - Solo ADMINISTRADOR
router.put("/usuarios/:id_usuario/rol", verifyToken, puedeModificar, asignarRolAUsuario);
router.get("/usuarios/:id_usuario/con-rol", verifyToken, obtenerUsuarioConRol);
router.get("/usuarios/con-roles/todos", verifyToken, obtenerUsuariosConRoles);

export default router;
