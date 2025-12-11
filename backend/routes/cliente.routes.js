import express from "express";
import {
  crearCliente,
  listarClientes,
  verCliente,
  actualizarCliente,
  desactivarCliente,
  activarCliente,
  eliminarCliente
} from "../controllers/cliente.controller.js";
import { verifyToken, soloAdministrador, puedeCrear } from "../middleware/auth.middleware.js";

const router = express.Router();

// CRUD de clientes (lectura para admins/coordinadores; gestión solo admin)
router.post("/clientes", verifyToken, soloAdministrador, crearCliente);
router.get("/clientes", verifyToken, puedeCrear, listarClientes);
router.get("/clientes/:id_cliente", verifyToken, puedeCrear, verCliente);
router.put("/clientes/:id_cliente", verifyToken, soloAdministrador, actualizarCliente);
router.patch("/clientes/:id_cliente/desactivar", verifyToken, soloAdministrador, desactivarCliente);
router.patch("/clientes/:id_cliente/activar", verifyToken, soloAdministrador, activarCliente);
router.delete("/clientes/:id_cliente", verifyToken, soloAdministrador, eliminarCliente);

export default router;
