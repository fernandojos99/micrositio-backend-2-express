import express from 'express';
import NodePositionController from '../controllers/nodePositionController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = new NodePositionController();

router.get('/secuencia/:id_secuencia', authMiddleware, controller.obtenerPorSecuencia.bind(controller));
router.get('/nodo/:node_id/:node_type/:id_secuencia', authMiddleware, controller.obtenerPosicionPorId.bind(controller));
router.get('/', controller.getAllNodePositions.bind(controller));
router.post('/batch', authMiddleware, soloEditores, controller.batchUpsert.bind(controller));
router.post('/', authMiddleware, soloEditores, controller.upsert.bind(controller));
router.delete('/secuencia/:id_secuencia', authMiddleware, soloEditores, controller.eliminarPorSecuencia.bind(controller));

export default router;
