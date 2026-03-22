import { Router } from 'express';
import * as accionableController from '../controllers/accionableController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

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
router.get('/:id', authMiddleware, soloEditores, accionableController.obtenerPorId);


/**
 * POST /accionables
 * Crear accionable
 */
router.post('/', authMiddleware, soloEditores,accionableController.crear);

/**
 * PUT /accionables/sync
 */
router.put("/sync/:id", authMiddleware, soloEditores,accionableController.sync);

/**
 * PUT /accionables/:id
 * Actualizar accionable
 */
router.put('/:id', authMiddleware, soloEditores,accionableController.actualizar);


/**
 * DELETE /accionables/:id
 * Eliminar accionable
 */
router.delete('/:id', authMiddleware, soloEditores,accionableController.eliminar);


router.get(
  '/learning-card/:id/accionables', authMiddleware, soloEditores,
  accionableController.obtenerPorLearningCard
);


/**
 * GET /accionables/testing-card/:id
 * Obtener accionables por testing card
 */
router.get('/testing-card/:id/accionables', authMiddleware, soloEditores,accionableController.obtenerPorTestingCard);
/**
 * GET /accionables/secuencia/:id
 * Obtener accionables por secuencia
 */
router.get('/secuencia/:id/accionables',authMiddleware, soloEditores, accionableController.obtenerPorSecuencia);
/**
 * GET /accionables/proyecto/:id
 * Obtener accionables por proyecto
 */
router.get('/proyecto/:id/accionables', authMiddleware, soloEditores, accionableController.obtenerPorProyecto);


export default router;

