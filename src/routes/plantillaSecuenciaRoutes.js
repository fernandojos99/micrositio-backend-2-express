// src/routes/plantillaSecuenciaRoutes.js
import express from 'express';
import plantillaSecuenciaController from '../controllers/plantillaSecuenciaController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);

/**
 * @route   GET /api/plantilla-secuencia
 * @desc    Obtener todas las plantillas secuencia
 * @access  Private (requiere autenticación)
 */
router.get('/', plantillaSecuenciaController.obtenerTodas);

/**
 * @route   GET /api/plantilla-secuencia/:id
 * @desc    Obtener una plantilla secuencia por ID
 * @access  Private (requiere autenticación)
 */
router.get('/:id', plantillaSecuenciaController.obtenerPorId);

/**
 * @route   POST /api/plantilla-secuencia
 * @desc    Crear una nueva plantilla secuencia
 * @access  Private (requiere autenticación)
 */
router.post('/', plantillaSecuenciaController.crear);

/**
 * @route   PUT /api/plantilla-secuencia/:id
 * @desc    Actualizar una plantilla secuencia
 * @access  Private (requiere autenticación)
 */
router.put('/:id', plantillaSecuenciaController.actualizar);

/**
 * @route   DELETE /api/plantilla-secuencia/:id
 * @desc    Eliminar una plantilla secuencia
 * @access  Private (requiere autenticación)
 */
router.delete('/:id', plantillaSecuenciaController.eliminar);

export default router;
