// src/controllers/urlFormatoController.js
import UrlFormatoService from '../services/urlFormatoService.js';
import { urlFormatoCreateSchema, urlFormatoUpdateSchema } from '../middlewares/validation/urlFormatoSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';

class UrlFormatoController {
  constructor() {
    this.urlService = new UrlFormatoService();
  }

  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new ApiError('Se requiere el ID en la URL', 400);
      }

      const url = await this.urlService.obtenerPorId(id);
      success(res, url);
    } catch (error) {
      next(error);
    }
  }

  async obtenerTodas(req, res, next) {
    try {
      const urls = await this.urlService.obtenerTodas();
      success(res, urls);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = urlFormatoCreateSchema.parse(req.body);
      const url = await this.urlService.crear(validatedData);
      created(res, url);
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ApiError('Se requiere el ID en la URL', 400);
      }

      const validatedData = urlFormatoUpdateSchema.parse(req.body);
      const url = await this.urlService.actualizar(id, validatedData);
      success(res, url);
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new ApiError('Se requiere el ID en la URL', 400);
      }

      await this.urlService.eliminar(id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }
}

export default UrlFormatoController;
