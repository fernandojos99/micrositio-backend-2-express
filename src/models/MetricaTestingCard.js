// src/models/MetricaTestingCard.js
/**
 * Modelo para métricas de testing card
 * @class
 */
import { metricaCreateSchema, metricaUpdateSchema, metricaResultadoUpdateSchema } from '../middlewares/validation/metricaTestingCardSchema.js';
import ApiError from '../utils/ApiError.js';

class MetricaTestingCard {
  /**
   * Crea una instancia del modelo MetricaTestingCard
   * @param {Object} data - Datos de la métrica
   */  constructor(data) {
    this.id_metrica = data.id_metrica;
    this.id_testing_card = data.id_testing_card;
    this.nombre = data.nombre;
    this.operador = data.operador;
    this.criterio = data.criterio;
    this.resultado = data.resultado || null;
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
  }

  /**
   * Valida los datos al crear una métrica
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateCreate(data) {
    try {
      return metricaCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Valida los datos al actualizar una métrica
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateUpdate(data) {
    try {
      return metricaUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Valida los datos al actualizar el resultado de una métrica
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateResultadoUpdate(data) {
    try {
      return metricaResultadoUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Crea instancia a partir de datos de la base de datos
   * @static
   * @param {Object} dbData - Datos de la BD
   * @returns {MetricaTestingCard} Instancia del modelo
   */  static fromDatabase(dbData) {
    return new MetricaTestingCard({
      id_metrica: dbData.id_metrica,
      id_testing_card: dbData.id_testing_card,
      nombre: dbData.nombre,
      operador: dbData.operador,
      criterio: dbData.criterio,
      resultado: dbData.resultado,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    });
  }

  /**
   * Convierte el modelo a formato para la API
   * @returns {Object} Objeto para respuesta API
   */  toAPI() {
    return {
      id_metrica: this.id_metrica,
      id_testing_card: this.id_testing_card,
      nombre: this.nombre,
      operador: this.operador,
      criterio: this.criterio,
      resultado: this.resultado,
      creado: this.created_at.toISOString(),
      actualizado: this.updated_at.toISOString()
    };
  }
}

export default MetricaTestingCard;