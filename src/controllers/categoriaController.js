// src/controllers/categoriaController.js
/**
 * Controlador para manejar las operaciones CRUD de categorías.
 * @class
 */
import CategoriaService from '../services/categoriaService.js';
import { categoriaCreateSchema, categoriaUpdateSchema } from '../middlewares/validation/categoriaSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';
import { getPaginationParams } from '../utils/paginationHelper.js';

class CategoriaController {
  constructor() {
    this.categoriaService = new CategoriaService();
  }

  /**
   * Maneja la obtención de una categoría por ID (GET /categorias/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerPorId(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const categoria = await this.categoriaService.obtenerPorId(req.params.id);
      success(res, categoria);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la obtención de todas las categorías (GET /categorias).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerTodas(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const categorias = await this.categoriaService.obtenerTodas();
      const total = categorias.length;
      success(res, categorias, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la creación de una categoría (POST /categorias).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async crear(req, res, next) {
    try {
      const validatedData = categoriaCreateSchema.parse(req.body);
      const categoria = await this.categoriaService.crear(validatedData);
      created(res, categoria);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Maneja la actualización de una categoría (PATCH /categorias/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async actualizar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const { id_categoria, ...updateData } = req.body;
      const validatedData = categoriaUpdateSchema.parse(updateData);
      const categoria = await this.categoriaService.actualizar(req.params.id, validatedData);
      success(res, categoria);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la eliminación de una categoría (DELETE /categorias/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async eliminar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      await this.categoriaService.eliminar(req.params.id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default CategoriaController;
