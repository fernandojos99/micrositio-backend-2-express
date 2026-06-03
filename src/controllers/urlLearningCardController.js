import UrlLearningCardService from '../services/urlLearningCardService.js';
import { urlLearningCardCreateSchema, urlLearningCardUpdateSchema } from '../middlewares/validation/urlLearningCardSchema.js';
import { success, created, noContent } from '../utils/responseHelper.js';
import ApiError from '../utils/ApiError.js';

class UrlLearningCardController {
  constructor() {
    this.urlService = new UrlLearningCardService();
  }

  /**
   * Obtiene todas las URLs o filtra por learning card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerTodas(req, res, next) {
    try {
      const idLearningCard = req.query.learningCardId;

      if (idLearningCard) {
        const urls = await this.urlService.obtenerPorLearningCard(idLearningCard);
        return success(res, urls);
      }

      const urls = await this.urlService.obtenerTodas();
      success(res, urls);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una URL por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError('Se requiere el campo id en la ruta', 400);
      }

      const url = await this.urlService.obtenerPorId(id);
      success(res, url);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva URL
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = urlLearningCardCreateSchema.parse(req.body);
      const url = await this.urlService.crear(validatedData);
      created(res, url);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Actualiza una URL
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizar(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        throw new ApiError('Se requiere el campo id en la ruta', 400);
      }

      const validatedData = urlLearningCardUpdateSchema.parse(req.body);
      const url = await this.urlService.actualizar(id, validatedData);
      success(res, url);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una URL
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminar(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        throw new ApiError('Se requiere el campo id en la ruta', 400);
      }

      await this.urlService.eliminar(id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default UrlLearningCardController;
