// src/routes/urlLearningCardRoutes.js
import express from 'express';
import UrlLearningCardController from '../controllers/urlLearningCardController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = new UrlLearningCardController();

/**
 * @swagger
 * tags:
 *   name: UrlLearningCard
 *   description: Endpoints para manejar URLs de learning cards
 */

/**
 * @swagger
 * /url_learning_card/l:
 *   get:
 *     summary: Obtiene URLs por learning card
 *     tags: [UrlLearningCard]
 *     parameters:
 *       - in: query
 *         name: id_learning_card
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la learning card
 *     responses:
 *       200:
 *         description: Lista de URLs
 *       404:
 *         description: Learning card no encontrada o sin URLs
 */
router.get('/l', authMiddleware, controller.obtenerPorLearningCard.bind(controller));

/**
 * @swagger
 * /url_learning_card/u:
 *   get:
 *     summary: Obtiene una URL por su ID
 *     tags: [UrlLearningCard]
 *     parameters:
 *       - in: query
 *         name: id_url_lc
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la URL
 *     responses:
 *       200:
 *         description: URL encontrada
 *       404:
 *         description: URL no encontrada
 */
router.get('/u', authMiddleware, controller.obtenerPorId.bind(controller));

/**
 * @swagger
 * /url_learning_card:
 *   get:
 *     summary: Obtiene todas las URLs
 *     tags: [UrlLearningCard]
 *     responses:
 *       200:
 *         description: Lista de todas las URLs
 */
router.get('/', authMiddleware, controller.obtenerTodas.bind(controller));

/**
 * @swagger
 * /url_learning_card:
 *   post:
 *     summary: Crea una nueva URL
 *     tags: [UrlLearningCard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_learning_card
 *               - url
 *             properties:
 *               id_learning_card:
 *                 type: integer
 *                 description: ID de la learning card
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: URL a asociar
 *     responses:
 *       201:
 *         description: URL creada
 *       404:
 *         description: Learning card no encontrada
 */
router.post('/', authMiddleware, soloEditores, controller.crear.bind(controller));

/**
 * @swagger
 * /url_learning_card:
 *   patch:
 *     summary: Actualiza una URL
 *     tags: [UrlLearningCard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_url_lc
 *             properties:
 *               id_url_lc:
 *                 type: integer
 *                 description: ID de la URL
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Nueva URL
 *     responses:
 *       200:
 *         description: URL actualizada
 *       404:
 *         description: URL no encontrada
 */
router.patch('/', authMiddleware, soloEditores, controller.actualizar.bind(controller));

/**
 * @swagger
 * /url_learning_card:
 *   delete:
 *     summary: Elimina una URL
 *     tags: [UrlLearningCard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_url_lc
 *             properties:
 *               id_url_lc:
 *                 type: integer
 *                 description: ID de la URL
 *     responses:
 *       204:
 *         description: URL eliminada
 *       404:
 *         description: URL no encontrada
 */
router.delete('/', authMiddleware, soloEditores, controller.eliminar.bind(controller));

export default router;
