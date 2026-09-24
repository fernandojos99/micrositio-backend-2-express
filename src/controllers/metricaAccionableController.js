import MetricaAccionableService from '../services/metricaAccionableService.js';
import {
  metricaAccionableCreateSchema,
  metricaAccionableUpdateSchema,
} from '../middlewares/validation/metricaAccionableSchema.js';
import ApiError from '../utils/ApiError.js';

class MetricaAccionableController {
  constructor() {
    this.metricaService = new MetricaAccionableService();
  }

  leerId(valor, nombre) {
    const id = Number(valor);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError(`Se requiere un ${nombre} válido`, 400);
    }
    return id;
  }

  async obtenerPorAccionable(req, res, next) {
    try {
      const metricas = await this.metricaService.obtenerPorAccionable(
        this.leerId(req.params.id_accionable, 'id_accionable')
      );

      res.json(metricas);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = metricaAccionableCreateSchema.parse(req.body);
      const metrica = await this.metricaService.crear(validatedData);

      res.status(201).json(metrica);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const validatedData = metricaAccionableUpdateSchema.parse(req.body);

      const metrica = await this.metricaService.actualizar(
        this.leerId(req.params.id_metrica_accionable, 'id_metrica_accionable'),
        validatedData
      );

      res.json(metrica);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      await this.metricaService.eliminar(
        this.leerId(req.params.id_metrica_accionable, 'id_metrica_accionable')
      );

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  }
}

export default MetricaAccionableController;
