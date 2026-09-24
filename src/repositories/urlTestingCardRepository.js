// src/repositories/urlTestingCardRepository.js
import { consulta, uno, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import UrlTestingCard from '../models/UrlTestingCard.js';

class UrlTestingCardRepository {
  /**
   * Obtiene URLs por testing card
   * @param {number} idTestingCard - ID de la testing card
   * @returns {Promise<Array>} Lista de URLs
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerPorTestingCard(idTestingCard) {
    const data = await conMensaje('Error al obtener URLs',
      consulta('SELECT * FROM url_testing_card WHERE id_testing_card = $1', [idTestingCard]));

    return data.map(url => UrlTestingCard.fromDatabase(url));
  }

  /**
   * Obtiene una URL por su ID
   * @param {number} idUrl - ID de la URL
   * @returns {Promise<UrlTestingCard|null>} URL encontrada o null
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerPorId(idUrl) {
    const data = await conMensaje('Error al obtener URL',
      uno('SELECT * FROM url_testing_card WHERE id_url_tc = $1', [idUrl]));

    return data ? UrlTestingCard.fromDatabase(data) : null;
  }

  /**
   * Obtiene todas las URLs
   * @returns {Promise<Array>} Lista de todas las URLs
   * @throws {ApiError} Si hay error al consultar
   */
  async obtenerTodas() {
    const data = await conMensaje('Error al obtener URLs',
      consulta('SELECT * FROM url_testing_card'));

    return data.map(url => UrlTestingCard.fromDatabase(url));
  }

  /**
   * Crea una nueva URL
   * @param {Object} urlData - Datos de la URL
   * @returns {Promise<UrlTestingCard>} URL creada
   * @throws {ApiError} Si hay error al crear
   */
  async crear(urlData) {
    const data = await conMensaje('Error al crear URL',
      exigirFila(insertarFilas('url_testing_card', urlData)));

    return UrlTestingCard.fromDatabase(data);
  }

  /**
   * Actualiza una URL
   * @param {number} idUrl - ID de la URL
   * @param {Object} urlData - Datos a actualizar
   * @returns {Promise<UrlTestingCard|null>} URL actualizada o null
   * @throws {ApiError} Si hay error al actualizar
   */
  async actualizar(idUrl, urlData) {
    const data = await conMensaje('Error al actualizar URL',
      exigirFila(actualizarFilas('url_testing_card', urlData, 'id_url_tc = $1', [idUrl])));

    return data ? UrlTestingCard.fromDatabase(data) : null;
  }

  /**
   * Elimina una URL
   * @param {number} idUrl - ID de la URL
   * @returns {Promise<UrlTestingCard|null>} URL eliminada o null
   * @throws {ApiError} Si hay error al eliminar
   */
  async eliminar(idUrl) {
    const data = await conMensaje('Error al eliminar URL',
      exigirFila(consulta('DELETE FROM url_testing_card WHERE id_url_tc = $1 RETURNING *', [idUrl])));

    return data ? UrlTestingCard.fromDatabase(data) : null;
  }

  /**
   * Verifica si existe una testing card
   * @param {number} idTestingCard - ID de la testing card
   * @returns {Promise<boolean>} True si existe
   * @throws {ApiError} Si hay error al consultar
   */
  async existeTestingCard(idTestingCard) {
    const data = await conMensaje('Error al verificar testing card',
      uno('SELECT id_testing_card FROM testing_card WHERE id_testing_card = $1', [idTestingCard]));

    return !!data;
  }
}

export default UrlTestingCardRepository;
