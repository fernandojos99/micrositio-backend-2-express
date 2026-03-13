import { Router } from 'express';
import * as accionableController from '../controllers/accionableController.js';

const router = Router();

/**
 * GET /accionables
 * Obtener todos los accionables
 */
router.get('/', accionableController.obtenerTodos);


/**
 * GET /accionables/:id
 * Obtener accionable por ID
 */
router.get('/:id', accionableController.obtenerPorId);


/**
 * POST /accionables
 * Crear accionable
 */
router.post('/', accionableController.crear);

/**
 * PUT /accionables/sync
 */
router.put("/sync/:id", accionableController.sync);

/**
 * PUT /accionables/:id
 * Actualizar accionable
 */
router.put('/:id', accionableController.actualizar);


/**
 * DELETE /accionables/:id
 * Eliminar accionable
 */
router.delete('/:id', accionableController.eliminar);


router.get(
  '/learning-card/:id/accionables',
  accionableController.obtenerPorLearningCard
);

export default router;