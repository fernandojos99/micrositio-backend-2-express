import ServicioService from '../services/servicioService.js';
import {
  servicioCreateSchema,
  servicioUpdateSchema
} from '../middlewares/validation/servicioSchema.js';

import ApiError from '../utils/ApiError.js';

class ServicioController {

  constructor() {
    this.servicioService =
      new ServicioService();
  }

  async obtenerPorId(req, res, next) {
    try {

      const id =
        req.query?.id ??
        req.body?.id ??
        req.params?.id;

      if (!id) {
        throw new ApiError(
          'Se requiere id',
          400
        );
      }

      const servicio =
        await this.servicioService.obtenerPorId(Number(id));

      res.json(servicio);

    } catch (error) {
      next(error);
    }
  }

  async obtenerTodos(req, res, next) {
    try {

      const servicios =
        await this.servicioService.obtenerTodos();

      res.json(servicios);

    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {

      const validatedData =
        servicioCreateSchema.parse(req.body);

      const servicio =
        await this.servicioService.crear(validatedData);

      res.status(201).json(servicio);

    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {

      if (!req.body.id) {
        throw new ApiError(
          'Se requiere id',
          400
        );
      }

      const validatedData =
        servicioUpdateSchema.parse(req.body);

      const { id, ...updateData } =
        validatedData;

      const servicio =
        await this.servicioService.actualizar(
          id,
          updateData
        );

      res.json(servicio);

    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {

      if (!req.body.id) {
        throw new ApiError(
          'Se requiere id',
          400
        );
      }

      await this.servicioService.eliminar(
        req.body.id
      );

      res.status(204).end();

    } catch (error) {
      next(error);
    }
  }
}

export default ServicioController;