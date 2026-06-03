import UsuarioProyectoService from '../services/usuarioProyectoService.js';
import { usuarioProyectoCreateSchema, usuarioProyectoMultipleSchema, usuarioIdParamSchema } from '../middlewares/validation/usuarioProyectoSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created } from '../utils/responseHelper.js';

class UsuarioProyectoController {
  constructor() {
    this.usuarioProyectoService = new UsuarioProyectoService();
  }

  async obtenerTodos(req, res, next) {
    try {
      const relaciones = await this.usuarioProyectoService.obtenerTodos();
      return success(res, relaciones, { total: relaciones.length });
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdUsuario(req, res, next) {
    try {
      const { id_usuario } = req.params;

      usuarioIdParamSchema.parse({ id_usuario });

      const resultado = await this.usuarioProyectoService.obtenerPorIdUsuario(id_usuario);
      return success(res, resultado);
    } catch (error) {
      next(error);
    }
  }

  async obtenerPorIdProyecto(req, res, next) {
    try {
      const id_proyecto = parseInt(req.params.id_proyecto);

      if (!id_proyecto || id_proyecto <= 0) {
        throw new ApiError('ID de proyecto inválido', 400);
      }

      const resultado = await this.usuarioProyectoService.obtenerPorIdProyecto(id_proyecto);
      return success(res, resultado);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const validatedData = usuarioProyectoCreateSchema.parse(req.body);
      const resultado = await this.usuarioProyectoService.crear(validatedData);
      return created(res, resultado, { message: 'Relación usuario-proyecto creada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async asignarMultiplesProyectos(req, res, next) {
    try {
      const validatedData = usuarioProyectoMultipleSchema.parse(req.body);
      const { id_usuario, proyectos } = validatedData;

      const resultado = await this.usuarioProyectoService.asignarMultiplesProyectos(id_usuario, proyectos);
      return created(res, resultado, { message: `Se asignaron ${resultado.proyectos_asignados} proyecto(s) al usuario` });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { id_usuario } = req.params;
      const id_proyecto = parseInt(req.params.id_proyecto);

      usuarioIdParamSchema.parse({ id_usuario });

      if (!id_proyecto || id_proyecto <= 0) {
        throw new ApiError('ID de proyecto inválido', 400);
      }

      const resultado = await this.usuarioProyectoService.eliminar(id_usuario, id_proyecto);
      return success(res, resultado, { message: 'Relación usuario-proyecto eliminada exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async eliminarPorUsuario(req, res, next) {
    try {
      const { id_usuario } = req.params;

      usuarioIdParamSchema.parse({ id_usuario });

      const resultado = await this.usuarioProyectoService.eliminarPorUsuario(id_usuario);
      return success(res, resultado, { message: `Se eliminaron ${resultado.proyectos_desasignados} relación(es) del usuario` });
    } catch (error) {
      next(error);
    }
  }

  async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await this.usuarioProyectoService.obtenerEstadisticas();
      return success(res, estadisticas);
    } catch (error) {
      next(error);
    }
  }
}

export default UsuarioProyectoController;
