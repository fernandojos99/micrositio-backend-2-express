// src/routes/agenteCategoriaRoutes.js
import express from 'express';
import AgenteCategoriaController from '../controllers/agenteCategoriaController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const agenteCategoriaController = new AgenteCategoriaController();

router.get('/categorias', authMiddleware, soloEditores, agenteCategoriaController.obtenerCategorias.bind(agenteCategoriaController));
router.get('/', authMiddleware, soloEditores, agenteCategoriaController.listarTodos.bind(agenteCategoriaController));
router.get('/agente/:id_agente', authMiddleware, soloEditores, agenteCategoriaController.listarPorAgente.bind(agenteCategoriaController));
router.get('/categoria/:id_categoria', authMiddleware, soloEditores, agenteCategoriaController.listarPorCategoria.bind(agenteCategoriaController));
router.get('/:id', authMiddleware, soloEditores, agenteCategoriaController.obtenerPorId.bind(agenteCategoriaController));
router.post('/', authMiddleware, soloEditores, agenteCategoriaController.crear.bind(agenteCategoriaController));
router.patch('/agente/:id_agente/categoria/:id_categoria', authMiddleware, soloEditores, agenteCategoriaController.actualizar.bind(agenteCategoriaController));
router.delete('/agente/:id_agente/categoria/:id_categoria', authMiddleware, soloEditores, agenteCategoriaController.eliminar.bind(agenteCategoriaController));

export default router;
