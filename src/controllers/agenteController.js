// src/controllers/agenteController.js
import AgenteService from '../services/agenteService.js';
import { agenteCreateSchema, agenteUpdateSchema } from '../middlewares/validation/agenteSchema.js';
import ApiError from '../utils/ApiError.js';

class AgenteController {
  constructor() {
    this.agenteService = new AgenteService();
  }

  /**
   * Obtiene un agente por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorId(req, res, next) {
    try {
      const id_agente = Number(req.params.id);
      if (!id_agente || isNaN(id_agente)) {
        throw new ApiError('Se requiere un ID de agente válido en la ruta', 400);
      }

      const agente = await this.agenteService.obtenerPorId(id_agente);
      res.json(agente);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todos los agentes
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarTodos(req, res, next) {
    try {
      const agentes = await this.agenteService.listarTodos();
      res.json(agentes);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuevo agente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = agenteCreateSchema.parse(req.body);
      const agente = await this.agenteService.crear(validatedData);
      res.status(201).json(agente);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza un agente existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizar(req, res, next) {
    try {
      if (!req.body.id_agente) {
        throw new ApiError('Se requiere el campo "id_agente" en el body', 400);
      }

      const { id_agente, ...updateData } = req.body;
      const validatedData = agenteUpdateSchema.parse(updateData);
      const agente = await this.agenteService.actualizar(id_agente, validatedData);
      res.json(agente);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina un agente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminar(req, res, next) {
    try {
      if (!req.body.id_agente) {
        throw new ApiError('Se requiere el campo "id_agente" en el body', 400);
      }

      await this.agenteService.eliminar(req.body.id_agente);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export default AgenteController;
