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

const router = express.Router();

// Rutas básicas de vehículos
router.post("/vehiculos", crearVehiculo);
router.get("/vehiculos", listarVehiculos);
router.get("/vehiculos/:id_vehiculo", obtenerVehiculo);
router.put("/vehiculos/:id_vehiculo", actualizarVehiculo);
router.patch("/vehiculos/:id_vehiculo/desactivar", desactivarVehiculo);
router.patch("/vehiculos/:id_vehiculo/activar", activarVehiculo);
router.patch("/vehiculos/:id_vehiculo/estado", registrarEstadoOperativo);
router.delete("/vehiculos/:id_vehiculo", eliminarVehiculo);

// Rutas de documentos
router.post("/vehiculos/:id_vehiculo/documentos", upload.single("archivo"), subirDocumento);
router.get("/vehiculos/:id_vehiculo/documentos", listarDocumentos);
router.get("/documentos/:id_documento", obtenerDocumento);
router.get("/documentos/:id_documento/descargar", descargarDocumento);

// Historial
router.get("/vehiculos/:id_vehiculo/historial", obtenerHistorialVehiculo);

export default router;
