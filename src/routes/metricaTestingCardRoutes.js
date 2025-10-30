// src/routes/metricaTestingCardRoutes.js
import express from 'express';
import MetricaTestingCardController from '../controllers/metricaTestingCardController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = new MetricaTestingCardController();

/**
 * @swagger
 * tags:
 *   name: MetricasTestingCard
 *   description: Endpoints para manejar métricas de testing cards
 */

/**
 * @swagger
 * /metrica_testing_card/t:
 *   get:
 *     summary: Obtiene métricas por testing card
 *     tags: [MetricasTestingCard]
 *     parameters:
 *       - in: query
 *         name: id_testing_card
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la testing card
 *     responses:
 *       200:
 *         description: Lista de métricas
 *       404:
 *         description: Testing card no encontrada o sin métricas
 */
router.get('/t', authMiddleware, controller.obtenerPorTestingCard.bind(controller));

/**
 * @swagger
 * /metrica_testing_card/m:
 *   get:
 *     summary: Obtiene una métrica por su ID
 *     tags: [MetricasTestingCard]
 *     parameters:
 *       - in: query
 *         name: id_metrica_testing_card
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la métrica
 *     responses:
 *       200:
 *         description: Métrica encontrada
 *       404:
 *         description: Métrica no encontrada
 */
router.get('/m', authMiddleware, controller.obtenerPorId.bind(controller));

/**
 * @swagger
 * /metrica_testing_card:
 *   get:
 *     summary: Obtiene todas las métricas
 *     tags: [MetricasTestingCard]
 *     responses:
 *       200:
 *         description: Lista de todas las métricas
 */
router.get('/', controller.obtenerTodas.bind(controller));

/**
 * @swagger
 * /metrica_testing_card:
 *   post:
 *     summary: Crea una nueva métrica
 *     tags: [MetricasTestingCard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetricaTestingCard'
 *     responses:
 *       201:
 *         description: Métrica creada
 *       404:
 *         description: Testing card no encontrada
 */
router.post('/', authMiddleware, soloEditores, controller.crear.bind(controller));

/**
 * @swagger
 * /metrica_testing_card:
 *   patch:
 *     summary: Actualiza una métrica
 *     tags: [MetricasTestingCard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_metrica_testing_card
 *             properties:
 *               id_metrica_testing_card:
 *                 type: integer
 *               nombre:
 *                 type: string
 *               operador:
 *                 type: string
 *               criterio:
 *                 type: string
 *               resultado:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Métrica actualizada
 *       404:
 *         description: Métrica no encontrada
 */
router.patch('/', authMiddleware, soloEditores, controller.actualizar.bind(controller));

/**
 * @swagger
 * /metrica_testing_card/resultado:
 *   patch:
 *     summary: Actualiza únicamente el resultado de una métrica
 *     tags: [MetricasTestingCard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_metrica_testing_card
 *               - resultado
 *             properties:
 *               id_metrica_testing_card:
 *                 type: integer
 *                 description: ID de la métrica
 *               resultado:
 *                 type: integer
 *                 description: Nuevo valor del resultado
 *     responses:
 *       200:
 *         description: Resultado de métrica actualizado
 *       404:
 *         description: Métrica no encontrada
 */
router.patch('/resultado', authMiddleware, soloEditores, controller.actualizarResultado.bind(controller));

/**
 * @swagger
 * /metrica_testing_card:
 *   delete:
 *     summary: Elimina una métrica
 *     tags: [MetricasTestingCard]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_metrica_testing_card
 *             properties:
 *               id_metrica_testing_card:
 *                 type: integer
 *     responses:
 *       204:
 *         description: Métrica eliminada
 *       404:
 *         description: Métrica no encontrada
 */
router.delete('/', authMiddleware, soloEditores, controller.eliminar.bind(controller));

export default router;