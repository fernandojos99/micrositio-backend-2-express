// src/routes/agenteCategoriaRoutes.js
import express from 'express';
import AgenteCategoriaController from '../controllers/agenteCategoriaController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const agenteCategoriaController = new AgenteCategoriaController();

// Obtener todas las relaciones agente-categoría
router.get('/', authMiddleware, soloEditores, agenteCategoriaController.listarTodos.bind(agenteCategoriaController));

// Obtener relación específica por IDs compuestos
router.get('/:id_agente/:id_categoria', authMiddleware, soloEditores, agenteCategoriaController.obtenerPorId.bind(agenteCategoriaController));

// Obtener categorías de un agente específico
router.get('/agente/:id_agente', authMiddleware, soloEditores, agenteCategoriaController.listarPorAgente.bind(agenteCategoriaController));

// Obtener agentes de una categoría específica
router.get('/categoria/:id_categoria', authMiddleware, soloEditores, agenteCategoriaController.listarPorCategoria.bind(agenteCategoriaController));

// Crear relación agente-categoría
router.post('/', authMiddleware, soloEditores, agenteCategoriaController.crear.bind(agenteCategoriaController));

// Actualizar relación agente-categoría
router.patch('/', authMiddleware, soloEditores, agenteCategoriaController.actualizar.bind(agenteCategoriaController));

// Actualizar todas las categorías de un agente (reemplaza existentes)
router.put('/agente/:id_agente/categorias', authMiddleware, soloEditores, agenteCategoriaController.actualizarCategoriasAgente.bind(agenteCategoriaController));

// Eliminar relación agente-categoría específica
router.delete('/', authMiddleware, soloEditores, agenteCategoriaController.eliminar.bind(agenteCategoriaController));

// Eliminar todas las relaciones de un agente
router.delete('/agente', authMiddleware, soloEditores, agenteCategoriaController.eliminarPorAgente.bind(agenteCategoriaController));

// Eliminar todas las relaciones de una categoría
router.delete('/categoria', authMiddleware, soloEditores, agenteCategoriaController.eliminarPorCategoria.bind(agenteCategoriaController));

export default router;
