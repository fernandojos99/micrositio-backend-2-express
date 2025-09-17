// src/repositories/agenteCategoriaRepository.js
import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import AgenteCategoria from '../models/AgenteCategoria.js';

class AgenteCategoriaRepository {
  /**
   * Obtiene una relación agente-categoría por sus IDs compuestos
   * @param {number} id_agente - ID del agente
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<AgenteCategoria|null>} Relación encontrada o null
   */
  async obtenerPorId(id_agente, id_categoria) {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .select('*')
      .eq('id_agente', id_agente)
      .eq('id_categoria', id_categoria)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al obtener relación agente-categoría: ${error.message}`, 500);
    }

    return data ? AgenteCategoria.fromDatabase(data) : null;
  }

  /**
   * Lista todas las relaciones agente-categoría
   * @returns {Promise<Array<AgenteCategoria>>} Lista de relaciones
   */
  async listarTodos() {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .select(`
        *,
        agente:id_agente(id_agente, nombre),
        categoria:id_categoria(id_categoria, nombre)
      `)
      .order('id_agente', { ascending: true });

    if (error) {
      throw new ApiError(`Error al listar relaciones agente-categoría: ${error.message}`, 500);
    }

    return data.map(relacion => AgenteCategoria.fromDatabase(relacion));
  }

  /**
   * Lista las categorías de un agente específico
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Array<AgenteCategoria>>} Lista de relaciones del agente
   */
  async listarPorAgente(id_agente) {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .select(`
        *,
        categoria:id_categoria(id_categoria, nombre)
      `)
      .eq('id_agente', id_agente)
      .order('es_principal', { ascending: false });

    if (error) {
      throw new ApiError(`Error al listar categorías del agente: ${error.message}`, 500);
    }

    return data.map(relacion => AgenteCategoria.fromDatabase(relacion));
  }

  /**
   * Lista los agentes de una categoría específica
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<Array<AgenteCategoria>>} Lista de relaciones de la categoría
   */
  async listarPorCategoria(id_categoria) {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .select(`
        *,
        agente:id_agente(id_agente, nombre)
      `)
      .eq('id_categoria', id_categoria)
      .order('es_principal', { ascending: false });

    if (error) {
      throw new ApiError(`Error al listar agentes de la categoría: ${error.message}`, 500);
    }

    return data.map(relacion => AgenteCategoria.fromDatabase(relacion));
  }

  /**
   * Crea una nueva relación agente-categoría
   * @param {Object} relacionData - Datos de la relación
   * @returns {Promise<AgenteCategoria>} Relación creada
   */
  async crear(relacionData) {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .insert(relacionData)
      .select();

    if (error) {
      throw new ApiError(`Error al crear relación agente-categoría: ${error.message}`, 500);
    }

    return AgenteCategoria.fromDatabase(data[0]);
  }

  /**
   * Actualiza una relación agente-categoría existente
   * @param {number} id_agente - ID del agente
   * @param {number} id_categoria - ID de la categoría
   * @param {Object} relacionData - Datos a actualizar
   * @returns {Promise<AgenteCategoria|null>} Relación actualizada o null
   */
  async actualizar(id_agente, id_categoria, relacionData) {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .update({...relacionData, updated_at: new Date().toISOString()})
      .eq('id_agente', id_agente)
      .eq('id_categoria', id_categoria)
      .select();

    if (error) {
      throw new ApiError(`Error al actualizar relación agente-categoría: ${error.message}`, 500);
    }

    return data && data.length > 0 ? AgenteCategoria.fromDatabase(data[0]) : null;
  }

  /**
   * Elimina una relación agente-categoría
   * @param {number} id_agente - ID del agente
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<AgenteCategoria|null>} Relación eliminada o null
   */
  async eliminar(id_agente, id_categoria) {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .delete()
      .eq('id_agente', id_agente)
      .eq('id_categoria', id_categoria)
      .select();

    if (error) {
      throw new ApiError(`Error al eliminar relación agente-categoría: ${error.message}`, 500);
    }

    return data && data.length > 0 ? AgenteCategoria.fromDatabase(data[0]) : null;
  }

  /**
   * Elimina todas las relaciones de un agente
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Array<AgenteCategoria>>} Relaciones eliminadas
   */
  async eliminarPorAgente(id_agente) {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .delete()
      .eq('id_agente', id_agente)
      .select();

    if (error) {
      throw new ApiError(`Error al eliminar relaciones del agente: ${error.message}`, 500);
    }

    return data.map(relacion => AgenteCategoria.fromDatabase(relacion));
  }

  /**
   * Elimina todas las relaciones de una categoría
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<Array<AgenteCategoria>>} Relaciones eliminadas
   */
  async eliminarPorCategoria(id_categoria) {
    const { data, error } = await supabase
      .from('relacion_agente_categoria')
      .delete()
      .eq('id_categoria', id_categoria)
      .select();

    if (error) {
      throw new ApiError(`Error al eliminar relaciones de la categoría: ${error.message}`, 500);
    }

    return data.map(relacion => AgenteCategoria.fromDatabase(relacion));
  }
}

export default AgenteCategoriaRepository;
