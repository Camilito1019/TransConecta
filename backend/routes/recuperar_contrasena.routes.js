import express from "express";
import {
  solicitarOTP,
  verificarOTP,
  restablecerContrasena
} from "../controllers/recuperar_contrasena.controller.js";

const router = express.Router();

// Rutas públicas para recuperación de contraseña
router.post("/solicitar-otp", solicitarOTP);
router.post("/verificar-otp", verificarOTP);
router.post("/restablecer-contrasena", restablecerContrasena);

export default router;
