/**
 * Módulo de rutas para node_positions (posiciones de nodos en el flow).
 * @module routes/nodePositionRoutes
 */

import express from 'express';
import NodePositionController from '../controllers/nodePositionController.js';
import validar, { upsertNodePositionSchema } from '../middlewares/validation/nodePositionSchema.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const nodePositionController = new NodePositionController();

/**
 * Obtiene position_x y position_y por identificadores.
 * @name get/node-positions/:node_id/:node_type/:id_secuencia
 * @function
 */
router.get('/:node_id/:node_type/:id_secuencia', authMiddleware, nodePositionController.obtenerPosicionPorId.bind(nodePositionController));

/**
 * Obtiene todas las posiciones de una secuencia.
 * @name get/flow-positions/:id_secuencia
 * @function
 */
router.get('/:id_secuencia', authMiddleware, nodePositionController.obtenerPorSecuencia.bind(nodePositionController));

/**
 * Crea o actualiza la posición de un nodo.
 * @name post/flow-positions
 * @function
 */
router.post('/', authMiddleware, soloEditores, validar(upsertNodePositionSchema), nodePositionController.upsert.bind(nodePositionController));

/**
 * Elimina todas las posiciones de una secuencia.
 * @name delete/flow-positions/:id_secuencia
 * @function
 */
router.delete('/:id_secuencia', authMiddleware, soloEditores, nodePositionController.eliminarPorSecuencia.bind(nodePositionController));

/**
 * Obtiene todas las posiciones.
 * @name get/node-positions
 * @function
 */
router.get('/', nodePositionController.getAllNodePositions.bind(nodePositionController));

export default router;