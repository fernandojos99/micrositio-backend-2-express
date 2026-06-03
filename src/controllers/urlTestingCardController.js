import UrlTestingCardService from '../services/urlTestingCardService.js';
import { urlTestingCardCreateSchema, urlTestingCardUpdateSchema } from '../middlewares/validation/urlTestingCardSchema.js';
import { success, created, noContent } from '../utils/responseHelper.js';
import ApiError from '../utils/ApiError.js';

class UrlTestingCardController {
  constructor() {
    this.urlService = new UrlTestingCardService();
  }

  /**
   * Obtiene todas las URLs o filtra por testing card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerTodas(req, res, next) {
    try {
      const idTestingCard = req.query.testingCardId;

      if (idTestingCard) {
        const urls = await this.urlService.obtenerPorTestingCard(idTestingCard);
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
      const validatedData = urlTestingCardCreateSchema.parse(req.body);
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

      const validatedData = urlTestingCardUpdateSchema.parse(req.body);
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

export default UrlTestingCardController;
