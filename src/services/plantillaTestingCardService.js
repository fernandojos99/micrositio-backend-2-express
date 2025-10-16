// src/services/plantillaTestingCardService.js
import PlantillaTestingCardRepository from '../repositories/plantillaTestingCardRepository.js';
import ApiError from '../utils/ApiError.js';

class PlantillaTestingCardService {
  constructor() {
    this.plantillaTestingCardRepo = new PlantillaTestingCardRepository();
  }

  /**
   * Obtiene una plantilla testing card por su ID
   * @param {string} id_plantilla_testing_card - ID de la plantilla testing card (UUID)
   * @returns {Promise<Object>} Plantilla testing card encontrada
   * @throws {ApiError} Si la plantilla testing card no existe
   */
  async obtenerPorId(id_plantilla_testing_card) {
    const plantilla = await this.plantillaTestingCardRepo.obtenerPorId(id_plantilla_testing_card);
    
    if (!plantilla) {
      throw new ApiError('Plantilla testing card no encontrada', 404);
    }
    
    return plantilla.toAPI();
  }

  /**
   * Lista todas las plantillas testing card
   * @returns {Promise<Array>} Lista de plantillas testing card
   */
  async listarTodas() {
    const plantillas = await this.plantillaTestingCardRepo.listarTodas();
    return plantillas.map(plantilla => plantilla.toAPI());
  }

  /**
   * Lista todas las plantillas testing card por empleado
   * @param {number} id_empleado - ID del empleado
   * @returns {Promise<Array>} Lista de plantillas testing card del empleado
   */
  async listarPorEmpleado(id_empleado) {
    const plantillas = await this.plantillaTestingCardRepo.listarPorEmpleado(id_empleado);
    return plantillas.map(plantilla => plantilla.toAPI());
  }

  /**
   * Lista todas las plantillas testing card por testing card
   * @param {number} id_testing_card - ID de la testing card
   * @returns {Promise<Array>} Lista de plantillas testing card de la testing card
   */
  async listarPorTestingCard(id_testing_card) {
    const plantillas = await this.plantillaTestingCardRepo.listarPorTestingCard(id_testing_card);
    return plantillas.map(plantilla => plantilla.toAPI());
  }

  /**
   * Crea una nueva plantilla testing card
   * @param {Object} plantillaData - Datos de la plantilla testing card
   * @returns {Promise<Object>} Plantilla testing card creada
   * @throws {ApiError} Si ya existe la relación o hay error en validación
   */
  async crear(plantillaData) {
    // Verificar si ya existe la relación
    const existeRelacion = await this.plantillaTestingCardRepo.existeRelacion(
      plantillaData.id_testing_card, 
      plantillaData.id_empleado
    );

    if (existeRelacion) {
      throw new ApiError('La relación entre testing card y empleado ya existe', 409);
    }

    const plantilla = await this.plantillaTestingCardRepo.crear(plantillaData);
    return plantilla.toAPI();
  }

  /**
   * Actualiza una plantilla testing card existente
   * @param {string} id_plantilla_testing_card - ID de la plantilla testing card (UUID)
   * @param {Object} plantillaData - Datos a actualizar
   * @returns {Promise<Object>} Plantilla testing card actualizada
   * @throws {ApiError} Si la plantilla testing card no existe o si la nueva relación ya existe
   */
  async actualizar(id_plantilla_testing_card, plantillaData) {
    // Verificar si la plantilla existe
    const plantillaExistente = await this.plantillaTestingCardRepo.obtenerPorId(id_plantilla_testing_card);
    if (!plantillaExistente) {
      throw new ApiError('Plantilla testing card no encontrada', 404);
    }

    // Si se está actualizando la relación, verificar que no exista ya
    if (plantillaData.id_testing_card && plantillaData.id_empleado) {
      // Solo verificar si es diferente a la relación actual
      if (plantillaExistente.id_testing_card !== plantillaData.id_testing_card || 
          plantillaExistente.id_empleado !== plantillaData.id_empleado) {
        const existeRelacion = await this.plantillaTestingCardRepo.existeRelacion(
          plantillaData.id_testing_card, 
          plantillaData.id_empleado
        );

        if (existeRelacion) {
          throw new ApiError('La nueva relación entre testing card y empleado ya existe', 409);
        }
      }
    }

    const plantilla = await this.plantillaTestingCardRepo.actualizar(id_plantilla_testing_card, plantillaData);
    
    if (!plantilla) {
      throw new ApiError('Plantilla testing card no encontrada', 404);
    }
    
    return plantilla.toAPI();
  }

  /**
   * Elimina una plantilla testing card
   * @param {string} id_plantilla_testing_card - ID de la plantilla testing card (UUID)
   * @returns {Promise<Object>} Plantilla testing card eliminada
   * @throws {ApiError} Si la plantilla testing card no existe
   */
  async eliminar(id_plantilla_testing_card) {
    const plantilla = await this.plantillaTestingCardRepo.eliminar(id_plantilla_testing_card);
    
    if (!plantilla) {
      throw new ApiError('Plantilla testing card no encontrada', 404);
    }
    
    return plantilla.toAPI();
  }
}

export default PlantillaTestingCardService;
