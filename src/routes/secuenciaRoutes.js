// src/routes/secuenciaRoutes.js
import express from 'express';
import SecuenciaController from '../controllers/secuenciaController.js';
import Secuencia from '../models/Secuencia.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const secuenciaController = new SecuenciaController();

/**
 * @swagger
 * tags:
 *   name: Secuencias
 *   description: Endpoints para manejar secuencias de testing
 */

/**
 * @swagger
 * /secuencia/p:
 *   get:
 *     summary: Obtiene secuencias por proyecto
 *     tags: [Secuencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_proyecto
 *             properties:
 *               id_proyecto:
 *                 type: integer
 *                 description: ID del proyecto
 *     responses:
 *       200:
 *         description: Lista de secuencias
 *       404:
 *         description: Proyecto no encontrado
 */
router.get('/p', authMiddleware, secuenciaController.obtenerPorProyecto.bind(secuenciaController));

/**
 * @swagger
 * /secuencia/{id}:
 *   get:
 *     summary: Obtiene una secuencia por su ID
 *     tags: [Secuencias]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la secuencia
 *     responses:
 *       200:
 *         description: Secuencia encontrada
 *       404:
 *         description: Secuencia no encontrada
 */
router.get('/:id', authMiddleware, secuenciaController.obtenerPorId.bind(secuenciaController));

/**
 * @swagger
 * /secuencia:
 *   get:
 *     summary: Obtiene todas las secuencias
 *     tags: [Secuencias]
 *     responses:
 *       200:
 *         description: Lista de todas las secuencias
 */
router.get('/', authMiddleware, secuenciaController.obtenerTodas.bind(secuenciaController));

/**
 * @swagger
 * /secuencia:
 *   post:
 *     summary: Crea una nueva secuencia
 *     tags: [Secuencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Secuencia'
 *     responses:
 *       201:
 *         description: Secuencia creada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Proyecto o testing card no encontrado
 */
router.post('/', authMiddleware, soloEditores, secuenciaController.crear.bind(secuenciaController));

/**
 * @swagger
 * /secuencia:
 *   patch:
 *     summary: Actualiza una secuencia existente
 *     tags: [Secuencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_secuencia
 *             properties:
 *               id_secuencia:
 *                 type: integer
 *                 description: ID de la secuencia a actualizar
 *               nombre:
 *                 type: string
 *                 description: Nuevo nombre de la secuencia
 *               descripcion:
 *                 type: string
 *                 description: Nueva descripción
 *               id_testing_card_padre:
 *                 type: integer
 *                 description: Nuevo ID de testing card padre
 *     responses:
 *       200:
 *         description: Secuencia actualizada
 *       404:
 *         description: Secuencia no encontrada
 */
router.patch('/', authMiddleware, soloEditores, secuenciaController.actualizar.bind(secuenciaController));

/**
 * @swagger
 * /secuencia:
 *   delete:
 *     summary: Elimina una secuencia
 *     tags: [Secuencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_secuencia
 *             properties:
 *               id_secuencia:
 *                 type: integer
 *                 description: ID de la secuencia a eliminar
 *     responses:
 *       204:
 *         description: Secuencia eliminada
 *       404:
 *         description: Secuencia no encontrada
 */
router.delete('/', authMiddleware, soloEditores, secuenciaController.eliminar.bind(secuenciaController));

/**
 * @swagger
 * /secuencia/aplicar-plantilla:
 *   patch:
 *     summary: Aplica una plantilla secuencia a una secuencia existente
 *     tags: [Secuencias]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_secuencia
 *               - id_plantilla_secuencia
 *             properties:
 *               id_secuencia:
 *                 type: string
 *                 description: ID de la secuencia destino
 *               id_plantilla_secuencia:
 *                 type: string
 *                 description: ID de la plantilla secuencia a aplicar
 *     responses:
 *       200:
 *         description: Plantilla aplicada exitosamente
 *       404:
 *         description: Secuencia o plantilla no encontrada
 */
router.patch('/aplicar-plantilla', authMiddleware, secuenciaController.aplicarPlantilla.bind(secuenciaController));


/* ---------------------------------------------------------------------------
 * Rutas REST con el identificador en el path.
 *
 * Van al final a proposito: Express resuelve por orden de registro, asi que
 * las rutas literales de arriba ('/p', '/todos', '/aplicar-plantilla', ...)
 * siguen ganando y no las tapa el parametro.
 *
 * Las rutas antiguas, con el ID en el body (incluido un GET con body), se
 * mantienen para no romper a los clientes que aun no han migrado. Cuando el
 * front deje de usarlas, se borran.
 * ------------------------------------------------------------------------ */

router.patch('/:id', authMiddleware, soloEditores, secuenciaController.actualizar.bind(secuenciaController));
router.delete('/:id', authMiddleware, soloEditores, secuenciaController.eliminar.bind(secuenciaController));

export default router;