import { Router } from 'express';
import * as accionableController from '../controllers/accionableController.js';

const router = Router();

/**
 * GET /accionables
 * Obtener todos los accionables
 */
// router.get('/', accionableController.obtenerTodos);


/**
 * GET /accionables/:id
 * Obtener accionable por ID
 */
router.get('/:id',authMiddleware, accionableController.obtenerPorId);


/**
 * POST /accionables
 * Crear accionable
 */
router.post('/', authMiddleware,accionableController.crear);

/**
 * PUT /accionables/sync
 */
router.put("/sync/:id", authMiddleware,accionableController.sync);

/**
 * PUT /accionables/:id
 * Actualizar accionable
 */
router.put('/:id', authMiddleware,accionableController.actualizar);


/**
 * DELETE /accionables/:id
 * Eliminar accionable
 */
router.delete('/:id', authMiddleware,accionableController.eliminar);


router.get(
  '/learning-card/:id/accionables',authMiddleware,
  accionableController.obtenerPorLearningCard
);


/**
 * GET /accionables/testing-card/:id
 * Obtener accionables por testing card
 */
router.get('/testing-card/:id/accionables',accionableController.obtenerPorTestingCard);
/**
 * GET /accionables/secuencia/:id
 * Obtener accionables por secuencia
 */
router.get('/secuencia/:id/accionables', accionableController.obtenerPorSecuencia);
/**
 * GET /accionables/proyecto/:id
 * Obtener accionables por proyecto
 */
router.get('/proyecto/:id/accionables', accionableController.obtenerPorProyecto);


export default router;

