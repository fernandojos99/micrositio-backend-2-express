// src/routes/experimentoTipoRoutes.js
/**
 * Módulo de rutas para experimento_tipo.
 * @module routes/experimentoTipoRoutes
 */

import express from 'express';
import ExperimentoTipoController from '../controllers/experimentoTipoController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const experimentoTipoController = new ExperimentoTipoController();

/**
 * Ruta GET para obtener un tipo de experimento específico.
 * @name get/experimento_tipo/e
 * @function
 */
router.get('/e', authMiddleware, experimentoTipoController.obtenerPorId.bind(experimentoTipoController));

/**
 * Ruta GET para obtener todos los tipos de experimento.
 * @name get/experimento_tipo
 * @function
 */
router.get('/', authMiddleware, experimentoTipoController.obtenerTodos.bind(experimentoTipoController));

/**
 * Ruta POST para crear un nuevo tipo de experimento.
 * @name post/experimento_tipo
 * @function
 */
router.post('/', authMiddleware, soloEditores, experimentoTipoController.crear.bind(experimentoTipoController));

/**
 * Ruta PATCH para actualizar un tipo de experimento existente.
 * @name patch/experimento_tipo
 * @function
 */
router.patch('/', authMiddleware, soloEditores, experimentoTipoController.actualizar.bind(experimentoTipoController));

/**
 * Ruta DELETE para eliminar un tipo de experimento.
 * @name delete/experimento_tipo
 * @function
 */
router.delete('/', authMiddleware, soloEditores, experimentoTipoController.eliminar.bind(experimentoTipoController));

export default router;