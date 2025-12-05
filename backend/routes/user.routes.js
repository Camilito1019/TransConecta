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

const router = express.Router();

router.post("/register", registrarUsuario);
router.get("/usuarios", listarUsuarios);
router.get("/usuarios/:id_usuario", verUsuario);
router.put("/usuarios/:id_usuario", actualizarUsuario);
router.patch("/usuarios/:id_usuario/inactivar", inactivarUsuario);
router.patch("/usuarios/:id_usuario/activar", activarUsuario);
router.delete("/usuarios/:id_usuario", eliminarUsuario);


export default router;
