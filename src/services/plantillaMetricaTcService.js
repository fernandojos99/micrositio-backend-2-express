// src/services/plantillaMetricaTcService.js
import PlantillaMetricaTcRepository from '../repositories/plantillaMetricaTcRepository.js';
import MetricaTestingCardRepository from '../repositories/metricaTestingCardRepository.js';
import ApiError from '../utils/ApiError.js';

class PlantillaMetricaTcService {
  constructor() {
    this.plantillaMetricaTcRepo = new PlantillaMetricaTcRepository();
    this.metricaRepo = new MetricaTestingCardRepository();
  }

  /**
   * Obtiene una plantilla métrica tc por su ID
   * @param {string} id_plantilla_metrica - ID de la plantilla métrica tc (UUID)
   * @returns {Promise<Object>} Plantilla métrica tc encontrada
   * @throws {ApiError} Si la plantilla métrica tc no existe
   */
  async obtenerPorId(id_plantilla_metrica) {
    const plantilla = await this.plantillaMetricaTcRepo.obtenerPorId(id_plantilla_metrica);
    
    if (!plantilla) {
      throw new ApiError('Plantilla métrica tc no encontrada', 404);
    }
    
    return plantilla.toAPI();
  }

  /**
   * Lista todas las plantillas métrica tc
   * @returns {Promise<Array>} Lista de plantillas métrica tc
   */
  async listarTodas() {
    const plantillas = await this.plantillaMetricaTcRepo.listarTodas();
    return plantillas.map(plantilla => plantilla.toAPI());
  }

  /**
   * Lista todas las plantillas métrica tc por empleado
   * @param {number} id_empleado - ID del empleado
   * @returns {Promise<Array>} Lista de plantillas métrica tc del empleado
   */
  async listarPorEmpleado(id_empleado) {
    const plantillas = await this.plantillaMetricaTcRepo.listarPorEmpleado(id_empleado);
    return plantillas.map(plantilla => plantilla.toAPI());
  }

  /**
   * Lista todas las plantillas métrica tc por métrica
   * @param {number} id_metrica - ID de la métrica
   * @returns {Promise<Array>} Lista de plantillas métrica tc de la métrica
   */
  async listarPorMetrica(id_metrica) {
    const plantillas = await this.plantillaMetricaTcRepo.listarPorMetrica(id_metrica);
    return plantillas.map(plantilla => plantilla.toAPI());
  }

  /**
   * Crea una nueva plantilla métrica tc
   * @param {Object} plantillaData - Datos de la plantilla métrica tc
   * @param {number} plantillaData.id_metrica_tc - ID de la métrica original a copiar
   * @param {number} plantillaData.id_empleado - ID del empleado
   * @returns {Promise<Object>} Plantilla métrica tc creada
   * @throws {ApiError} Si no existe la métrica original, empleado, o hay error en validación
   */
  async crear(plantillaData) {
    const { id_metrica_tc, id_empleado } = plantillaData;

    // 1. Verificar que exista la métrica original (métrica A)
    const metricaOriginal = await this.metricaRepo.obtenerPorId(id_metrica_tc);
    if (!metricaOriginal) {
      throw new ApiError('La métrica original no existe', 404);
    }

    // 2. Verificar que exista el empleado - esto lo hará el constraint de la BD
    // pero podríamos agregar validación adicional aquí si es necesario

    // 3. Crear una copia de la métrica (métrica B)
    const metricaCopia = await this.metricaRepo.copiarMetrica(id_metrica_tc);

    // 4. Crear la plantilla métrica con la nueva métrica copiada (métrica B)
    const plantillaDataModificada = {
      id_metrica: metricaCopia.id_metrica, // Usar el ID de la métrica copiada
      id_empleado: id_empleado
    };

    const plantilla = await this.plantillaMetricaTcRepo.crear(plantillaDataModificada);
    return plantilla.toAPI();
  }

  /**
   * Actualiza una plantilla métrica tc existente
   * @param {string} id_plantilla_metrica - ID de la plantilla métrica tc (UUID)
   * @param {Object} plantillaData - Datos a actualizar
   * @returns {Promise<Object>} Plantilla métrica tc actualizada
   * @throws {ApiError} Si la plantilla métrica tc no existe o si la nueva relación ya existe
   */
  async actualizar(id_plantilla_metrica, plantillaData) {
    // Verificar si la plantilla existe
    const plantillaExistente = await this.plantillaMetricaTcRepo.obtenerPorId(id_plantilla_metrica);
    if (!plantillaExistente) {
      throw new ApiError('Plantilla métrica tc no encontrada', 404);
    }

    // Si se está actualizando la relación, verificar que no exista ya
    if (plantillaData.id_metrica && plantillaData.id_empleado) {
      // Solo verificar si es diferente a la relación actual
      if (plantillaExistente.id_metrica !== plantillaData.id_metrica || 
          plantillaExistente.id_empleado !== plantillaData.id_empleado) {
        const existeRelacion = await this.plantillaMetricaTcRepo.existeRelacion(
          plantillaData.id_metrica, 
          plantillaData.id_empleado
        );

        if (existeRelacion) {
          throw new ApiError('La nueva relación entre métrica y empleado ya existe', 409);
        }
      }
    }

    const plantilla = await this.plantillaMetricaTcRepo.actualizar(id_plantilla_metrica, plantillaData);
    
    if (!plantilla) {
      throw new ApiError('Plantilla métrica tc no encontrada', 404);
    }
    
    return plantilla.toAPI();
  }

  /**
   * Elimina una plantilla métrica tc
   * @param {string} id_plantilla_metrica - ID de la plantilla métrica tc (UUID)
   * @returns {Promise<Object>} Plantilla métrica tc eliminada
   * @throws {ApiError} Si la plantilla métrica tc no existe
   */
  async eliminar(id_plantilla_metrica) {
    // 1. Obtener la plantilla antes de eliminarla para saber qué métrica eliminar
    const plantillaExistente = await this.plantillaMetricaTcRepo.obtenerPorId(id_plantilla_metrica);
    
    if (!plantillaExistente) {
      throw new ApiError('Plantilla métrica tc no encontrada', 404);
    }

    // 2. Eliminar la plantilla métrica
    const plantillaEliminada = await this.plantillaMetricaTcRepo.eliminar(id_plantilla_metrica);
    
    if (!plantillaEliminada) {
      throw new ApiError('Plantilla métrica tc no encontrada', 404);
    }

    // 3. Eliminar la métrica copiada (métrica B) de la tabla metrica_testing_card
    try {
      await this.metricaRepo.eliminar(plantillaExistente.id_metrica);
    } catch (error) {
      // Si falla eliminar la métrica, registrar el error pero no fallar toda la operación
      console.error(`Error al eliminar métrica copiada ${plantillaExistente.id_metrica}:`, error);
      // Nota: En un entorno de producción, podrías querer implementar un mecanismo de limpieza
    }
    
    return plantillaEliminada.toAPI();
  }
}

export default PlantillaMetricaTcService;
