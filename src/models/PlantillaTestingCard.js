// src/models/PlantillaTestingCard.js
import { plantillaTestingCardCreateSchema, plantillaTestingCardUpdateSchema } from '../middlewares/validation/plantillaTestingCardSchema.js';
import ApiError from '../utils/ApiError.js';

class PlantillaTestingCard {
  constructor(data) {
    this.id_plantilla_testing_card = data.id_plantilla_testing_card;
    this.id_testing_card = data.id_testing_card;
    this.id_empleado = data.id_empleado;
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
  }

  /**
   * Valida los datos al crear una plantilla testing card
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateCreate(data) {
    try {
      return plantillaTestingCardCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Valida los datos al actualizar una plantilla testing card
   * @static
   * @param {Object} data - Datos a validar
   * @returns {Object} Datos validados
   * @throws {ApiError} Si la validación falla
   */
  static validateUpdate(data) {
    try {
      return plantillaTestingCardUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(`Validación fallida: ${error.errors.map(e => e.message).join(', ')}`, 400);
    }
  }

  /**
   * Crea una instancia de PlantillaTestingCard a partir de datos de la base de datos
   * @static
   * @param {Object} dbData - Datos de la base de datos
   * @returns {PlantillaTestingCard} Instancia del modelo PlantillaTestingCard
   */
  static fromDatabase(dbData) {
    return new PlantillaTestingCard({
      id_plantilla_testing_card: dbData.id_plantilla_testing_card,
      id_testing_card: dbData.id_testing_card,
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
      id_testing_card: this.id_testing_card,
      id_empleado: this.id_empleado
    };
  }

  /**
   * Convierte el modelo a formato para respuesta de API
   * @returns {Object} Objeto para respuesta API
   */
  toAPI() {
    return {
      id_plantilla_testing_card: this.id_plantilla_testing_card,
      id_testing_card: this.id_testing_card,
      id_empleado: this.id_empleado,
      creado: this.created_at.toISOString(),
      actualizado: this.updated_at.toISOString()
    };
  }
}

export default PlantillaTestingCard;
