// src/controllers/testingCardController.js
import TestingCardService from '../services/testingCardService.js';
import { testingCardCreateSchema, testingCardUpdateSchema } from '../middlewares/validation/testingCardSchema.js';
import ApiError from '../utils/ApiError.js';

class TestingCardController {
  constructor() {
    this.testingCardService = new TestingCardService();
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      if (!id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const testingCard = await this.testingCardService.obtenerPorId(parseInt(id));
      res.json(testingCard);
    } catch (error) {
      next(error);
    }
  }

 async obtenerPorSecuencia(req, res, next) {
  try {
    // Cambia esto:
    // if (!req.body.id_secuencia) {
    //   throw new ApiError('Se requiere el campo "id_secuencia" en el body', 400);
    // }
    // Por esto:
    const idSecuencia = req.query.id_secuencia;
    if (!idSecuencia) {
      throw new ApiError('Se requiere el parámetro "id_secuencia" en la query', 400);
    }

    const testingCards = await this.testingCardService.obtenerPorSecuencia(idSecuencia);
    res.json(testingCards);
  } catch (error) {
    next(error);
  }
}

  async obtenerPorPadre(req, res, next) {
    try {
      if (!req.body.padre_id) {
        throw new ApiError('Se requiere el campo "padre_id" en el body', 400);
      }

      const testingCards = await this.testingCardService.obtenerPorPadre(req.body.padre_id);
      res.json(testingCards);
    } catch (error) {
      next(error);
    }
  }

  async listarTodos(req, res, next) {
    try {
      const testingCards = await this.testingCardService.listarTodos();
      res.json(testingCards);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = testingCardCreateSchema.parse(req.body);
      const testingCard = await this.testingCardService.crear(validatedData);
      res.status(201).json(testingCard);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  async actualizar(req, res, next) {
    try {
      if (!req.body.id_testing_card) {
        throw new ApiError('Se requiere el campo "id_testing_card" en el body', 400);
      }

      const { id_testing_card, ...updateData } = req.body;
      const validatedData = testingCardUpdateSchema.parse(updateData);
      const testingCard = await this.testingCardService.actualizar(id_testing_card, validatedData);
      res.json(testingCard);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      if (!req.body.id_testing_card) {
        throw new ApiError('Se requiere el campo "id_testing_card" en el body', 400);
      }

      await this.testingCardService.eliminar(req.body.id_testing_card);
      res.status(204).end();
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
      
      res.status(201).json({
        success: true,
        message: 'Testing card copiada exitosamente',
        data: testingCardCopia
      });
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
      const { id_testing_card, id_plantilla_testing_card } = req.body;

      if (!id_testing_card) {
        throw new ApiError('Se requiere el campo "id_testing_card" en el body', 400);
      }

      if (!id_plantilla_testing_card) {
        throw new ApiError('Se requiere el campo "id_plantilla_testing_card" en el body', 400);
      }

      const testingCardActualizada = await this.testingCardService.aplicarPlantilla(
        id_testing_card, 
        id_plantilla_testing_card
      );

      res.json({
        success: true,
        message: 'Plantilla aplicada exitosamente',
        data: testingCardActualizada
      });
    } catch (error) {
      next(error);
    }
  }
}

export default TestingCardController;