// src/services/empleadoService.js
/**
 * Servicio para manejar la lógica de negocio de empleados.
 * @class
 */
import EmpleadoRepository from '../repositories/empleadoRepository.js';
import ApiError from '../utils/ApiError.js';
import Empleado from '../models/Empleado.js';

class EmpleadoService {
  /**
   * @param {EmpleadoRepository} empleadoRepository
   */
  constructor(empleadoRepository) {
    this.empleadoRepo = empleadoRepository;
  }

  /**
   * Obtiene un empleado por su ID.
   * @async
   * @param {number} id - ID del empleado.
   * @returns {Promise<Object>} Empleado encontrado.
   * @throws {ApiError} Si el empleado no existe.
   */
  async obtenerPorId(id) {
    const empleado = await this.empleadoRepo.obtenerPorId(id);

    if (!empleado) {
      throw new ApiError('Empleado no encontrado', 404);
    }
    console.log("Empleado encontrado en servicio antes de toAPI", empleado);
    return empleado.toAPI();
  }

  /**
   * Obtiene todos los empleados.
   * @async
   * @returns {Promise<Array<Object>>} Lista de empleados.
   */
  async listarTodos() {
    return await this.empleadoRepo.listarTodos();
  }

  /**
   * Crea un nuevo empleado.
   * @async
   * @param {Object} empleadoData - Datos del empleado.
   * @returns {Promise<Object>} Empleado creado.
   */
  async crear(empleadoData) {
    const datosValidados = Empleado.validateCreate(empleadoData);
    const empleado = await this.empleadoRepo.crear(datosValidados);
    return empleado.toAPI();
  }

  /**
   * Actualiza un empleado existente.
   * @async
   * @param {number} id - ID del empleado a actualizar.
   * @param {Object} empleadoData - Datos a actualizar.
   * @returns {Promise<Object>} Empleado actualizado.
   * @throws {ApiError} Si el empleado no existe.
   */

  async actualizar(id, empleadoData) {
      const datosValidados = Empleado.validateUpdate(empleadoData);
    
      const empleado = await this.empleadoRepo.actualizar(id, datosValidados);
    
      if (!empleado) {
        throw new ApiError('Empleado no encontrado', 404);
      }
    
      return empleado.toAPI();
  }


  /**
   * Desactiva un empleado (eliminación lógica).
   * @async
   * @param {number} id - ID del empleado a desactivar.
   * @returns {Promise<Object>} Empleado desactivado.
   * @throws {ApiError} Si el empleado no existe.
   */
  async desactivar(id) {
    const empleado = await this.empleadoRepo.desactivar(id);

    if (!empleado) {
      throw new ApiError('Empleado no encontrado', 404);
    }

    return empleado.toAPI();
  }

  /**
   * Obtiene empleados que no están relacionados con ningún usuario.
   * @async
   * @returns {Promise<Array<Object>>} Lista de empleados sin usuario asociado.
   */
  async obtenerEmpleadosSinUsuario() {
    const empleados = await this.empleadoRepo.obtenerEmpleadosSinUsuario();
    return empleados.map(empleado => empleado.toAPI());
  }
}

export default EmpleadoService;