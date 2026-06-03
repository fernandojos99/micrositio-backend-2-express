// src/controllers/agenteCategoriaController.js
import AgenteCategoriaService from '../services/agenteCategoriaService.js';
import { agenteCategoriaCreateSchema, agenteCategoriaUpdateSchema } from '../middlewares/validation/agenteCategoriaSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';

class AgenteCategoriaController {
  constructor() {
    this.agenteCategoriaService = new AgenteCategoriaService();
  }

  async obtenerCategorias(req, res, next) {
    try {
      const categorias = await this.agenteCategoriaService.obtenerCategorias();
      success(res, categorias);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const id = Number(req.params.id);

      if (!id || isNaN(id)) {
        throw new ApiError('Se requiere un ID de relación agente-categoría válido en la ruta', 400);
      }

      const relacion = await this.agenteCategoriaService.obtenerPorId(id);
      success(res, relacion);
    } catch (error) {
      next(error);
    }
  }

  async listarTodos(req, res, next) {
    try {
      const relaciones = await this.agenteCategoriaService.listarTodos();
      success(res, relaciones);
    } catch (error) {
      next(error);
    }
  }

  async listarPorAgente(req, res, next) {
    try {
      const id_agente = Number(req.params.id_agente);
      if (!id_agente || isNaN(id_agente)) {
        throw new ApiError('Se requiere un ID de agente válido en la ruta', 400);
      }

      const relaciones = await this.agenteCategoriaService.listarPorAgente(id_agente);
      success(res, relaciones);
    } catch (error) {
      next(error);
    }
  }

  async listarPorCategoria(req, res, next) {
    try {
      const id_categoria = Number(req.params.id_categoria);
      if (!id_categoria || isNaN(id_categoria)) {
        throw new ApiError('Se requiere un ID de categoría válido en la ruta', 400);
      }

      const relaciones = await this.agenteCategoriaService.listarPorCategoria(id_categoria);
      success(res, relaciones);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = agenteCategoriaCreateSchema.parse(req.body);
      const relacion = await this.agenteCategoriaService.crear(validatedData);
      created(res, relacion);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const id_agente = Number(req.params.id_agente);
      const id_categoria = Number(req.params.id_categoria);

      if (!id_agente || isNaN(id_agente) || !id_categoria || isNaN(id_categoria)) {
        throw new ApiError('Se requieren IDs de agente y categoría válidos en la ruta', 400);
      }

      const validatedData = agenteCategoriaUpdateSchema.parse(req.body);
      const relacion = await this.agenteCategoriaService.actualizar(id_agente, id_categoria, validatedData);
      success(res, relacion);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const id_agente = Number(req.params.id_agente);
      const id_categoria = Number(req.params.id_categoria);

      if (!id_agente || isNaN(id_agente) || !id_categoria || isNaN(id_categoria)) {
        throw new ApiError('Se requieren IDs de agente y categoría válidos en la ruta', 400);
      }

      await this.agenteCategoriaService.eliminar(id_agente, id_categoria);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }

}

export default AgenteCategoriaController;
