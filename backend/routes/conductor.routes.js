import express from "express";
import {
  crearConductor,
  listarConductores,
  obtenerConductor,
  actualizarConductor,
  desactivarConductor,
  activarConductor,
  verDetallesConductor,
  obtenerHistorialConductor,
  registrarHorasConduccion,
  registrarAlertaFatiga
} from "../controllers/conductor.controller.js";

const router = express.Router();

// CRUD
router.post("/conductores", crearConductor);
router.get("/conductores", listarConductores);
router.get("/conductores/:id_conductor", obtenerConductor);
router.put("/conductores/:id_conductor", actualizarConductor);
router.patch("/conductores/:id_conductor/desactivar", desactivarConductor);
router.patch("/conductores/:id_conductor/activar", activarConductor);

// Detalles e historial
router.get("/conductores/:id_conductor/detalles", verDetallesConductor);
router.get("/conductores/:id_conductor/historial", obtenerHistorialConductor);

// Horas y alertas
router.post("/conductores/:id_conductor/horas", registrarHorasConduccion);
router.post("/conductores/:id_conductor/alertas-fatiga", registrarAlertaFatiga);

export default router;
