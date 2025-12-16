// src/controllers/urlFormatoController.js
import UrlFormatoService from '../services/urlFormatoService.js';
import { urlFormatoCreateSchema, urlFormatoUpdateSchema } from '../middlewares/validation/urlFormatoSchema.js';
import ApiError from '../utils/ApiError.js';

class UrlFormatoController {
  constructor() {
    this.urlService = new UrlFormatoService();
  }

  /**
   * Obtiene una URL formato por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id_url_formato } = req.query;

      if (!id_url_formato) {
        throw new ApiError('Se requiere el campo id_url_formato en el query', 400);
      }

      const url = await this.urlService.obtenerPorId(id_url_formato);
      res.json(url);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene todas las URLs formato
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerTodas(req, res, next) {
    try {
      const urls = await this.urlService.obtenerTodas();
      res.json(urls);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva URL formato
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = urlFormatoCreateSchema.parse(req.body);
      const url = await this.urlService.crear(validatedData);
      res.status(201).json(url);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Actualiza una URL formato
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizar(req, res, next) {
    try {
      if (!req.body.id_url_formato) {
        throw new ApiError('Se requiere el campo id_url_formato en el body', 400);
      }

      const { id_url_formato, ...updateData } = req.body;
      const validatedData = urlFormatoUpdateSchema.parse(updateData);
      const url = await this.urlService.actualizar(id_url_formato, validatedData);
      res.json(url);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una URL formato
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminar(req, res, next) {
    try {
      if (!req.body.id_url_formato) {
        throw new ApiError('Se requiere el campo id_url_formato en el body', 400);
      }

      await this.urlService.eliminar(req.body.id_url_formato);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export default UrlFormatoController;