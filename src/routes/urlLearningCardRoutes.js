import express from 'express';
import UrlLearningCardController from '../controllers/urlLearningCardController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = new UrlLearningCardController();

router.get('/', authMiddleware, controller.obtenerTodas.bind(controller));

router.get('/:id', authMiddleware, controller.obtenerPorId.bind(controller));

router.post('/', authMiddleware, soloEditores, controller.crear.bind(controller));

router.patch('/:id', authMiddleware, soloEditores, controller.actualizar.bind(controller));

router.delete('/:id', authMiddleware, soloEditores, controller.eliminar.bind(controller));

export default router;
