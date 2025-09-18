// src/models/AgenteCategoria.js
import { agenteCategoriaCreateSchema, agenteCategoriaUpdateSchema } from '../middlewares/validation/agenteCategoriaSchema.js';
import ApiError from '../utils/ApiError.js';

class AgenteCategoria {
  constructor(data) {
    this.id_relacion_agente_categoria = data.id_relacion_agente_categoria;
    this.id_agente = data.id_agente;
    this.id_categoria = data.id_categoria;
    this.es_principal = data.es_principal || false;
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
  }

  /**
   * Valida los datos al crear una relación agente-categoría
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateCreate(data) {
    try {
      return agenteCategoriaCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Valida los datos al actualizar una relación agente-categoría
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateUpdate(data) {
    try {
      return agenteCategoriaUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Crea una instancia de AgenteCategoria a partir de datos de la base de datos
   * @static
   * @param {Object} dbData - Datos de la base de datos
   * @returns {AgenteCategoria} Instancia del modelo AgenteCategoria
   */
  static fromDatabase(dbData) {
    return new AgenteCategoria({
      id_agente: dbData.id_agente,
      id_categoria: dbData.id_categoria,
      es_principal: dbData.es_principal,
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
      id_agente: this.id_agente,
      id_categoria: this.id_categoria,
      es_principal: this.es_principal
    };
  }

  /**
   * Convierte el modelo a formato para respuesta de API
   * @returns {Object} Objeto para respuesta API
   */
  toAPI() {
    return {
      id_relacion_agente_categoria: this.id_relacion_agente_categoria,
      id_agente: this.id_agente,
      id_categoria: this.id_categoria,
      es_principal: this.es_principal,
      creado: this.created_at.toISOString(),
      actualizado: this.updated_at.toISOString()
    };
  }
}

export default AgenteCategoria;
