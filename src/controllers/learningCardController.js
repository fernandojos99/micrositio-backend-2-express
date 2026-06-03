import LearningCardService from '../services/learningCardService.js';
import { learningCardCreateSchema, learningCardUpdateSchema } from '../middlewares/validation/learningCardSchema.js';
import { success, created, noContent } from '../utils/responseHelper.js';
import ApiError from '../utils/ApiError.js';
import { getPaginationParams } from '../utils/paginationHelper.js';

class LearningCardController {
  constructor() {
    this.learningCardService = new LearningCardService();
  }

  /**
   * Obtiene todas las learning cards o filtra por testing card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerTodos(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const idTestingCard = req.query.testingCardId;

      if (idTestingCard) {
        const learningCards = await this.learningCardService.obtenerPorTestingCard(Number(idTestingCard));
        return success(res, learningCards);
      }

      const learningCards = await this.learningCardService.obtenerTodos();
      const total = learningCards.length;
      success(res, learningCards, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene learning card por ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorId(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        throw new ApiError('Se requiere id_learning_card', 400);
      }

      const learningCard = await this.learningCardService.obtenerPorId(id);
      success(res, learningCard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva learning card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = learningCardCreateSchema.parse(req.body);
      const learningCard = await this.learningCardService.crear(validatedData);
      created(res, learningCard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una learning card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizar(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        throw new ApiError('Se requiere id_learning_card', 400);
      }

      const validatedData = learningCardUpdateSchema.parse(req.body);
      const { id_learning_card, ...updateData } = validatedData;

      const learningCard = await this.learningCardService.actualizar(id, updateData);
      success(res, learningCard);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una learning card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminar(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        throw new ApiError('Se requiere id_learning_card', 400);
      }

      await this.learningCardService.eliminar(id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default LearningCardController;
