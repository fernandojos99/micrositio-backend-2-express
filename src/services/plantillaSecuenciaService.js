// src/services/plantillaSecuenciaService.js
import plantillaSecuenciaRepository from '../repositories/plantillaSecuenciaRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import MetricaTestingCardRepository from '../repositories/metricaTestingCardRepository.js';
import PlantillaSecuencia from '../models/PlantillaSecuencia.js';
import ApiError from '../utils/ApiError.js';

class PlantillaSecuenciaService {
  constructor() {
    this.testingCardRepo = new TestingCardRepository();
    this.metricaRepo = new MetricaTestingCardRepository();
  }
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
   * @param {number} datosPlantillaSecuencia.id_testing_card - ID de la testing card original a copiar
   * @param {number} datosPlantillaSecuencia.id_empleado - ID del empleado
   * @returns {Promise<Object>} Plantilla secuencia creada en formato API
   * @throws {ApiError} Si los datos no son válidos o hay error en la creación
   */
  async crear(datosPlantillaSecuencia) {
    const { id_testing_card, id_empleado } = datosPlantillaSecuencia;

    // 1. Verificar que existe la testing card original (A)
    const testingCardOriginal = await this.testingCardRepo.obtenerPorId(id_testing_card);
    if (!testingCardOriginal) {
      throw new ApiError('La testing card original no existe', 404);
    }

    // 2. Crear una copia de la testing card (B) sin el id_secuencia
    const datosParaCopia = {
      titulo: testingCardOriginal.titulo,
      descripcion: testingCardOriginal.descripcion,
      tiempo_estimado: testingCardOriginal.tiempo_estimado,
      padre_id: testingCardOriginal.padre_id,
      // Deliberadamente omitimos id_secuencia para que la copia no tenga secuencia
    };

    const testingCardCopia = await this.testingCardRepo.crear(datosParaCopia);

    // 3. Obtener las métricas de la testing card original (A)
    const metricasOriginales = await this.metricaRepo.obtenerPorTestingCard(id_testing_card);

    // 4. Copiar cada métrica y asociarla a la testing card copia (B)
    const metricasCopiadas = [];
    for (const metricaOriginal of metricasOriginales) {
      const datosMetricaCopia = {
        id_testing_card: testingCardCopia.id_testing_card, // Asociar a la testing card copia
        nombre: metricaOriginal.nombre,
        operador: metricaOriginal.operador,
        criterio: metricaOriginal.criterio
      };
      
      const metricaCopia = await this.metricaRepo.crear(datosMetricaCopia);
      metricasCopiadas.push(metricaCopia);
    }

    // 5. Crear la plantilla secuencia con la testing card copia (B)
    // Nota: Almacenamos el ID de la testing card copia en el campo id_secuencia
    // para mantener compatibilidad con la estructura de BD existente
    const datosPlantilla = {
      id_secuencia: testingCardCopia.id_testing_card, // Almacenar el ID de la testing card copia
      id_empleado: id_empleado
    };

    // Validar datos para BD
    const datosValidados = PlantillaSecuencia.validateDB(datosPlantilla);
    
    // Crear la plantilla secuencia
    const nuevaPlantillaSecuencia = await plantillaSecuenciaRepository.crear(datosValidados);
    
    const resultado = nuevaPlantillaSecuencia.toAPI();
    
    // Agregar información adicional sobre las copias creadas
    resultado.testing_card_copia_id = testingCardCopia.id_testing_card;
    resultado.metricas_copiadas_count = metricasCopiadas.length;
    
    return resultado;
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
