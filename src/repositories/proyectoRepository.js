// src/repositories/proyectoRepository.js
import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import Proyecto from '../models/Proyecto.js';

class ProyectoRepository {
  async obtenerPorId(id_proyecto) {
    const { data, error } = await supabase
      .from('proyecto')
      .select('*')
      .eq('id_proyecto', id_proyecto)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al obtener proyecto: ${error.message}`, 500);
    }

    return data ? Proyecto.fromDatabase(data) : null;
  }

  async crear(proyectoData) {
    const { data, error } = await supabase
      .from('proyecto')
      .insert(proyectoData)
      .select();

    if (error) {
      throw new ApiError(`Error al crear proyecto: ${error.message}`, 500);
    }

    return Proyecto.fromDatabase(data[0]);
  }

  async actualizar(id_proyecto, proyectoData) {
    const { data, error } = await supabase
      .from('proyecto')
      .update(proyectoData)
      .eq('id_proyecto', id_proyecto)
      .select();

    if (error) {
      throw new ApiError(`Error al actualizar proyecto: ${error.message}`, 500);
    }

    if (!data || data.length === 0) {
      throw new ApiError(`Proyecto con ID ${id_proyecto} no encontrado`, 404);
    }

    return Proyecto.fromDatabase(data[0]);
  }

  async eliminar(id_proyecto) {
    const { data, error } = await supabase
      .from('proyecto')
      .delete()
      .eq('id_proyecto', id_proyecto)
      .select();

    if (error) {
      throw new ApiError(`Error al eliminar proyecto: ${error.message}`, 500);
    }

    return data ? Proyecto.fromDatabase(data[0]) : null;
  }

  async listarTodos() {
    const { data, error } = await supabase
      .from('proyecto')
      .select('*');

    if (error) {
      throw new ApiError(`Error al listar proyectos: ${error.message}`, 500);
    }

    return data.map(proyecto => Proyecto.fromDatabase(proyecto));
  }

  async listarPorIds(ids_proyectos) {
    if (!ids_proyectos || ids_proyectos.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('proyecto')
      .select('*')
      .in('id_proyecto', ids_proyectos);

    if (error) {
      throw new ApiError(`Error al listar proyectos por IDs: ${error.message}`, 500);
    }

    return data.map(proyecto => Proyecto.fromDatabase(proyecto));
  }

  /**
   * Buscar proyectos por texto.
   * @param {string} q - Texto de búsqueda.
   * @returns {Promise<Array>} Lista de proyectos que coinciden con el texto.
   */
  async buscarPorTexto(q) {
    try {
      const { data, error } = await supabase
        .from('proyecto')
        .select('*')
        // 🔴 ANTES: .ilike('nombre', `%${q}%`)
        // 🔵 AHORA: buscamos en titulo y descripcion, que sí existen
        .or(`titulo.ilike.%${q}%,descripcion.ilike.%${q}%`);

      if (error) {
        throw new ApiError(`Error al buscar proyectos: ${error.message}`, 500);
      }

      return (data || []).map(proyecto => Proyecto.fromDatabase(proyecto));
    } catch (error) {
      console.error('Error en ProyectoRepository.buscarPorTexto:', error);
      throw error;
    }
  }
}

export default ProyectoRepository;
