// src/controllers/plantillaTestingCardController.js
import PlantillaTestingCardService from '../services/plantillaTestingCardService.js';
import { plantillaTestingCardCreateSchema, plantillaTestingCardUpdateSchema } from '../middlewares/validation/plantillaTestingCardSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';

class PlantillaTestingCardController {
  constructor() {
    this.plantillaTestingCardService = new PlantillaTestingCardService();
  }

  async obtenerPorId(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ApiError('Se requiere un ID de plantilla testing card válido en la ruta', 400);
      }

      const plantilla = await this.plantillaTestingCardService.obtenerPorId(id);
      success(res, plantilla);
    } catch (error) {
      next(error);
    }
  }

  async listarTodas(req, res, next) {
    try {
      const plantillas = await this.plantillaTestingCardService.listarTodas();
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

      const plantillas = await this.plantillaTestingCardService.listarPorEmpleado(id_empleado);
      success(res, plantillas);
    } catch (error) {
      next(error);
    }
  }

  async listarPorTestingCard(req, res, next) {
    try {
      const id_testing_card = Number(req.params.id_testing_card);
      if (!id_testing_card || isNaN(id_testing_card)) {
        throw new ApiError('Se requiere un ID de testing card válido en la ruta', 400);
      }

      const plantillas = await this.plantillaTestingCardService.listarPorTestingCard(id_testing_card);
      success(res, plantillas);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = plantillaTestingCardCreateSchema.parse(req.body);
      const plantilla = await this.plantillaTestingCardService.crear(validatedData);
      created(res, plantilla);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ApiError('Se requiere un ID de plantilla testing card válido en la ruta', 400);
      }

      const validatedData = plantillaTestingCardUpdateSchema.parse(req.body);
      const plantilla = await this.plantillaTestingCardService.actualizar(id, validatedData);
      success(res, plantilla);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ApiError('Se requiere un ID de plantilla testing card válido en la ruta', 400);
      }

      await this.plantillaTestingCardService.eliminar(id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }

}

export default PlantillaTestingCardController;
