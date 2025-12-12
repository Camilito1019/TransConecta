import { Router } from 'express';
import { verifyToken, requierePermiso } from '../middleware/auth.middleware.js';
import {
  obtenerPermisosModulos,
  actualizarPermisosRol,
  restaurarPermisos,
  obtenerPermisosDeRol
} from '../controllers/modulo.controller.js';

const router = Router();

router.get('/modulos/permisos/rol/:rol', verifyToken, obtenerPermisosDeRol);
router.get('/modulos/permisos', verifyToken, requierePermiso('modulos', 'ver'), obtenerPermisosModulos);
router.put('/modulos/permisos/:rol', verifyToken, requierePermiso('modulos', 'editar'), actualizarPermisosRol);
router.post('/modulos/permisos/reset', verifyToken, requierePermiso('modulos', 'eliminar'), restaurarPermisos);

export default router;
