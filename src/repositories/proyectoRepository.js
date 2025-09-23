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

    return data ? Proyecto.fromDatabase(data[0]) : null;
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
}

export default ProyectoRepository;