/**
 * Controlador para manejar las operaciones CRUD de empleados.
 * @class
 */
import EmpleadoService from '../services/empleadoService.js';
import EmpleadoRepository from '../repositories/empleadoRepository.js';
import { empleadoCreateSchema, empleadoUpdateSchema } from '../middlewares/validation/empleadoSchema.js';
import ApiError from '../utils/ApiError.js';
import { success, created } from '../utils/responseHelper.js';
import { getPaginationParams } from '../utils/paginationHelper.js';

class EmpleadoController {
  constructor() {
    const empleadoRepository = new EmpleadoRepository();
    this.empleadoService = new EmpleadoService(empleadoRepository);
  }

  /**
   * Maneja la obtención de un empleado por ID (GET /empleados/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerPorId(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const idEmpleado = parseInt(req.params.id);

      if (isNaN(idEmpleado)) {
        throw new ApiError('El ID debe ser un número válido', 400);
      }

      const empleado = await this.empleadoService.obtenerPorId(idEmpleado);
      success(res, empleado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la obtención de todos los empleados (GET /empleados/todos).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async listarTodos(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const empleados = await this.empleadoService.listarTodos();
      const total = empleados.length;
      success(res, empleados, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la creación de un empleado (POST /empleados/create).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async crear(req, res, next) {
    try {
      const validatedData = empleadoCreateSchema.parse(req.body);
      const empleado = await this.empleadoService.crear(validatedData);
      created(res, empleado);
    } catch (error) {
      next(new ApiError(error.message, 400));
    }
  }

  /**
   * Maneja la actualización de un empleado (PATCH /empleados/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async actualizar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      console.log('Datos recibidos para actualizar empleado en controller:', req.body);
      const { id, ...updateData } = req.body;
      const validatedData = empleadoUpdateSchema.parse(updateData);
      const empleado = await this.empleadoService.actualizar(req.params.id, validatedData);
      success(res, empleado);
    } catch (error) {
      next(error);
    }
  }

  async actualizarHabilidades(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const { habilidades } = req.body;
      console.log('Datos recibidos para actualizar info personal:', { id: req.params.id, habilidades });
      const empleado = await this.empleadoService.actualizarHabilidades(req.params.id, { habilidades });
      success(res, empleado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la desactivación de un empleado (DELETE /empleados/:id).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async desactivar(req, res, next) {
    try {
      if (!req.params.id) {
        throw new ApiError('Se requiere el parámetro "id" en la URL', 400);
      }

      const idEmpleado = parseInt(req.params.id);

      if (isNaN(idEmpleado)) {
        throw new ApiError('El ID debe ser un número válido', 400);
      }

      const empleado = await this.empleadoService.desactivar(idEmpleado);
      success(res, empleado);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja la obtención de empleados sin usuario asociado (GET /empleados/sin-usuario).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerEmpleadosSinUsuario(req, res, next) {
    try {
      const { page, limit } = getPaginationParams(req);
      const empleados = await this.empleadoService.obtenerEmpleadosSinUsuario();
      const total = empleados.length;
      success(res, empleados, { page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }
}

export default EmpleadoController;
