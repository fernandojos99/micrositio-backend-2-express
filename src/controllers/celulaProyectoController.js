// src/controllers/celulaProyectoController.js
/**
 * Controlador para manejar las operaciones CRUD de célula_proyecto.
 * @class
 */
import CelulaProyectoService from '../services/celulaProyectoService.js';
import { celulaProyectoCreateSchema, celulaProyectoUpdateSchema } from '../middlewares/validation/celulaProyectoSchema.js';
import ApiError from '../utils/ApiError.js';

class CelulaProyectoController {
  constructor() {
    this.celulaProyectoService = new CelulaProyectoService();
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
      if (!req.body.id_empleado) {
        throw new ApiError('Se requiere el campo "id_empleado" en el body', 400);
      }

      const relaciones = await this.celulaProyectoService.obtenerPorEmpleado(req.body.id_empleado);
      res.json(relaciones);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene relaciones por ID de proyecto (usando req.query).
   * @async
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Next middleware.
   */
  // En src/controllers/celulaProyectoController.js

async obtenerPorProyecto(req, res, next) {
  try {
    // Solo lee de la query para GET
    const id_proyecto = req.query.id_proyecto;
    if (!id_proyecto) {
      throw new ApiError('Se requiere el parámetro "id_proyecto" en query', 400);
    }
    const relaciones = await this.celulaProyectoService.obtenerPorProyecto(Number(id_proyecto));
    res.json(relaciones);
  } catch (error) {
    next(error);
  }
}

  /**
   * Obtiene todas las relaciones célula-proyecto.
   * @async
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Next middleware.
   */
  async obtenerTodos(req, res, next) {
    try {
      const relaciones = await this.celulaProyectoService.obtenerTodos();
      res.json(relaciones);
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
    try {
      const validatedData = celulaProyectoCreateSchema.parse(req.body);
      const { id_empleados, id_proyecto, activo } = validatedData;
      const nuevasRelaciones = await this.celulaProyectoService.crearMultiple(id_empleados, id_proyecto, activo);
      res.status(201).json(nuevasRelaciones);
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
      if (!req.body.id) {
        throw new ApiError('Se requiere el campo "id" en el body', 400);
      }

      await this.celulaProyectoService.eliminar(req.body.id);
      res.status(204).end();
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
      if (!req.body.id) {
        throw new ApiError('Se requiere el campo "id" en el body', 400);
      }

      const validatedData = celulaProyectoUpdateSchema.parse(req.body);
      const relacionActualizada = await this.celulaProyectoService.actualizarActivo(
        req.body.id, 
        validatedData.activo
      );
      res.json(relacionActualizada);
    } catch (error) {
      next(error);
    }
  }
}

export default CelulaProyectoController;