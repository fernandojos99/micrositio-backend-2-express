// src/controllers/testingCardController.js
import TestingCardService from '../services/testingCardService.js';
import { testingCardCreateSchema, testingCardUpdateSchema } from '../middlewares/validation/testingCardSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';
import { getPaginationParams } from '../utils/paginationHelper.js';

class TestingCardController {
  constructor() {
    this.testingCardService = new TestingCardService();
  }

  async listarTodos(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const { secuenciaId } = req.query;

      if (secuenciaId) {
        const testingCards = await this.testingCardService.obtenerPorSecuencia(secuenciaId);
        return success(res, testingCards);
      }

      const testingCards = await this.testingCardService.listarTodos();
      const total = testingCards.length;
      success(res, testingCards, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const testingCard = await this.testingCardService.obtenerPorId(parseInt(id));
      success(res, testingCard);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorSecuencia(req, res, next) {
    try {
      const { secuenciaId } = req.query;
      if (!secuenciaId) {
        throw new ApiError('Se requiere el parámetro "secuenciaId" en la query', 400);
      }

      const testingCards = await this.testingCardService.obtenerPorSecuencia(secuenciaId);
      success(res, testingCards);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorPadre(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const testingCards = await this.testingCardService.obtenerPorPadre(req.params.id);
      success(res, testingCards);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = testingCardCreateSchema.parse(req.body);
      const testingCard = await this.testingCardService.crear(validatedData);
      created(res, testingCard);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  async actualizar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const { id_testing_card, ...updateData } = req.body;
      const validatedData = testingCardUpdateSchema.parse(updateData);
      const testingCard = await this.testingCardService.actualizar(req.params.id, validatedData);
      success(res, testingCard);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      await this.testingCardService.eliminar(req.params.id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Copia una testing card existente sin el id_secuencia y copia todas sus métricas asociadas
   */
  async copiarTestingCard(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError('Se requiere el ID de la testing card a copiar', 400);
      }

      const testingCardCopia = await this.testingCardService.copiarTestingCard(parseInt(id));
      created(res, testingCardCopia, { message: 'Testing card copiada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Aplica una plantilla a una testing card existente
   * Extrae los datos de la plantilla (titulo, hipotesis, id_experimento_tipo, descripcion)
   * y los aplica a la testing card especificada
   */
  async aplicarPlantilla(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const { id_plantilla_testing_card } = req.body;

      if (!id_plantilla_testing_card) {
        throw new ApiError('Se requiere el campo "id_plantilla_testing_card" en el body', 400);
      }

      const testingCardActualizada = await this.testingCardService.aplicarPlantilla(
        id,
        id_plantilla_testing_card
      );

      success(res, testingCardActualizada, { message: 'Plantilla aplicada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene todas las testing cards asociadas a plantillas
   * Retorna información detallada de cada testing card de cada plantilla
   */
  async obtenerTodasTestingCardDeLasPlantillas(req, res, next) {
    try {
      const testingCards = await this.testingCardService.obtenerTodasTestingCardDeLasPlantillas();
      success(res, testingCards);
    } catch (error) {
      next(error);
    }
  }
}

export default TestingCardController;
