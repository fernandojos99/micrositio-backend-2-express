// src/controllers/agenteCategoriaController.js
import AgenteCategoriaService from '../services/agenteCategoriaService.js';
import { agenteCategoriaCreateSchema, agenteCategoriaUpdateSchema } from '../middlewares/validation/agenteCategoriaSchema.js';
import ApiError from '../utils/ApiError.js';

class AgenteCategoriaController {
  constructor() {
    this.agenteCategoriaService = new AgenteCategoriaService();
  }

  /**
   * Metodo para obtener todas las categorías disponibles
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerCategorias(req, res, next) {
    try {
      const categorias = await this.agenteCategoriaService.obtenerCategorias();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una relación agente-categoría por sus IDs 
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorId(req, res, next) {
    try {
      const id_relacion_agente_categoria = Number(req.params.id_relacion_agente_categoria);

      if (!id_relacion_agente_categoria || isNaN(id_relacion_agente_categoria)) {
        throw new ApiError('Se requiere un ID de relación agente-categoría válido en la ruta', 400);
      }

      const relacion = await this.agenteCategoriaService.obtenerPorId(id_relacion_agente_categoria);
      res.json(relacion);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas las relaciones agente-categoría
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarTodos(req, res, next) {
    try {
      const relaciones = await this.agenteCategoriaService.listarTodos();
      res.json(relaciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista las categorías de un agente específico
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarPorAgente(req, res, next) {
    try {
      const id_agente = Number(req.params.id_agente);
      if (!id_agente || isNaN(id_agente)) {
        throw new ApiError('Se requiere un ID de agente válido en la ruta', 400);
      }

      const relaciones = await this.agenteCategoriaService.listarPorAgente(id_agente);
      res.json(relaciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista los agentes de una categoría específica
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarPorCategoria(req, res, next) {
    try {
      const id_categoria = Number(req.params.id_categoria);
      if (!id_categoria || isNaN(id_categoria)) {
        throw new ApiError('Se requiere un ID de categoría válido en la ruta', 400);
      }

      const relaciones = await this.agenteCategoriaService.listarPorCategoria(id_categoria);
      res.json(relaciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva relación agente-categoría
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = agenteCategoriaCreateSchema.parse(req.body);
      const relacion = await this.agenteCategoriaService.crear(validatedData);
      res.status(201).json(relacion);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una relación agente-categoría existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizar(req, res, next) {
    try {
      if (!req.body.id_agente || !req.body.id_categoria) {
        throw new ApiError('Se requieren los campos "id_agente" e "id_categoria" en el body', 400);
      }

      const { id_agente, id_categoria, ...updateData } = req.body;
      const validatedData = agenteCategoriaUpdateSchema.parse(updateData);
      const relacion = await this.agenteCategoriaService.actualizar(id_agente, id_categoria, validatedData);
      res.json(relacion);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una relación agente-categoría
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminar(req, res, next) {
    try {
      if (!req.body.id_agente || !req.body.id_categoria) {
        throw new ApiError('Se requieren los campos "id_agente" e "id_categoria" en el body', 400);
      }

      await this.agenteCategoriaService.eliminar(req.body.id_agente, req.body.id_categoria);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }



 

}

export default AgenteCategoriaController;