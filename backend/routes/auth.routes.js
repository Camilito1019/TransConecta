import express from "express";
import { loginUsuario, logoutUsuario, obtenerPerfil, actualizarPerfil } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Ruta para iniciar sesión - NO requiere autenticación
router.post("/login", loginUsuario);

// Ruta para cerrar sesión - NO requiere autenticación (se borra el token en el cliente)
router.post("/logout", logoutUsuario);

// Perfil del usuario autenticado - SÍ requiere autenticación
router.get("/me", verifyToken, obtenerPerfil);
router.put("/me", verifyToken, actualizarPerfil);

export default router;
