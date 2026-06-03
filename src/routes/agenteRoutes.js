// src/routes/agenteRoutes.js
import express from 'express';
import AgenteController from '../controllers/agenteController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const agenteController = new AgenteController();

router.get('/', authMiddleware, soloEditores, agenteController.listarTodos.bind(agenteController));
router.get('/categoria/:id', authMiddleware, soloEditores, agenteController.listarPorCategoria.bind(agenteController));
router.get('/:id', authMiddleware, soloEditores, agenteController.obtenerPorId.bind(agenteController));
router.post('/', authMiddleware, soloEditores, agenteController.crear.bind(agenteController));
router.patch('/:id', authMiddleware, soloEditores, agenteController.actualizar.bind(agenteController));
router.delete('/:id', authMiddleware, soloEditores, agenteController.eliminar.bind(agenteController));

export default router;
