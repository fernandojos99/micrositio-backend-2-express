import MetricaTestingCardService from '../services/metricaTestingCardService.js';
import { metricaCreateSchema, metricaUpdateSchema, metricaResultadoUpdateSchema } from '../middlewares/validation/metricaTestingCardSchema.js';
import { success, created, noContent } from '../utils/responseHelper.js';
import ApiError from '../utils/ApiError.js';

class MetricaTestingCardController {
  constructor() {
    this.metricaService = new MetricaTestingCardService();
  }

  /**
   * Obtiene todas las métricas o filtra por testing card
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerTodas(req, res, next) {
    try {
      const idTestingCard = req.query.testingCardId;

      if (idTestingCard) {
        const metricas = await this.metricaService.obtenerPorTestingCard(idTestingCard);
        return success(res, metricas);
      }

      const metricas = await this.metricaService.obtenerTodas();
      success(res, metricas);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene una métrica por su ID
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

      const metrica = await this.metricaService.obtenerPorId(id);
      success(res, metrica);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea una nueva métrica
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crear(req, res, next) {
    try {
      const validatedData = metricaCreateSchema.parse(req.body);
      const metrica = await this.metricaService.crear(validatedData);
      created(res, metrica);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Actualiza una métrica
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

      const validatedData = metricaUpdateSchema.parse(req.body);
      const metrica = await this.metricaService.actualizar(id, validatedData);
      success(res, metrica);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el resultado de una métrica
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizarResultado(req, res, next) {
    try {
      const id = req.params.id;

      if (!id) {
        throw new ApiError('Se requiere el campo id en la ruta', 400);
      }

      const { resultado } = req.body;
      const validatedData = metricaResultadoUpdateSchema.parse({ resultado });
      const metrica = await this.metricaService.actualizarResultado(id, validatedData);
      success(res, metrica);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Elimina una métrica
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

      await this.metricaService.eliminar(id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default MetricaTestingCardController;
