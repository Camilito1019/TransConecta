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

const router = express.Router();

// Trayectos CRUD
router.post("/trayectos", crearTrayecto);
router.get("/trayectos", listarTrayectos);
router.put("/trayectos/:id_trayecto", actualizarTrayecto);
router.delete("/trayectos/:id_trayecto", eliminarTrayecto);

// Asignaciones
router.post("/asignaciones", asignarTrayecto);
router.get("/asignaciones", listarAsignaciones);
router.get("/asignaciones/:id_asignacion", verTrayectoAsignado);
router.put("/asignaciones/:id_asignacion", actualizarAsignacion);
router.delete("/asignaciones/:id_asignacion", desasignarTrayecto);

export default router;
