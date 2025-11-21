// src/routes/notificacionRoutes.js
/**
 * Módulo de rutas para notificaciones.
 * @module routes/notificacionRoutes
 */

import express from 'express';
import NotificacionController from '../controllers/notificacionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const notificacionController = new NotificacionController();

/**
 * @swagger
 * tags:
 *   name: Notificaciones
 *   description: Endpoints para el manejo de notificaciones del sistema
 */

/**
 * @swagger
 * /notificaciones/siguienteResponsable:
 *   post:
 *     summary: Envía una notificación al siguiente responsable de un experimento
 *     tags: [Notificaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_empleado
 *               - id_learning_card
 *               - id_empleado_remitente
 *             properties:
 *               id_empleado:
 *                 type: integer
 *                 description: ID del empleado que recibirá la notificación
 *                 example: 123
 *               id_learning_card:
 *                 type: integer
 *                 description: ID de la learning card asociada al experimento
 *                 example: 456
 *               id_empleado_remitente:
 *                 type: integer
 *                 description: ID del empleado que envía la notificación
 *                 example: 789
 *     responses:
 *       200:
 *         description: Notificación enviada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Notificación enviada exitosamente"
 *                 data:
 *                   type: object
 *                   description: Detalles de la notificación enviada
 *       400:
 *         description: Datos inválidos o empleado sin correo
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Empleado, learning card, testing card, secuencia o proyecto no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/siguienteResponsable', 
  authMiddleware, 
  notificacionController.enviarNotificacionSiguienteResponsable.bind(notificacionController)
);

export default router;
