// src/controllers/plantillaMetricaTcController.js
import PlantillaMetricaTcService from '../services/plantillaMetricaTcService.js';
import { plantillaMetricaTcCreateSchema, plantillaMetricaTcUpdateSchema } from '../middlewares/validation/plantillaMetricaTcSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';

class PlantillaMetricaTcController {
  constructor() {
    this.plantillaMetricaTcService = new PlantillaMetricaTcService();
  }

  async obtenerPorId(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ApiError('Se requiere un ID de plantilla métrica tc válido en la ruta', 400);
      }

      const plantilla = await this.plantillaMetricaTcService.obtenerPorId(id);
      success(res, plantilla);
    } catch (error) {
      next(error);
    }
  }

  async listarTodas(req, res, next) {
    try {
      const plantillas = await this.plantillaMetricaTcService.listarTodas();
      success(res, plantillas);
    } catch (error) {
      next(error);
    }
  }

  async listarPorEmpleado(req, res, next) {
    try {
      const id_empleado = Number(req.params.id_empleado);
      if (!id_empleado || isNaN(id_empleado)) {
        throw new ApiError('Se requiere un ID de empleado válido en la ruta', 400);
      }

      const plantillas = await this.plantillaMetricaTcService.listarPorEmpleado(id_empleado);
      success(res, plantillas);
    } catch (error) {
      next(error);
    }
  }

  async listarPorMetrica(req, res, next) {
    try {
      const id_metrica = Number(req.params.id_metrica);
      if (!id_metrica || isNaN(id_metrica)) {
        throw new ApiError('Se requiere un ID de métrica válido en la ruta', 400);
      }

      const plantillas = await this.plantillaMetricaTcService.listarPorMetrica(id_metrica);
      success(res, plantillas);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = plantillaMetricaTcCreateSchema.parse(req.body);
      const plantilla = await this.plantillaMetricaTcService.crear(validatedData);
      created(res, plantilla);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ApiError('Se requiere un ID de plantilla métrica tc válido en la ruta', 400);
      }

      const validatedData = plantillaMetricaTcUpdateSchema.parse(req.body);
      const plantilla = await this.plantillaMetricaTcService.actualizar(id, validatedData);
      success(res, plantilla);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ApiError('Se requiere un ID de plantilla métrica tc válido en la ruta', 400);
      }

      await this.plantillaMetricaTcService.eliminar(id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default PlantillaMetricaTcController;
