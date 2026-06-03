// src/controllers/experimentoTipoController.js
/**
 * Controlador para manejar las operaciones CRUD de experimento_tipo.
 * @class
 */
import ExperimentoTipoService from '../services/experimentoTipoService.js';
import { experimentoTipoCreateSchema, experimentoTipoUpdateSchema } from '../middlewares/validation/experimentoTipoSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';

class ExperimentoTipoController {
  constructor() {
    this.experimentoTipoService = new ExperimentoTipoService();
  }

  /**
   * Maneja la obtención de un tipo de experimento por ID (GET /experimento_tipo/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerPorId(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const tipo = await this.experimentoTipoService.obtenerPorId(req.params.id);
      success(res, tipo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la obtención de todos los tipos de experimento (GET /experimento_tipo).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerTodos(req, res, next) {
    try {
      const tipos = await this.experimentoTipoService.obtenerTodos();
      success(res, tipos);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la creación de un tipo de experimento (POST /experimento_tipo).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async crear(req, res, next) {
    try {
      const validatedData = experimentoTipoCreateSchema.parse(req.body);
      const tipo = await this.experimentoTipoService.crear(validatedData);
      created(res, tipo);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Maneja la actualización de un tipo de experimento (PATCH /experimento_tipo/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async actualizar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const { id_experimento_tipo, ...updateData } = req.body;
      const validatedData = experimentoTipoUpdateSchema.parse(updateData);
      const tipo = await this.experimentoTipoService.actualizar(req.params.id, validatedData);
      success(res, tipo);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la eliminación de un tipo de experimento (DELETE /experimento_tipo/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async eliminar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      await this.experimentoTipoService.eliminar(req.params.id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default ExperimentoTipoController;
