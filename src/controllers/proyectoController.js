// src/controllers/proyectoController.js
import ProyectoService from '../services/proyectoService.js';
import { proyectoCreateSchema, proyectoUpdateSchema, proyectoPorUsuarioSchema } from '../middlewares/validation/proyectoSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created } from '../utils/responseHelper.js';
import { getPaginationParams } from '../utils/paginationHelper.js';

class ProyectoController {
  constructor() {
    this.proyectoService = new ProyectoService();
  }

  async obtenerProyecto(req, res, next) {
    try {
      const id_proyecto = Number(req.params.id);
      if (!id_proyecto) {
        throw new ApiError('Se requiere el ID del proyecto en la URL', 400);
      }
      const proyecto = await this.proyectoService.obtenerProyecto(id_proyecto);
      success(res, proyecto);
    } catch (error) {
      next(error);
    }
  }

  async crearProyecto(req, res, next) {
    try {
      const validatedData = proyectoCreateSchema.parse(req.body);
      const proyecto = await this.proyectoService.crearProyecto(validatedData);
      created(res, proyecto, { message: 'Proyecto creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async actualizarProyecto(req, res, next) {
    try {
      const id_proyecto = Number(req.params.id);
      if (!id_proyecto) {
        throw new ApiError('Se requiere el ID del proyecto en la URL', 400);
      }

      const { id_proyecto: _, ...updateData } = req.body;
      const validatedData = proyectoUpdateSchema.parse(updateData);
      const proyecto = await this.proyectoService.actualizarProyecto(id_proyecto, validatedData);
      success(res, proyecto, { message: 'Proyecto actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async eliminarProyecto(req, res, next) {
    try {
      const id_proyecto = Number(req.params.id);
      if (!id_proyecto) {
        throw new ApiError('Se requiere el ID del proyecto en la URL', 400);
      }
      await this.proyectoService.eliminarProyecto(id_proyecto);
      success(res, null, { message: 'Proyecto eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async listarProyectos(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const proyectos = await this.proyectoService.listarProyectos(req.filtroProyectos);
      const total = proyectos.length;
      success(res, proyectos, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }

  async obtenerProyectosPorIdUsuario(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const validatedData = proyectoPorUsuarioSchema.parse({ id_usuario: req.params.id_usuario });
      const proyectos = await this.proyectoService.obtenerProyectosPorIdUsuario(validatedData.id_usuario);
      const total = proyectos.length;
      success(res, proyectos, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }
}

export default ProyectoController;
