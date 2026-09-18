// src/repositories/urlFormatoRepository.js
import { consulta, uno, ejecutar, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import UrlFormatoModel from '../models/urlFormatoModel.js';
import ApiError from '../utils/ApiError.js';

class UrlFormatoRepository {
  constructor() {

    this.tableName = 'url_formato';
  }

  /**
   * Obtiene una URL formato por su ID
   * @param {number} id_url_formato
   * @returns {Promise<UrlFormatoModel|null>}
   */
  async obtenerPorId(id_url_formato) {
    const data = await conMensaje('Error al obtener URL formato',
      uno('SELECT * FROM url_formato WHERE id_url_formato = $1', [id_url_formato]));

    return data ? UrlFormatoModel.fromDatabase(data) : null;
  }

  /**
   * Obtiene todas las URLs formato
   * @returns {Promise<UrlFormatoModel[]>}
   * .
   */
  async obtenerTodas() {
    const data = await conMensaje('Error al obtener URLs formato',
      consulta('SELECT * FROM url_formato ORDER BY created_at DESC'));

    return data.map(row => UrlFormatoModel.fromDatabase(row));
  }

  /**
   * Crea una nueva URL formato
   * @param {Object} urlFormatoData
   * @returns {Promise<UrlFormatoModel>}
   */
  async crear(urlFormatoData) {
    const urlFormato = new UrlFormatoModel(urlFormatoData);
    const dataToInsert = urlFormato.toDatabase();

    const data = await conMensaje('Error al crear URL formato',
      exigirFila(insertarFilas(this.tableName, [dataToInsert])));

    return UrlFormatoModel.fromDatabase(data);
  }

  /**
   * Actualiza una URL formato (PATCH - actualización parcial)
   * @param {number} id_url_formato
   * @param {Object} updateData
   * @returns {Promise<UrlFormatoModel>}
   */
  async actualizar(id_url_formato, updateData) {
    // Solo actualizar los campos que vienen en updateData
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    const data = await conMensaje('Error al actualizar URL formato',
      exigirFila(actualizarFilas(this.tableName, dataToUpdate, 'id_url_formato = $1', [id_url_formato])));

    if (!data) {
      throw new ApiError('URL formato no encontrada', 404);
    }

    return UrlFormatoModel.fromDatabase(data);
  }

  /**
   * Elimina una URL formato
   * @param {number} id_url_formato
   * @returns {Promise<boolean>}
   */
  async eliminar(id_url_formato) {
    await conMensaje('Error al eliminar URL formato',
      ejecutar('DELETE FROM url_formato WHERE id_url_formato = $1', [id_url_formato]));

    return true;
  }
}

export default UrlFormatoRepository;
