// src/controllers/celulaProyectoController.js
/**
 * Controlador para manejar las operaciones CRUD de célula_proyecto.
 * @class
 */
import CelulaProyectoService from '../services/celulaProyectoService.js';
import { celulaProyectoCreateSchema, celulaProyectoUpdateSchema } from '../middlewares/validation/celulaProyectoSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';

class CelulaProyectoController {
  constructor() {
    this.celulaProyectoService = new CelulaProyectoService();
  }

  /**
   * Obtiene relaciones célula-proyecto.
   * Soporta filtros por query: ?empleadoId= y ?proyectoId=
   * @async
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Next middleware.
   */
  async obtenerTodos(req, res, next) {
    try {
      const { empleadoId, proyectoId } = req.query;

      if (empleadoId) {
        const relaciones = await this.celulaProyectoService.obtenerPorEmpleado(empleadoId);
        return success(res, relaciones);
      }

      if (proyectoId) {
        const relaciones = await this.celulaProyectoService.obtenerPorProyecto(Number(proyectoId));
        return success(res, relaciones);
      }

      const relaciones = await this.celulaProyectoService.obtenerTodos();
      success(res, relaciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene relaciones por ID de empleado.
   * @async
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Next middleware.
   */
  async obtenerPorEmpleado(req, res, next) {
    try {
      if (!req.query.empleadoId) {
        throw new ApiError('Se requiere el parámetro "empleadoId" en query', 400);
      }

      const relaciones = await this.celulaProyectoService.obtenerPorEmpleado(req.query.empleadoId);
      success(res, relaciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene relaciones por ID de proyecto.
   * @async
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Next middleware.
   */
  async obtenerPorProyecto(req, res, next) {
    try {
      const id_proyecto = req.query.proyectoId;
      if (!id_proyecto) {
        throw new ApiError('Se requiere el parámetro "proyectoId" en query', 400);
      }
      const relaciones = await this.celulaProyectoService.obtenerPorProyecto(Number(id_proyecto));
      success(res, relaciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea nuevas relaciones célula-proyecto para varios empleados.
   * @async
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Next middleware.
   */
  async crear(req, res, next) {
    console.log('Body recibido en crear celula_proyecto:', req.body);
    try {
      const validatedData = celulaProyectoCreateSchema.parse(req.body);
      const { id_empleados, id_proyecto, activo } = validatedData;
      const nuevasRelaciones = await this.celulaProyectoService.crearMultiple(id_empleados, id_proyecto, activo);
      created(res, nuevasRelaciones);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Elimina una relación célula-proyecto.
   * @async
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Next middleware.
   */
  async eliminar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      await this.celulaProyectoService.eliminar(req.params.id);
      noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza el estado activo de una relación célula-proyecto.
   * @async
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Next middleware.
   */
  async actualizarActivo(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const validatedData = celulaProyectoUpdateSchema.parse(req.body);
      const relacionActualizada = await this.celulaProyectoService.actualizarActivo(
        req.params.id,
        validatedData.activo
      );
      success(res, relacionActualizada);
    } catch (error) {
      next(error);
    }
  }
}

export default CelulaProyectoController;
