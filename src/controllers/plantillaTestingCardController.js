// src/controllers/plantillaTestingCardController.js
import PlantillaTestingCardService from '../services/plantillaTestingCardService.js';
import { plantillaTestingCardCreateSchema, plantillaTestingCardUpdateSchema } from '../middlewares/validation/plantillaTestingCardSchema.js';
import ApiError from '../utils/ApiError.js';

class PlantillaTestingCardController {
  constructor() {
    this.plantillaTestingCardService = new PlantillaTestingCardService();
  }

  /**
   * Obtiene una plantilla testing card por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorId(req, res, next) {
    try {
      const id_plantilla_testing_card = req.params.id;
      if (!id_plantilla_testing_card) {
        throw new ApiError('Se requiere un ID de plantilla testing card válido en la ruta', 400);
      }

      const plantilla = await this.plantillaTestingCardService.obtenerPorId(id_plantilla_testing_card);
      res.json(plantilla);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas las plantillas testing card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarTodas(req, res, next) {
    try {
      const plantillas = await this.plantillaTestingCardService.listarTodas();
      res.json(plantillas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas las plantillas testing card por empleado
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarPorEmpleado(req, res, next) {
    try {
      const id_empleado = Number(req.params.id_empleado);
      if (!id_empleado || isNaN(id_empleado)) {
        throw new ApiError('Se requiere un ID de empleado válido en la ruta', 400);
      }

      const plantillas = await this.plantillaTestingCardService.listarPorEmpleado(id_empleado);
      res.json(plantillas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas las plantillas testing card por testing card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarPorTestingCard(req, res, next) {
    try {
      const id_testing_card = Number(req.params.id_testing_card);
      if (!id_testing_card || isNaN(id_testing_card)) {
        throw new ApiError('Se requiere un ID de testing card válido en la ruta', 400);
      }

      const plantillas = await this.plantillaTestingCardService.listarPorTestingCard(id_testing_card);
      res.json(plantillas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva plantilla testing card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = plantillaTestingCardCreateSchema.parse(req.body);
      const plantilla = await this.plantillaTestingCardService.crear(validatedData);
      res.status(201).json(plantilla);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una plantilla testing card existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizar(req, res, next) {
    try {
      if (!req.body.id_plantilla_testing_card) {
        throw new ApiError('Se requiere el campo "id_plantilla_testing_card" en el body', 400);
      }

      const { id_plantilla_testing_card, ...updateData } = req.body;
      const validatedData = plantillaTestingCardUpdateSchema.parse(updateData);
      const plantilla = await this.plantillaTestingCardService.actualizar(id_plantilla_testing_card, validatedData);
      res.json(plantilla);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una plantilla testing card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminar(req, res, next) {
    try {
      if (!req.body.id_plantilla_testing_card) {
        throw new ApiError('Se requiere el campo "id_plantilla_testing_card" en el body', 400);
      }

      await this.plantillaTestingCardService.eliminar(req.body.id_plantilla_testing_card);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }

}

export default PlantillaTestingCardController;
