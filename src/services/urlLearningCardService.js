// src/services/urlLearningCardService.js
import UrlLearningCardRepository from '../repositories/urlLearningCardRepository.js';
import ApiError from '../utils/ApiError.js';

class UrlLearningCardService {
  constructor() {
    this.urlRepo = new UrlLearningCardRepository();
  }

  /**
   * Obtiene URLs por learning card
   * @param {number} idLearningCard - ID de la learning card
   * @returns {Promise<Array>} Lista de URLs
   * @throws {ApiError} Si no existe la learning card o no tiene URLs
   */
  async obtenerPorLearningCard(idLearningCard) {
    const existeLC = await this.urlRepo.existeLearningCard(idLearningCard);
    if (!existeLC) {
      throw new ApiError('Learning card no encontrada', 404);
    }

    const urls = await this.urlRepo.obtenerPorLearningCard(idLearningCard);

    //Segun no debe de mandar este error 
    // if (urls.length === 0) {
    //   throw new ApiError('La learning card no tiene URLs asociadas', 404);
    // }

    return urls.map(u => u.toAPI());
  }

  /**
   * Obtiene una URL por su ID
   * @param {number} idUrl - ID de la URL
   * @returns {Promise<Object>} URL encontrada
   * @throws {ApiError} Si la URL no existe
   */
  async obtenerPorId(idUrl) {
    const url = await this.urlRepo.obtenerPorId(idUrl);
    if (!url) {
      throw new ApiError('URL no encontrada', 404);
    }

    return url.toAPI();
  }

  /**
   * Obtiene todas las URLs
   * @returns {Promise<Array>} Lista de todas las URLs
   */
  async obtenerTodas() {
    const urls = await this.urlRepo.obtenerTodas();
    return urls.map(u => u.toAPI());
  }

  /**
   * Crea una nueva URL
   * @param {Object} urlData - Datos de la URL
   * @returns {Promise<Object>} URL creada
   * @throws {ApiError} Si no existe la learning card o error de validación
   */
  async crear(urlData) {
    // Verificar que existe la learning card
    const existeLC = await this.urlRepo.existeLearningCard(urlData.id_learning_card);
    if (!existeLC) {
      throw new ApiError('Learning card no encontrada', 404);
    }

    const url = await this.urlRepo.crear(urlData);
    return url.toAPI();
  }

  /**
   * Actualiza una URL
   * @param {number} idUrl - ID de la URL
   * @param {Object} urlData - Datos a actualizar
   * @returns {Promise<Object>} URL actualizada
   * @throws {ApiError} Si la URL no existe
   */
  async actualizar(idUrl, urlData) {
    const url = await this.urlRepo.actualizar(idUrl, urlData);
    if (!url) {
      throw new ApiError('URL no encontrada', 404);
    }

    return url.toAPI();
  }

  /**
   * Elimina una URL
   * @param {number} idUrl - ID de la URL
   * @returns {Promise<Object>} URL eliminada
   * @throws {ApiError} Si la URL no existe
   */
  async eliminar(idUrl) {
    const url = await this.urlRepo.eliminar(idUrl);
    if (!url) {
      throw new ApiError('URL no encontrada', 404);
    }

    return url.toAPI();
  }
}

export default UrlLearningCardService;
