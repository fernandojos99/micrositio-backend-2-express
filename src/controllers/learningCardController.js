import LearningCardService from '../services/learningCardService.js';
import { learningCardCreateSchema, learningCardUpdateSchema } from '../middlewares/validation/learningCardSchema.js';
import ApiError from '../utils/ApiError.js';

class LearningCardController {
  constructor() {
    this.learningCardService = new LearningCardService();
  }

  /**
   * Obtiene learning card por testing card ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorTestingCard(req, res, next) {
    try {
      const idTestingCard = Number(req.query.id_testing_card);
      if (!idTestingCard) {
        throw new ApiError('Se requiere el parámetro "id_testing_card" en la query', 400);
      }

      const learningCards = await this.learningCardService.obtenerPorTestingCard(idTestingCard);
      res.json(learningCards);
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

  // Se comenta por que no deberia mandar el id en el body
  // async obtenerPorId(req, res, next) {
  //   try {
  //     if (!req.body.id_learning_card) {
  //       throw new ApiError('Se requiere id_learning_card en el body', 400);
  //     }

  //     const learningCard = await this.learningCardService.obtenerPorId(req.body.id_learning_card);
  //     res.json(learningCard);
  //   } catch (error) {
  //     next(error);
  //   }
  // }


  // En esta version igual se usa en el body pero pa no romper lo ya existente 
  async obtenerPorId(req, res, next) {
    try {
      // 🔑 Acepta múltiples fuentes (no rompe a nadie)
      const id =
        req.query?.id_learning_card ??
        req.body?.id_learning_card ??
        req.params?.id_learning_card;
  
      if (!id) {
        throw new ApiError('Se requiere id_learning_card', 400);
      }
  
      const learningCard = await this.learningCardService.obtenerPorId(id);
      res.json(learningCard);
    } catch (error) {
      next(error);
    }
  }

  




  /**
   * Obtiene todas las learning cards
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerTodos(req, res, next) {
    try {
      const learningCards = await this.learningCardService.obtenerTodos();
      res.json(learningCards);
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
      res.status(201).json(learningCard);
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
      if (!req.body.id_learning_card) {
        throw new ApiError('Se requiere id_learning_card en el body', 400);
      }

      const validatedData = learningCardUpdateSchema.parse(req.body);
      const { id_learning_card, ...updateData } = validatedData;

      const learningCard = await this.learningCardService.actualizar(id_learning_card, updateData);
      res.json(learningCard);
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
      if (!req.body.id_learning_card) {
        throw new ApiError('Se requiere id_learning_card en el body', 400);
      }

      await this.learningCardService.eliminar(req.body.id_learning_card);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export default LearningCardController;