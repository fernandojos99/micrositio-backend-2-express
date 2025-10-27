// src/services/plantillaTestingCardService.js
import PlantillaTestingCardRepository from '../repositories/plantillaTestingCardRepository.js';
import TestingCardService from './testingCardService.js';
import ApiError from '../utils/ApiError.js';

class PlantillaTestingCardService {
  constructor() {
    this.plantillaTestingCardRepo = new PlantillaTestingCardRepository();
    this.testingCardService = new TestingCardService();
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
   * Dado el id_testing_card A, crea una testing card copia B (sin id_secuencia)
   * y copia todas las métricas de A hacia B, luego crea la plantilla asociada a B
   * @param {Object} plantillaData - Datos de la plantilla testing card
   * @param {number} plantillaData.id_testing_card - ID de la testing card original a copiar
   * @param {number} plantillaData.id_empleado - ID del empleado
   * @returns {Promise<Object>} Plantilla testing card creada con testing card copiada
   * @throws {ApiError} Si la testing card original no existe o hay error en la copia
   */
  async crear(plantillaData) {
    const { id_testing_card, id_empleado } = plantillaData;

    // 1. Verificar que exista la testing card original (testing card A)
    try {
      await this.testingCardService.obtenerPorId(id_testing_card);
    } catch (error) {
      throw new ApiError('La testing card original no existe', 404);
    }

    // 2. Crear una copia de la testing card (testing card B) usando el nuevo endpoint
    const testingCardCopia = await this.testingCardService.copiarTestingCard(id_testing_card);

    // 3. Crear la plantilla testing card con la nueva testing card copiada (testing card B)
    const plantillaDataModificada = {
      id_testing_card: testingCardCopia.id_testing_card, // Usar el ID de la testing card copiada
      id_empleado: id_empleado
    };

    const plantilla = await this.plantillaTestingCardRepo.crear(plantillaDataModificada);
    
    // 4. Añadir información adicional sobre la copia realizada
    const resultado = plantilla.toAPI();
    resultado.testing_card_copia = {
      id_testing_card_original: id_testing_card,
      id_testing_card_copia: testingCardCopia.id_testing_card,
      titulo_copia: testingCardCopia.titulo,
      metricas_copiadas: testingCardCopia.metricas_copiadas || 0
    };

    return resultado;
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
   * Elimina una plantilla testing card y su testing card asociada
   * @param {string} id_plantilla_testing_card - ID de la plantilla testing card (UUID) 
   * @returns {Promise<Object>} Plantilla testing card eliminada con información de la testing card eliminada
   * @throws {ApiError} Si la plantilla testing card no existe
   */
  async eliminar(id_plantilla_testing_card) {
    // 1. Obtener la plantilla antes de eliminarla para saber qué testing card eliminar
    const plantillaExistente = await this.plantillaTestingCardRepo.obtenerPorId(id_plantilla_testing_card);
    
    if (!plantillaExistente) {
      throw new ApiError('Plantilla testing card no encontrada', 404);
    }

    // 2. Eliminar la plantilla testing card
    const plantillaEliminada = await this.plantillaTestingCardRepo.eliminar(id_plantilla_testing_card);
    
    if (!plantillaEliminada) {
      throw new ApiError('Plantilla testing card no encontrada', 404);
    }

    // 3. Eliminar la testing card asociada (que fue creada como copia)
    try {
      await this.testingCardService.eliminar(plantillaExistente.id_testing_card);
    } catch (error) {
      // Si falla eliminar la testing card, registrar el error pero no fallar toda la operación
      console.error(`Error al eliminar testing card asociada ${plantillaExistente.id_testing_card}:`, error);
      // Nota: En un entorno de producción, podrías querer implementar un mecanismo de limpieza
    }
    
    // 4. Preparar respuesta con información de lo que se eliminó
    const resultado = plantillaEliminada.toAPI();
    resultado.testing_card_eliminada = {
      id_testing_card: plantillaExistente.id_testing_card,
      mensaje: 'Testing card asociada eliminada exitosamente'
    };

    return resultado;
  }
}

export default PlantillaTestingCardService;
