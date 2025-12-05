import express from "express";
import { loginUsuario, logoutUsuario } from "../controllers/auth.controller.js";

const router = express.Router();

// Ruta para iniciar sesión
router.post("/login", loginUsuario);

// Ruta para cerrar sesión
router.post("/logout", logoutUsuario);

export default router;
