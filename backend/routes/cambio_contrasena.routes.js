import express from "express";
import {
  cambiarContrasena
} from "../controllers/cambio_contrasena.controller.js";

const router = express.Router();

// Rutas para cambio de contraseña
router.post("/cambiar-contrasena", cambiarContrasena);
export default router;
