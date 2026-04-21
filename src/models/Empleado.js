// src/models/Empleado.js
/**
 * Modelo de Empleado que representa la estructura y comportamiento de un empleado.
 * @class
 */
import { empleadoCreateSchema, empleadoUpdateSchema } from '../middlewares/validation/empleadoSchema.js';
import ApiError from '../utils/ApiError.js';

class Empleado {
  /**
   * Crea una instancia del modelo Empleado.
   * @param {Object} data - Datos del empleado.
   */
  constructor(data) {
    this.id_empleado = data.id_empleado;
    this.nombre_pila = data.nombre_pila;
    this.apellido_paterno = data.apellido_paterno;
    this.apellido_materno = data.apellido_materno ?? null;
    this.celular = data.celular ?? null;
    this.correo = data.correo;
    this.numero_empleado = data.numero_empleado;
    this.activo = data.activo !== undefined ? data.activo : true;
    this.created_at = new Date(data.created_at ?? Date.now());
    this.updated_at = new Date(data.updated_at ?? Date.now());
  
    // ✅ nuevos campos corregidos
    this.cargo = data.cargo ?? "";
    this.departamento = data.departamento ?? "";
    this.infopersonal = data.infopersonal ?? "";
  }
  /**
   * Valida los datos del empleado al crear.
   * @static
   * @param {Object} data - Datos a validar.
   * @returns {Object} Datos validados.
   * @throws {ApiError} Si la validación falla.
   */
  static validateCreate(data) {
    try {
      return empleadoCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Valida los datos del empleado al actualizar.
   * @static
   * @param {Object} data - Datos a validar.
   * @returns {Object} Datos validados.
   * @throws {ApiError} Si la validación falla.
   */
  static validateUpdate(data) {
    try {
      return empleadoUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Crea una instancia de Empleado a partir de datos de la base de datos.
   * @static
   * @param {Object} dbData - Datos de la base de datos.
   * @returns {Empleado} Instancia del modelo.
   */
  static fromDatabase(dbData) {
    return new Empleado({
      id_empleado: dbData.id_empleado,
      nombre_pila: dbData.nombre_pila,
      apellido_paterno: dbData.apellido_paterno,
      apellido_materno: dbData.apellido_materno,
      celular: dbData.celular,
      correo: dbData.correo,
      numero_empleado: dbData.numero_empleado,
      activo: dbData.activo,
      created_at: new Date(dbData.created_at),
      updated_at: new Date(dbData.updated_at),
  
      // 🔽 nuevos campos
      cargo: dbData.cargo ?? "",
      departamento: dbData.departamento ?? "",
      infopersonal: dbData.infopersonal ?? ""
    });
  }

  /**
   * Convierte el modelo a un objeto para la base de datos.
   * @returns {Object} Objeto preparado para la base de datos.
   */
  toDatabase() {
    return {
      nombre_pila: this.nombre_pila,
      apellido_paterno: this.apellido_paterno,
      apellido_materno: this.apellido_materno,
      celular: this.celular,
      correo: this.correo,
      numero_empleado: this.numero_empleado,
      activo: this.activo,
      cargo: this.cargo,
      departamento: this.departamento,
      infopersonal: this.infopersonal

    };
  }

  /**
   * Convierte el modelo a un objeto para la respuesta API.
   * @returns {Object} Objeto preparado para la respuesta.
   */
  toAPI() {
    return {
      id: this.id_empleado,
      nombre_pila: this.nombre_pila,
      apellido_paterno: this.apellido_paterno,
      apellido_materno: this.apellido_materno,
      celular: this.celular,
      correo: this.correo,
      numero_empleado: this.numero_empleado,
      activo: this.activo,
      creado: this.created_at.toISOString(),
      actualizado: this.updated_at.toISOString(),
  
      // 🔽 nuevos campos
      cargo: this.cargo,
      departamento: this.departamento,
      infopersonal: this.infopersonal
    };
  }
}

export default Empleado;