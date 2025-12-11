import { Router } from 'express';
import { verifyToken, soloAdministrador } from '../middleware/auth.middleware.js';
import {
  obtenerPermisosModulos,
  actualizarPermisosRol,
  restaurarPermisos,
  obtenerPermisosDeRol
} from '../controllers/modulo.controller.js';

const router = Router();

router.get('/modulos/permisos/rol/:rol', verifyToken, obtenerPermisosDeRol);
router.get('/modulos/permisos', verifyToken, soloAdministrador, obtenerPermisosModulos);
router.put('/modulos/permisos/:rol', verifyToken, soloAdministrador, actualizarPermisosRol);
router.post('/modulos/permisos/reset', verifyToken, soloAdministrador, restaurarPermisos);

export default router;
