// src/routes/agenteCategoriaRoutes.js
import express from 'express';
import AgenteCategoriaController from '../controllers/agenteCategoriaController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const agenteCategoriaController = new AgenteCategoriaController();

// Obtener todas las relaciones agente-categoría
router.get('/', authMiddleware, soloEditores, agenteCategoriaController.listarTodos.bind(agenteCategoriaController));

// Obtener relación específica por ID único
router.get('/:id_relacion_agente_categoria', authMiddleware, soloEditores, agenteCategoriaController.obtenerPorId.bind(agenteCategoriaController));

// Obtener categorías de un agente específico
router.get('/agente/:id_agente', authMiddleware, soloEditores, agenteCategoriaController.listarPorAgente.bind(agenteCategoriaController));

// Obtener agentes de una categoría específica
router.get('/categoria/:id_categoria', authMiddleware, soloEditores, agenteCategoriaController.listarPorCategoria.bind(agenteCategoriaController));

// Crear relación agente-categoría
router.post('/', authMiddleware, soloEditores, agenteCategoriaController.crear.bind(agenteCategoriaController));

// Actualizar relación agente-categoría
router.patch('/', authMiddleware, soloEditores, agenteCategoriaController.actualizar.bind(agenteCategoriaController));

// Eliminar relación agente-categoría específica
router.delete('/', authMiddleware, soloEditores, agenteCategoriaController.eliminar.bind(agenteCategoriaController));

export default router;
