// src/repositories/urlFormatoRepository.js
import supabase from '../config/supabaseClient.js';
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
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id_url_formato', id_url_formato)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new ApiError(`Error al obtener URL formato: ${error.message}`, 500);
    }

    return data ? UrlFormatoModel.fromDatabase(data) : null;
  }

  /**
   * Obtiene todas las URLs formato
   * @returns {Promise<UrlFormatoModel[]>}
   * .
   */
  async obtenerTodas() {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(`Error al obtener URLs formato: ${error.message}`, 500);
    }

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

    const { data, error } = await supabase
      .from(this.tableName)
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al crear URL formato: ${error.message}`, 500);
    }

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

    const { data, error } = await supabase
      .from(this.tableName)
      .update(dataToUpdate)
      .eq('id_url_formato', id_url_formato)
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al actualizar URL formato: ${error.message}`, 500);
    }

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
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id_url_formato', id_url_formato);

    if (error) {
      throw new ApiError(`Error al eliminar URL formato: ${error.message}`, 500);
    }

    return true;
  }
}

export default UrlFormatoRepository;
