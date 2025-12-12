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
import { verifyToken, requierePermiso } from "../middleware/auth.middleware.js";

const router = express.Router();

// CRUD de clientes (lectura para admins/coordinadores; gestión solo admin)
router.post("/clientes", verifyToken, requierePermiso('clientes', 'crear'), crearCliente);
router.get("/clientes", verifyToken, requierePermiso('clientes', 'ver'), listarClientes);
router.get("/clientes/:id_cliente", verifyToken, requierePermiso('clientes', 'ver'), verCliente);
router.put("/clientes/:id_cliente", verifyToken, requierePermiso('clientes', 'editar'), actualizarCliente);
router.patch("/clientes/:id_cliente/desactivar", verifyToken, requierePermiso('clientes', 'desactivar'), desactivarCliente);
router.patch("/clientes/:id_cliente/activar", verifyToken, requierePermiso('clientes', 'desactivar'), activarCliente);
router.delete("/clientes/:id_cliente", verifyToken, requierePermiso('clientes', 'eliminar'), eliminarCliente);

export default router;
