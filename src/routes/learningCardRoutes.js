import express from 'express';
import LearningCardController from '../controllers/learningCardController.js';
import { authMiddleware, soloEditores, verificarAccesoProyecto } from '../middlewares/authMiddleware.js';

const router = express.Router();
const learningCardController = new LearningCardController();

// NOTE: verificarAccesoProyecto aquí requiere ajuste futuro — usa req.query.proyectoId
// pero este endpoint filtra por testingCardId. Necesitaría resolver la testing card → secuencia → proyecto.
router.get('/', authMiddleware, verificarAccesoProyecto, learningCardController.obtenerTodos.bind(learningCardController));

router.get('/:id', authMiddleware, learningCardController.obtenerPorId.bind(learningCardController));

router.post('/', authMiddleware, soloEditores, learningCardController.crear.bind(learningCardController));

router.patch('/:id', authMiddleware, soloEditores, learningCardController.actualizar.bind(learningCardController));

router.delete('/:id', authMiddleware, soloEditores, learningCardController.eliminar.bind(learningCardController));

export default router;
