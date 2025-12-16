// src/services/urlFormatoService.js
import UrlFormatoRepository from '../repositories/urlFormatoRepository.js';
import ApiError from '../utils/ApiError.js';

class UrlFormatoService {
  constructor() {
    this.urlFormatoRepository = new UrlFormatoRepository();
  }

  /**
   * Obtiene una URL formato por su ID
   * @param {number} id_url_formato 
   * @returns {Promise<Object>}
   */
  async obtenerPorId(id_url_formato) {
    const urlFormato = await this.urlFormatoRepository.obtenerPorId(id_url_formato);
    
    if (!urlFormato) {
      throw new ApiError('URL formato no encontrada', 404);
    }

    return urlFormato;
  }

  /**
   * Obtiene todas las URLs formato
   * @returns {Promise<Array>}
   */
  async obtenerTodas() {
    return await this.urlFormatoRepository.obtenerTodas();
  }

  /**
   * Crea una nueva URL formato
   * @param {Object} urlFormatoData 
   * @returns {Promise<Object>}
   */
  async crear(urlFormatoData) {
    return await this.urlFormatoRepository.crear(urlFormatoData);
  }

  /**
   * Actualiza una URL formato
   * @param {number} id_url_formato 
   * @param {Object} updateData 
   * @returns {Promise<Object>}
   */
  async actualizar(id_url_formato, updateData) {
    // Verificar que la URL formato existe
    await this.obtenerPorId(id_url_formato);
    
    return await this.urlFormatoRepository.actualizar(id_url_formato, updateData);
  }

  /**
   * Elimina una URL formato
   * @param {number} id_url_formato 
   * @returns {Promise<boolean>}
   */
  async eliminar(id_url_formato) {
    // Verificar que la URL formato existe
    await this.obtenerPorId(id_url_formato);
    
    return await this.urlFormatoRepository.eliminar(id_url_formato);
  }
}

export default UrlFormatoService;