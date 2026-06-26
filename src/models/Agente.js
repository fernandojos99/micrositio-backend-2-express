// src/models/Agente.js
import { agenteCreateSchema, agenteUpdateSchema } from '../middlewares/validation/agenteSchema.js';
import ApiError from '../utils/ApiError.js';

class Agente {
  constructor(data) {
    this.id_agente = data.id_agente;
    this.nombre = data.nombre;
    this.link = data.link || null;
    this.descripcion = data.descripcion || null;
    this.prompt = data.prompt || null;
    this.categoria = data.categoria || null;
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
  }

  /**
   * Valida los datos al crear un agente
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateCreate(data) {
    try {
      return agenteCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Valida los datos al actualizar un agente
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateUpdate(data) {
    try {
      return agenteUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Crea una instancia de Agente a partir de datos de la base de datos
   * @static
   * @param {Object} dbData - Datos de la base de datos
   * @returns {Agente} Instancia del modelo Agente
   */
  static fromDatabase(dbData) {
    return new Agente({
      id_agente: dbData.id_agente,
      nombre: dbData.nombre,
      link: dbData.link,
      descripcion: dbData.descripcion,
      prompt: dbData.prompt,
      categoria: dbData.categoria,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    });
  }

  /**
   * Convierte el modelo a formato para la base de datos
   * @returns {Object} Objeto para insertar/actualizar en BD
   */
  toDatabase() {
    return {
      nombre: this.nombre,
      link: this.link,
      descripcion: this.descripcion,
      prompt: this.prompt,
      categoria: this.categoria
    };
  }

  /**
   * Convierte el modelo a formato para respuesta de API
   * @returns {Object} Objeto para respuesta API
   */
  toAPI() {
    return {
      id_agente: this.id_agente,
      nombre: this.nombre,
      link: this.link,
      descripcion: this.descripcion,
      prompt: this.prompt,
      categoria: this.categoria,
      creado: this.created_at.toISOString(),
      actualizado: this.updated_at.toISOString()
    };
  }
}

export default Agente;
