// src/services/plantillaSecuenciaService.js
import plantillaSecuenciaRepository from '../repositories/plantillaSecuenciaRepository.js';
import PlantillaSecuencia from '../models/PlantillaSecuencia.js';
import ApiError from '../utils/ApiError.js';

class PlantillaSecuenciaService {
  /**
   * Obtiene una plantilla secuencia por su ID
   * @param {string} id - UUID de la plantilla secuencia
   * @returns {Promise<Object>} Plantilla secuencia en formato API
   * @throws {ApiError} Si la plantilla secuencia no existe
   */
  async obtenerPorId(id) {
    const plantillaSecuencia = await plantillaSecuenciaRepository.obtenerPorId(id);
    
    if (!plantillaSecuencia) {
      throw new ApiError('Plantilla secuencia no encontrada', 404);
    }

    return plantillaSecuencia.toAPI();
  }

  /**
   * Obtiene todas las plantillas secuencia
   * @returns {Promise<Object[]>} Array de plantillas secuencia en formato API
   */
  async obtenerTodas() {
    const plantillasSecuencia = await plantillaSecuenciaRepository.listarTodas();
    return plantillasSecuencia.map(plantillaSecuencia => plantillaSecuencia.toAPI());
  }

  /**
   * Crea una nueva plantilla secuencia
   * @param {Object} datosPlantillaSecuencia - Datos de la plantilla secuencia
   * @param {number} datosPlantillaSecuencia.id_secuencia - ID de la secuencia
   * @param {number} datosPlantillaSecuencia.id_empleado - ID del empleado
   * @returns {Promise<Object>} Plantilla secuencia creada en formato API
   * @throws {ApiError} Si los datos no son válidos o hay error en la creación
   */
  async crear(datosPlantillaSecuencia) {
    // Validar datos de entrada
    const datosValidados = PlantillaSecuencia.validateCreate(datosPlantillaSecuencia);
    
    // Crear la plantilla secuencia
    const nuevaPlantillaSecuencia = await plantillaSecuenciaRepository.crear(datosValidados);
    
    return nuevaPlantillaSecuencia.toAPI();
  }

  /**
   * Actualiza una plantilla secuencia existente
   * @param {string} id - UUID de la plantilla secuencia
   * @param {Object} datosActualizacion - Datos a actualizar
   * @returns {Promise<Object>} Plantilla secuencia actualizada en formato API
   * @throws {ApiError} Si la plantilla secuencia no existe o los datos no son válidos
   */
  async actualizar(id, datosActualizacion) {
    // Verificar que la plantilla secuencia existe
    await this.obtenerPorId(id);
    
    // Validar datos de actualización
    const datosValidados = PlantillaSecuencia.validateUpdate(datosActualizacion);
    
    // Actualizar la plantilla secuencia
    const plantillaSecuenciaActualizada = await plantillaSecuenciaRepository.actualizar(id, datosValidados);
    
    return plantillaSecuenciaActualizada.toAPI();
  }

  /**
   * Elimina una plantilla secuencia
   * @param {string} id - UUID de la plantilla secuencia
   * @returns {Promise<boolean>} true si se eliminó correctamente
   * @throws {ApiError} Si la plantilla secuencia no existe
   */
  async eliminar(id) {
    // Verificar que la plantilla secuencia existe
    await this.obtenerPorId(id);
    
    // Eliminar la plantilla secuencia
    return await plantillaSecuenciaRepository.eliminar(id);
  }

  /**
   * Verifica si existe una relación con secuencia específica
   * @param {number} idSecuencia - ID de la secuencia
   * @returns {Promise<boolean>} true si existe la relación
   */
  async existeRelacion(idSecuencia) {
    return await plantillaSecuenciaRepository.existeRelacion(idSecuencia);
  }
}

export default new PlantillaSecuenciaService();
