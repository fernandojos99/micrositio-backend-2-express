// src/controllers/agenteController.js
import AgenteService from '../services/agenteService.js';
import { agenteCreateSchema, agenteUpdateSchema } from '../middlewares/validation/agenteSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';
import { getPaginationParams } from '../utils/paginationHelper.js';

class AgenteController {
  constructor() {
    this.agenteService = new AgenteService();
  }

  async obtenerPorId(req, res, next) {
    try {
      const id_agente = Number(req.params.id);
      if (!id_agente || isNaN(id_agente)) {
        throw new ApiError('Se requiere un ID de agente válido en la ruta', 400);
      }

      const agente = await this.agenteService.obtenerPorId(id_agente);
      success(res, agente);
    } catch (error) {
      next(error);
    }
  }

  async listarTodos(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const agentes = await this.agenteService.listarTodos();
      const total = agentes.length;
      success(res, agentes, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }

  async listarPorCategoria(req, res, next) {
    try {
      const id_categoria = Number(req.params.id);
      if (!id_categoria || isNaN(id_categoria)) {
        throw new ApiError('Se requiere un ID de categoría válido en la ruta', 400);
      }

      const agentes = await this.agenteService.listarPorCategoria(id_categoria);
      success(res, agentes);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = agenteCreateSchema.parse(req.body);
      const agente = await this.agenteService.crear(validatedData);
      created(res, agente);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const id_agente = Number(req.params.id);
      if (!id_agente || isNaN(id_agente)) {
        throw new ApiError('Se requiere un ID de agente válido en la ruta', 400);
      }

      const validatedData = agenteUpdateSchema.parse(req.body);
      const agente = await this.agenteService.actualizar(id_agente, validatedData);
      success(res, agente);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const id_agente = Number(req.params.id);
      if (!id_agente || isNaN(id_agente)) {
        throw new ApiError('Se requiere un ID de agente válido en la ruta', 400);
      }

      await this.agenteService.eliminar(id_agente);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default AgenteController;
