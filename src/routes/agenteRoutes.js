// src/routes/agenteRoutes.js
import express from 'express';
import AgenteController from '../controllers/agenteController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const agenteController = new AgenteController();

// Obtener todos los agentes
router.get('/', authMiddleware, soloEditores, agenteController.listarTodos.bind(agenteController));

// Obtener agente específico por ID
router.post('/a', authMiddleware, soloEditores, agenteController.obtenerPorId.bind(agenteController));

// Crear agente
router.post('/', authMiddleware, soloEditores, agenteController.crear.bind(agenteController));

// Actualizar agente
router.patch('/', authMiddleware, soloEditores, agenteController.actualizar.bind(agenteController));

// Eliminar agente
router.delete('/', authMiddleware, soloEditores, agenteController.eliminar.bind(agenteController));

export default router;
