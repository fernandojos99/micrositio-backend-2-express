import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import Sesion from '../models/Sesion.js';

class  SesionRepository {
  async listarPorEmpleado(id_empleado) {
    const { data, error } = await supabase
      .from('sesion')
      .select('*')
      .eq('id_empleado', id_empleado)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new ApiError(`Error al listar sesiones: ${error.message}`, 500);
    }

    return data.map(sesion => Sesion.fromDatabase(sesion));
  }

  async obtenerPorThreadId(thread_id) {
    const { data, error } = await supabase
      .from('sesion')
      .select('*')
      .eq('thread_id', thread_id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al obtener sesión: ${error.message}`, 500);
    }

    return data ? Sesion.fromDatabase(data) : null;
  }

  async crear(data) {
    const { data: resultado, error } = await supabase
      .from('sesion')
      .insert({
        id_empleado: data.id_empleado,
        thread_id: data.thread_id
      })
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al crear sesión: ${error.message}`, 500);
    }

    return Sesion.fromDatabase(resultado);
  }

  async actualizarActualizado(thread_id) {
    const { data, error } = await supabase
      .from('sesion')
      .update({ updated_at: new Date().toISOString() })
      .eq('thread_id', thread_id)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al actualizar sesión: ${error.message}`, 500);
    }

    return data ? Sesion.fromDatabase(data) : null;
  }

  async eliminar(thread_id, id_empleado) {
    const { data, error } = await supabase
      .from('sesion')
      .delete()
      .eq('thread_id', thread_id)
      .eq('id_empleado', id_empleado)
      .select()
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new ApiError(`Error al eliminar sesión: ${error.message}`, 500);
    }

    return data ? Sesion.fromDatabase(data) : null;
  }
}

export default SesionRepository;
