/**
 * Controlador para manejar las operaciones CRUD de empleados.
 * @class
 */
import EmpleadoService from '../services/empleadoService.js';
import EmpleadoRepository from '../repositories/empleadoRepository.js';
import { empleadoCreateSchema, empleadoUpdateSchema } from '../middlewares/validation/empleadoSchema.js';
import ApiError from '../utils/ApiError.js';
import { leerId } from '../utils/leerId.js';

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
      const idEmpleado = parseInt(leerId(req, 'id', 'id_empleado'));

      if (isNaN(idEmpleado)) {
        throw new ApiError('Se requiere un identificador de empleado válido', 400);
      }

      const empleado = await this.empleadoService.obtenerPorId(idEmpleado);
      res.json(empleado);
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
      const empleados = await this.empleadoService.listarTodos();
      res.json(empleados);
    } catch (error) {
      next(error);
    }
  }


  /**
   * Maneja la creación de un empleado (POST /empleados).
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async crear(req, res, next) {
    try {
      const validatedData = empleadoCreateSchema.parse(req.body);
      const empleado = await this.empleadoService.crear(validatedData);
      res.status(201).json(empleado);
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
      const id = leerId(req, 'id', 'id_empleado');
      if (!id) {
        throw new ApiError('Se requiere el identificador del empleado', 400);
      }

      const { id: _ignorado, ...updateData } = req.body;
      const validatedData = empleadoUpdateSchema.parse(updateData);
      const empleado = await this.empleadoService.actualizar(id, validatedData);
      res.json(empleado);
    } catch (error) {
      next(error);
    }
  }


    async actualizarHabilidades(req, res, next) {
    try {
      const id = leerId(req, 'id', 'id_empleado');
      if (!id) {
        throw new ApiError('Se requiere el identificador del empleado', 400);
      }

      const { habilidades } = req.body;
      //const validatedData = empleadoUpdateSchema.parse(updateData);
      const empleado = await this.empleadoService.actualizarHabilidades(id, { habilidades });
      res.json(empleado);
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
      const idEmpleado = parseInt(leerId(req, 'id', 'id_empleado'));

      if (isNaN(idEmpleado)) {
        throw new ApiError('Se requiere un identificador de empleado válido', 400);
      }
      const empleado = await this.empleadoService.desactivar(idEmpleado);
      res.json(empleado);
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
      const empleados = await this.empleadoService.obtenerEmpleadosSinUsuario();
      res.json({
        success: true,
        data: empleados,
        total: empleados.length
      });
    } catch (error) {
      next(error);
    }
  }
}

export default EmpleadoController;