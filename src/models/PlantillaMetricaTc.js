// src/models/PlantillaMetricaTc.js
import { plantillaMetricaTcCreateSchema, plantillaMetricaTcUpdateSchema } from '../middlewares/validation/plantillaMetricaTcSchema.js';
import ApiError from '../utils/ApiError.js';

class PlantillaMetricaTc {
  constructor(data) {
    this.id_plantilla_metrica = data.id_plantilla_metrica;
    this.id_metrica = data.id_metrica;
    this.id_empleado = data.id_empleado;
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
  }

  /**
   * Valida los datos al crear una plantilla metrica tc
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateCreate(data) {
    try {
      return plantillaMetricaTcCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Valida los datos al actualizar una plantilla metrica tc
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateUpdate(data) {
    try {
      return plantillaMetricaTcUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Crea una instancia de PlantillaMetricaTc a partir de datos de la base de datos
   * @static
   * @param {Object} dbData - Datos de la base de datos
   * @returns {PlantillaMetricaTc} Instancia del modelo PlantillaMetricaTc
   */
  static fromDatabase(dbData) {
    return new PlantillaMetricaTc({
      id_plantilla_metrica: dbData.id_plantilla_metrica,
      id_metrica: dbData.id_metrica,
      id_empleado: dbData.id_empleado,
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
      id_metrica: this.id_metrica,
      id_empleado: this.id_empleado
    };
  }

  /**
   * Convierte el modelo a formato para respuesta de API
   * @returns {Object} Objeto para respuesta API
   */
  toAPI() {
    return {
      id_plantilla_metrica: this.id_plantilla_metrica,
      id_metrica: this.id_metrica,
      id_empleado: this.id_empleado,
      creado: this.created_at.toISOString(),
      actualizado: this.updated_at.toISOString()
    };
  }
}

export default PlantillaMetricaTc;
