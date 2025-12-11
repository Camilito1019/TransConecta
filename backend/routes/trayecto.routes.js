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

// Trayectos CRUD - Crear: ADMINISTRADOR y COORDINADOR
router.post("/trayectos", verifyToken, puedeCrear, crearTrayecto);
router.get("/trayectos", verifyToken, listarTrayectos);

// Modificar - Solo ADMINISTRADOR
router.put("/trayectos/:id_trayecto", verifyToken, puedeModificar, actualizarTrayecto);
router.delete("/trayectos/:id_trayecto", verifyToken, puedeModificar, eliminarTrayecto);

// Asignaciones - Crear: ADMINISTRADOR y COORDINADOR
router.post("/asignaciones", verifyToken, puedeCrear, asignarTrayecto);
router.get("/asignaciones", verifyToken, listarAsignaciones);
router.get("/asignaciones/:id_asignacion", verifyToken, verTrayectoAsignado);

// Modificar asignaciones - Solo ADMINISTRADOR
router.put("/asignaciones/:id_asignacion", verifyToken, puedeModificar, actualizarAsignacion);
router.delete("/asignaciones/:id_asignacion", verifyToken, puedeModificar, desasignarTrayecto);

export default router;
