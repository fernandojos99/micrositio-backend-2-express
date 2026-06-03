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
 * Obtiene todas las relaciones célula-proyecto.
 * Soporta filtros por query: ?empleadoId= y ?proyectoId=
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
 * Actualiza el estado activo de una relación célula-proyecto.
 * @name patch/celula_proyecto/:id
 * @function
 */
router.patch('/:id', authMiddleware, soloEditores, celulaProyectoController.actualizarActivo.bind(celulaProyectoController));

/**
 * Elimina una relación célula-proyecto.
 * @name delete/celula_proyecto/:id
 * @function
 */
router.delete('/:id', authMiddleware, soloEditores, celulaProyectoController.eliminar.bind(celulaProyectoController));

export default router;
