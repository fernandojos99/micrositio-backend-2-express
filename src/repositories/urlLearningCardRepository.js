// src/repositories/urlLearningCardRepository.js
import { consulta, uno, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import UrlLearningCard from '../models/UrlLearningCard.js';

class UrlLearningCardRepository {
  /**
   * Obtiene URLs por learning card
   * @param {number} idLearningCard - ID de la learning card
   * @returns {Promise<Array>} Lista de URLs
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerPorLearningCard(idLearningCard) {
    const data = await conMensaje('Error al obtener URLs',
      consulta('SELECT * FROM url_learning_card WHERE id_learning_card = $1', [idLearningCard]));

    return data.map(url => UrlLearningCard.fromDatabase(url));
  }

  /**
   * Obtiene una URL por su ID
   * @param {number} idUrl - ID de la URL
   * @returns {Promise<UrlLearningCard|null>} URL encontrada o null
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerPorId(idUrl) {
    const data = await conMensaje('Error al obtener URL',
      uno('SELECT * FROM url_learning_card WHERE id_url_lc = $1', [idUrl]));

    return data ? UrlLearningCard.fromDatabase(data) : null;
  }

  /**
   * Obtiene todas las URLs
   * @returns {Promise<Array>} Lista de todas las URLs
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerTodas() {
    const data = await conMensaje('Error al obtener URLs',
      consulta('SELECT * FROM url_learning_card'));

    return data.map(url => UrlLearningCard.fromDatabase(url));
  }

  /**
   * Crea una nueva URL
   * @param {Object} urlData - Datos de la URL
   * @returns {Promise<UrlLearningCard>} URL creada
   * @throws {ApiError} Si hay error al crear
   */
  async crear(urlData) {
    const data = await conMensaje('Error al crear URL',
      exigirFila(insertarFilas('url_learning_card', urlData)));

    return UrlLearningCard.fromDatabase(data);
  }

  /**
   * Actualiza una URL
   * @param {number} idUrl - ID de la URL
   * @param {Object} urlData - Datos a actualizar
   * @returns {Promise<UrlLearningCard|null>} URL actualizada o null
   * @throws {ApiError} Si hay error al actualizar
   */
  async actualizar(idUrl, urlData) {
    const data = await conMensaje('Error al actualizar URL',
      exigirFila(actualizarFilas('url_learning_card', urlData, 'id_url_lc = $1', [idUrl])));

    return data ? UrlLearningCard.fromDatabase(data) : null;
  }

  /**
   * Elimina una URL
   * @param {number} idUrl - ID de la URL
   * @returns {Promise<UrlLearningCard|null>} URL eliminada o null
   * @throws {ApiError} Si hay error al eliminar
   */
  async eliminar(idUrl) {
    const data = await conMensaje('Error al eliminar URL',
      exigirFila(consulta('DELETE FROM url_learning_card WHERE id_url_lc = $1 RETURNING *', [idUrl])));

    return data ? UrlLearningCard.fromDatabase(data) : null;
  }

  /**
   * Verifica si existe una learning card
   * @param {number} idLearningCard - ID de la learning card
   * @returns {Promise<boolean>} True si existe
   * @throws {ApiError} Si hay error al consultar
   */
  async existeLearningCard(idLearningCard) {
    const data = await conMensaje('Error al verificar learning card',
      uno('SELECT id FROM learning_card WHERE id = $1', [idLearningCard]));

    return !!data;
  }
}

export default UrlLearningCardRepository;
