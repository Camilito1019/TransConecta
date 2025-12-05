import express from "express";
import { loginUsuario, logoutUsuario, obtenerPerfil, actualizarPerfil } from "../controllers/auth.controller.js";

const router = express.Router();

// Ruta para iniciar sesión
router.post("/login", loginUsuario);

// Ruta para cerrar sesión
router.post("/logout", logoutUsuario);

// Perfil del usuario autenticado
router.get("/me", obtenerPerfil);
router.put("/me", actualizarPerfil);

export default router;
