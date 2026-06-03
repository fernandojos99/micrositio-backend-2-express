// src/routes/categoriaRoutes.js
/**
 * Módulo de rutas para categorías.
 * @module routes/categoriaRoutes
 */

import express from 'express';
import CategoriaController from '../controllers/categoriaController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const categoriaController = new CategoriaController();

/**
 * Ruta GET para obtener todas las categorías.
 * @name get/categorias
 * @function
 */
router.get('/', authMiddleware, categoriaController.obtenerTodas.bind(categoriaController));

/**
 * Ruta GET para obtener una categoría por ID.
 * @name get/categorias/:id
 * @function
 */
router.get('/:id', authMiddleware, categoriaController.obtenerPorId.bind(categoriaController));

/**
 * Ruta POST para crear una nueva categoría.
 * @name post/categorias
 * @function
 */
router.post('/', authMiddleware, soloEditores, categoriaController.crear.bind(categoriaController));

/**
 * Ruta PATCH para actualizar una categoría existente.
 * @name patch/categorias/:id
 * @function
 */
router.patch('/:id', authMiddleware, soloEditores, categoriaController.actualizar.bind(categoriaController));

/**
 * Ruta DELETE para eliminar una categoría.
 * @name delete/categorias/:id
 * @function
 */
router.delete('/:id', authMiddleware, soloEditores, categoriaController.eliminar.bind(categoriaController));

export default router;
