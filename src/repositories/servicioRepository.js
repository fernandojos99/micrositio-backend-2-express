import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import Servicio from '../models/Servicio.js';

class ServicioRepository {

  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('servicio')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new ApiError(
        `Error al obtener servicio: ${error.message}`,
        500
      );
    }

    return data ? new Servicio(data) : null;
  }

  async obtenerTodos() {
    const { data, error } = await supabase
      .from('servicio')
      .select('*')
      .order('id');

    if (error) {
      throw new ApiError(
        `Error al obtener servicios: ${error.message}`,
        500
      );
    }

    return data.map(item => new Servicio(item));
  }

  async crear(servicioData) {
    const { data, error } = await supabase
      .from('servicio')
      .insert(servicioData)
      .select()
      .single();

    if (error) {
      throw new ApiError(
        `Error al crear servicio: ${error.message}`,
        500
      );
    }

    return new Servicio(data);
  }

  async actualizar(id, updateData) {

    const { data, error } = await supabase
      .from('servicio')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApiError(
        `Error al actualizar servicio: ${error.message}`,
        500
      );
    }

    if (!data) {
      throw new ApiError(
        'Servicio no encontrado',
        404
      );
    }

    return new Servicio(data);
  }

  async eliminar(id) {
    const { data, error } = await supabase
      .from('servicio')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApiError(
        `Error al eliminar servicio: ${error.message}`,
        500
      );
    }

    if (!data) {
      throw new ApiError(
        'Servicio no encontrado',
        404
      );
    }

    return new Servicio(data);
  }
}

export default ServicioRepository;