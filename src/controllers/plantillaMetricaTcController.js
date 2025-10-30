// src/controllers/plantillaMetricaTcController.js
import PlantillaMetricaTcService from '../services/plantillaMetricaTcService.js';
import { plantillaMetricaTcCreateSchema, plantillaMetricaTcUpdateSchema } from '../middlewares/validation/plantillaMetricaTcSchema.js';
import ApiError from '../utils/ApiError.js';

class PlantillaMetricaTcController {
  constructor() {
    this.plantillaMetricaTcService = new PlantillaMetricaTcService();
  }

  /**
   * Obtiene una plantilla métrica tc por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerPorId(req, res, next) {
    try {
      const id_plantilla_metrica = req.params.id;
      if (!id_plantilla_metrica) {
        throw new ApiError('Se requiere un ID de plantilla métrica tc válido en la ruta', 400);
      }

      const plantilla = await this.plantillaMetricaTcService.obtenerPorId(id_plantilla_metrica);
      res.json(plantilla);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas las plantillas métrica tc
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarTodas(req, res, next) {
    try {
      const plantillas = await this.plantillaMetricaTcService.listarTodas();
      res.json(plantillas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas las plantillas métrica tc por empleado
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

      const plantillas = await this.plantillaMetricaTcService.listarPorEmpleado(id_empleado);
      res.json(plantillas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lista todas las plantillas métrica tc por métrica
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarPorMetrica(req, res, next) {
    try {
      const id_metrica = Number(req.params.id_metrica);
      if (!id_metrica || isNaN(id_metrica)) {
        throw new ApiError('Se requiere un ID de métrica válido en la ruta', 400);
      }

      const plantillas = await this.plantillaMetricaTcService.listarPorMetrica(id_metrica);
      res.json(plantillas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva plantilla métrica tc
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = plantillaMetricaTcCreateSchema.parse(req.body);
      const plantilla = await this.plantillaMetricaTcService.crear(validatedData);
      res.status(201).json(plantilla);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza una plantilla métrica tc existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizar(req, res, next) {
    try {
      if (!req.body.id_plantilla_metrica) {
        throw new ApiError('Se requiere el campo "id_plantilla_metrica" en el body', 400);
      }

      const { id_plantilla_metrica, ...updateData } = req.body;
      const validatedData = plantillaMetricaTcUpdateSchema.parse(updateData);
      const plantilla = await this.plantillaMetricaTcService.actualizar(id_plantilla_metrica, validatedData);
      res.json(plantilla);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una plantilla métrica tc
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminar(req, res, next) {
    try {
      if (!req.body.id_plantilla_metrica) {
        throw new ApiError('Se requiere el campo "id_plantilla_metrica" en el body', 400);
      }

      await this.plantillaMetricaTcService.eliminar(req.body.id_plantilla_metrica);
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export default PlantillaMetricaTcController;
