// src/services/secuenciaService.js
import SecuenciaRepository from '../repositories/secuenciaRepository.js';
import ProyectoRepository from '../repositories/proyectoRepository.js';
import TestingCardRepository from '../repositories/testingCardRepository.js';
import Secuencia from '../models/Secuencia.js'; 
import ApiError from '../utils/ApiError.js';

class SecuenciaService {
  constructor(
    secuenciaRepository = new SecuenciaRepository(),
    proyectoRepository = new ProyectoRepository(),
    testingCardRepository = new TestingCardRepository()
  ) {
    this.secuenciaRepo = secuenciaRepository;
    this.proyectoRepo = proyectoRepository;
    this.testingCardRepo = testingCardRepository;
  }

  /**
   * Obtiene secuencias por ID de proyecto
   * @param {number} id_proyecto - ID del proyecto
   * @returns {Promise<Array>} Lista de secuencias
   * @throws {ApiError} Si el proyecto no existe
   */
  async obtenerPorProyecto(id_proyecto) {
    const proyecto = await this.proyectoRepo.obtenerPorId(id_proyecto);
    if (!proyecto) {
      throw new ApiError('Proyecto no encontrado', 404);
    }

    const secuencias = await this.secuenciaRepo.obtenerPorProyecto(id_proyecto);
    return secuencias.map(secuencia => secuencia.toAPI());
  }

  /**
   * Obtiene una secuencia por su ID
   * @param {number} id_secuencia - ID de la secuencia
   * @returns {Promise<Object>} Secuencia encontrada
   * @throws {ApiError} Si la secuencia no existe
   */
  async obtenerPorId(id_secuencia) {
    const secuencia = await this.secuenciaRepo.obtenerPorId(id_secuencia);
    if (!secuencia) {
      throw new ApiError('Secuencia no encontrada', 404);
    }
    return secuencia.toAPI();
  }
  /**
   * Obtiene todas las secuencias
   * @returns {Promise<Array>} Lista de secuencias
   */
  async obtenerTodas() {
    const secuencias = await this.secuenciaRepo.obtenerTodas();
    return secuencias.map(secuencia => secuencia.toAPI());
  }

  /**
 * Crea una nueva secuencia
 * @param {Object} secuenciaData - Datos de la secuencia
 * @returns {Promise<Object>} Secuencia creada
 * @throws {ApiError} Si proyecto o testing card no existen
 */
  async crear(secuenciaData) {
    // Verificar que el proyecto existe
    const proyecto = await this.proyectoRepo.obtenerPorId(secuenciaData.id_proyecto);
    if (!proyecto) {
      throw new ApiError('Proyecto no encontrado', 404);
    }

    // Verificar que el testing card existe (si aplica)
    // const testingCard = await this.testingCardRepo.obtenerPorId(secuenciaData.id_testing_card_padre);
    // if (!testingCard) {
    //   throw new ApiError('Testing card no encontrado', 404);
    // }

    const secuencia = await this.secuenciaRepo.crear(secuenciaData);
    return secuencia.toAPI();
  }   

  /**
   * Actualiza una secuencia existente
   * @param {number} id_secuencia - ID de la secuencia
   * @param {Object} secuenciaData - Datos a actualizar
   * @returns {Promise<Object>} Secuencia actualizada
   * @throws {ApiError} Si la secuencia no existe
   */
  async actualizar(id_secuencia, secuenciaData) {
    if (secuenciaData.id_testing_card_padre) {
      const testingCard = await this.testingCardRepo.obtenerPorId(secuenciaData.id_testing_card_padre);
      if (!testingCard) {
        throw new ApiError('Testing card no encontrado', 404);
      }
    }

    const secuencia = await this.secuenciaRepo.actualizar(id_secuencia, secuenciaData);
    return secuencia.toAPI();
  }

  /**
   * Elimina una secuencia
   * @param {number} id_secuencia - ID de la secuencia
   * @returns {Promise<Object>} Secuencia eliminada
   * @throws {ApiError} Si la secuencia no existe
   */
  async eliminar(id_secuencia) {
    const secuencia = await this.secuenciaRepo.eliminar(id_secuencia);
    return secuencia.toAPI();
  }
}

export default SecuenciaService;