// src/models/PlantillaSecuencia.js
import { plantillaSecuenciaCreateSchema, plantillaSecuenciaUpdateSchema } from '../middlewares/validation/plantillaSecuenciaSchema.js';
import ApiError from '../utils/ApiError.js';

class PlantillaSecuencia {
  constructor(data) {
    this.id_plantilla_secuencia = data.id_plantilla_secuencia;
    this.id_secuencia = data.id_secuencia;
    this.id_empleado = data.id_empleado;
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
  }

  /**
   * Valida los datos al crear una plantilla secuencia
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateCreate(data) {
    try {
      return plantillaSecuenciaCreateSchema.parse(data);
    } catch (error) {
      const errorDetails = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new ApiError(`Validación fallida: ${errorDetails}`, 400);
    }
  }

  /**
   * Valida los datos al actualizar una plantilla secuencia
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateUpdate(data) {
    try {
      return plantillaSecuenciaUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Crea una instancia de PlantillaSecuencia a partir de datos de la base de datos
   * @static
   * @param {Object} dbData - Datos de la base de datos
   * @returns {PlantillaSecuencia} Instancia del modelo PlantillaSecuencia
   */
  static fromDatabase(dbData) {
    return new PlantillaSecuencia({
      id_plantilla_secuencia: dbData.id_plantilla_secuencia,
      id_secuencia: dbData.id_secuencia,
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
      id_secuencia: this.id_secuencia,
      id_empleado: this.id_empleado
    };
  }

  /**
   * Convierte el modelo a formato para respuesta de API
   * @returns {Object} Objeto para respuesta API
   */
  toAPI() {
    return {
      id_plantilla_secuencia: this.id_plantilla_secuencia,
      id_secuencia: this.id_secuencia,
      id_empleado: this.id_empleado,
      creado: this.created_at.toISOString(),
      actualizado: this.updated_at.toISOString()
    };
  }
}

export default PlantillaSecuencia;
