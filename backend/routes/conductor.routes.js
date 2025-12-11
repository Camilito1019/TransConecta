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

// CRUD - Crear: ADMINISTRADOR y COORDINADOR
router.post("/conductores", verifyToken, puedeCrear, crearConductor);

// Listar y ver - Todos los autenticados excepto HSEQ
router.get("/conductores", verifyToken, listarConductores);
router.get("/conductores/:id_conductor", verifyToken, obtenerConductor);

// Modificar - Solo ADMINISTRADOR
router.put("/conductores/:id_conductor", verifyToken, puedeModificar, actualizarConductor);
router.patch("/conductores/:id_conductor/desactivar", verifyToken, puedeModificar, desactivarConductor);
router.patch("/conductores/:id_conductor/activar", verifyToken, puedeModificar, activarConductor);
router.delete("/conductores/:id_conductor", verifyToken, puedeModificar, eliminarConductor);

// Detalles e historial - Todos los autenticados
router.get("/conductores/:id_conductor/detalles", verifyToken, verDetallesConductor);
router.get("/conductores/:id_conductor/historial", verifyToken, obtenerHistorialConductor);

// Horas y alertas - HSEQ y ADMINISTRADOR
router.post("/conductores/:id_conductor/horas", verifyToken, accesoHSEQ, registrarHorasConduccion);
router.post("/conductores/:id_conductor/alertas-fatiga", verifyToken, accesoHSEQ, registrarAlertaFatiga);

export default router;
