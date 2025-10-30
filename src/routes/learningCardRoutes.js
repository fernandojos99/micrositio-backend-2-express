import express from 'express';
import LearningCardController from '../controllers/learningCardController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const learningCardController = new LearningCardController();

// Obtener por testing card
router.get('/t', authMiddleware, learningCardController.obtenerPorTestingCard.bind(learningCardController));

// Obtener por learning card ID
router.get('/l', authMiddleware, learningCardController.obtenerPorId.bind(learningCardController));

// Obtener todos
router.get('/', authMiddleware, learningCardController.obtenerTodos.bind(learningCardController));

// Crear
router.post('/', authMiddleware, soloEditores, learningCardController.crear.bind(learningCardController));

// Actualizar
router.patch('/', authMiddleware, soloEditores, learningCardController.actualizar.bind(learningCardController));

// Eliminar
router.delete('/', authMiddleware, soloEditores, learningCardController.eliminar.bind(learningCardController));

export default router;