// src/routes/celulaProyectoRoutes.js
/**
 * Módulo de rutas para célula_proyecto.
 * @module routes/celulaProyectoRoutes
 */

import express from 'express';
import CelulaProyectoController from '../controllers/celulaProyectoController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const celulaProyectoController = new CelulaProyectoController();

/**
 * Obtiene relaciones por ID de empleado.
 * @name get/celula_proyecto/e
 * @function
 */
router.get('/e', authMiddleware, celulaProyectoController.obtenerPorEmpleado.bind(celulaProyectoController));

router.post('/e', authMiddleware, celulaProyectoController.obtenerPorEmpleado.bind(celulaProyectoController));

/**
 * Obtiene relaciones por ID de proyecto.
 * @name get/celula_proyecto/p
 * @function
 */
router.get('/p', authMiddleware, celulaProyectoController.obtenerPorProyecto.bind(celulaProyectoController));

router.post('/p', authMiddleware, celulaProyectoController.obtenerPorProyecto.bind(celulaProyectoController));

/**
 * Obtiene todas las relaciones célula-proyecto.
 * @name get/celula_proyecto
 * @function
 */
router.get('/', authMiddleware, celulaProyectoController.obtenerTodos.bind(celulaProyectoController));

/**
 * Crea una nueva relación célula-proyecto.
 * @name post/celula_proyecto
 * @function
 */
router.post('/', authMiddleware, soloEditores, celulaProyectoController.crear.bind(celulaProyectoController));

/**
 * Elimina una relación célula-proyecto.
 * @name delete/celula_proyecto
 * @function
 */
router.delete('/', authMiddleware, soloEditores, celulaProyectoController.eliminar.bind(celulaProyectoController));

/**
 * Actualiza el estado activo de una relación célula-proyecto.
 * @name patch/celula_proyecto
 * @function
 */
router.patch('/', authMiddleware, soloEditores, celulaProyectoController.actualizarActivo.bind(celulaProyectoController));

export default router;