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

// Rutas básicas de vehículos
// Crear - Solo ADMINISTRADOR y COORDINADOR
router.post("/vehiculos", verifyToken, puedeCrear, crearVehiculo);

// Listar y ver - Todos los autenticados
router.get("/vehiculos", verifyToken, listarVehiculos);
router.get("/vehiculos/:id_vehiculo", verifyToken, obtenerVehiculo);

// Modificar - Solo ADMINISTRADOR
router.put("/vehiculos/:id_vehiculo", verifyToken, puedeModificar, actualizarVehiculo);
router.patch("/vehiculos/:id_vehiculo/desactivar", verifyToken, puedeModificar, desactivarVehiculo);
router.patch("/vehiculos/:id_vehiculo/activar", verifyToken, puedeModificar, activarVehiculo);
router.patch("/vehiculos/:id_vehiculo/estado", verifyToken, puedeModificar, registrarEstadoOperativo);
router.delete("/vehiculos/:id_vehiculo", verifyToken, puedeModificar, eliminarVehiculo);

// Rutas de documentos - Solo ADMINISTRADOR puede modificar
router.post("/vehiculos/:id_vehiculo/documentos", verifyToken, puedeModificar, upload.single("archivo"), subirDocumento);
router.get("/vehiculos/:id_vehiculo/documentos", verifyToken, listarDocumentos);
router.get("/documentos/:id_documento", verifyToken, obtenerDocumento);
router.get("/documentos/:id_documento/descargar", verifyToken, descargarDocumento);

// Historial - Todos los autenticados
router.get("/vehiculos/:id_vehiculo/historial", verifyToken, obtenerHistorialVehiculo);

export default router;
