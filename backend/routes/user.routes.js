import express from "express";
import {
	registrarUsuario,
	listarUsuarios,
	verUsuario,
	actualizarUsuario,
	inactivarUsuario,
    activarUsuario,
	eliminarUsuario
} from "../controllers/user.controller.js";
import { verifyToken, puedeCrear, puedeModificar } from "../middleware/auth.middleware.js";

const router = express.Router();

// Alta de usuarios - Solo ADMINISTRADOR y COORDINADOR pueden crear
router.post("/usuarios", verifyToken, puedeCrear, registrarUsuario);
// Alias legacy, por si algún cliente usa /register
router.post("/register", verifyToken, puedeCrear, registrarUsuario);

// Listar y ver - Todos los autenticados
router.get("/usuarios", verifyToken, listarUsuarios);
router.get("/usuarios/:id_usuario", verifyToken, verUsuario);

// Modificar - Solo ADMINISTRADOR
router.put("/usuarios/:id_usuario", verifyToken, puedeModificar, actualizarUsuario);
router.patch("/usuarios/:id_usuario/inactivar", verifyToken, puedeModificar, inactivarUsuario);
router.patch("/usuarios/:id_usuario/activar", verifyToken, puedeModificar, activarUsuario);
router.delete("/usuarios/:id_usuario", verifyToken, puedeModificar, eliminarUsuario);


export default router;
