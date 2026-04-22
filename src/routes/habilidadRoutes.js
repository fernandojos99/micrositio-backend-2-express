import { Router } from 'express';
import * as habilidadController from '../controllers/habilidadController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * GET /habilidades/empleado/:id
 * Obtener habilidades por empleado
 */
router.get(
  '/empleado/:id',
  authMiddleware,
  soloEditores,
  habilidadController.obtenerPorEmpleado
);

/**
 * POST /habilidades/empleado/:id
 * Crear habilidad para un empleado
 */
router.post(
  '/empleado/:id',
  authMiddleware,
  soloEditores,
  habilidadController.crear
);

/**
 * PUT /habilidades/sync/:id
 * Sincronizar habilidades de un empleado
 */
router.put(
  '/sync/:id',
  authMiddleware,
  soloEditores,
  habilidadController.sync
);

/**
 * PUT /habilidades/:id
 * Actualizar habilidad
 */
router.put(
  '/:id',
  authMiddleware,
  soloEditores,
  habilidadController.actualizar
);

/**
 * DELETE /habilidades/:id
 * Eliminar habilidad
 */
router.delete(
  '/:id',
  authMiddleware,
  soloEditores,
  habilidadController.eliminar
);

export default router;