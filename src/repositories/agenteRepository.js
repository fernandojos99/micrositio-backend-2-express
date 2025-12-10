// src/repositories/agenteRepository.js
import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import Agente from '../models/Agente.js';

class AgenteRepository {
  /**
   * Obtiene un agente por su ID
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Agente|null>} Agente encontrado o null
   */
  async obtenerPorId(id_agente) {
    const { data, error } = await supabase
      .from('agente')
      .select('*')
      .eq('id_agente', id_agente)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al obtener agente: ${error.message}`, 500);
    }

    return data ? Agente.fromDatabase(data) : null;
  }

  /**
   * Lista todos los agentes
   * @returns {Promise<Array<Agente>>} Lista de agentes
   */
  async listarTodos() {
    const { data, error } = await supabase
      .from('agente')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(`Error al listar agentes: ${error.message}`, 500);
    }

    return data.map(agente => Agente.fromDatabase(agente));
  }

  /**
   * Crea un nuevo agente
   * @param {Object} agenteData - Datos del agente
   * @returns {Promise<Agente>} Agente creado
   */
  async crear(agenteData) {
    const { data, error } = await supabase
      .from('agente')
      .insert(agenteData)
      .select();

    if (error) {
      throw new ApiError(`Error al crear agente: ${error.message}`, 500);
    }

    return Agente.fromDatabase(data[0]);
  }

  /**
   * Actualiza un agente existente
   * @param {number} id_agente - ID del agente
   * @param {Object} agenteData - Datos a actualizar
   * @returns {Promise<Agente|null>} Agente actualizado o null
   */
  async actualizar(id_agente, agenteData) {
    const { data, error } = await supabase
      .from('agente')
      .update({...agenteData, updated_at: new Date().toISOString()})
      .eq('id_agente', id_agente)
      .select();

    if (error) {
      throw new ApiError(`Error al actualizar agente: ${error.message}`, 500);
    }

    return data ? Agente.fromDatabase(data[0]) : null;
  }

  /**
   * Elimina un agente
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Agente|null>} Agente eliminado o null
   */
  async eliminar(id_agente) {
    const { data, error } = await supabase
      .from('agente')
      .delete()
      .eq('id_agente', id_agente)
      .select();

    if (error) {
      throw new ApiError(`Error al eliminar agente: ${error.message}`, 500);
    }

    return data ? Agente.fromDatabase(data[0]) : null;
  }

  /**
   * Buscar agentes por texto.
   * @param {string} q - Texto de búsqueda.
   * @returns {Promise<Array>} Lista de agentes que coinciden con el texto.
   */
  async buscarPorTexto(q) {
    try {
      const { data, error } = await supabase
        .from('agente')
        .select('*')
        .or(`nombre.ilike.%${q}%,apellido.ilike.%${q}%`);

      if (error) {
        throw new ApiError(`Error al buscar agentes: ${error.message}`, 500);
      }

      return data.map(agente => Agente.fromDatabase(agente));
    } catch (error) {
      console.error('Error en AgenteRepository.buscarPorTexto:', error);
      throw error;
    }
  }
}

export default AgenteRepository;
