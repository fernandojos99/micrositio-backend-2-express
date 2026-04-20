import supabase from '../config/supabaseClient.js'
import ApiError from '../utils/ApiError.js'
import Habilidad from '../models/Habilidad.js' // Asumiendo que crearás este modelo

/**
 * Obtener todas las habilidades de un empleado específico
 */
export async function obtenerPorEmpleado(idEmpleado) {
  const { data, error } = await supabase
    .from('habilidades')
    .select(`
      id_habilidad,
      id_empleado,
      nombre_habilidad,
      nivel
    `)
    .eq('id_empleado', idEmpleado);

  if (error) {
    throw new ApiError(
      `Error al obtener las habilidades del empleado: ${error.message}`,
      500
    );
  }

  return data ? data.map(item => new Habilidad(item)) : [];
}

/**
 * Agregar una nueva habilidad a un empleado
 */
export async function crear(habilidadData) {
  const { data, error } = await supabase
    .from('habilidades')
    .insert(habilidadData)
    .select()
    .single()

  if (error) {
    throw new ApiError(`Error al registrar la habilidad: ${error.message}`, 500)
  }

  return new Habilidad(data)
}

/**
 * Eliminar una habilidad específica por su ID
 */
export async function eliminar(idHabilidad) {
  const { data, error } = await supabase
    .from('habilidades')
    .delete()
    .eq('id_habilidad', idHabilidad)
    .select()
    .single()

  if (error) {
    throw new ApiError(`Error al eliminar la habilidad: ${error.message}`, 500)
  }

  if (!data) {
    throw new ApiError('Habilidad no encontrada', 404)
  }

  return new Habilidad(data)
}

/**
 * Actualizar una habilidad (por ejemplo, cambiar el nombre o nivel)
 */
export async function actualizar(idHabilidad, updateData) {
  const { data, error } = await supabase
    .from('habilidades')
    .update(updateData)
    .eq('id_habilidad', idHabilidad)
    .select()
    .single()

  if (error) {
    throw new ApiError(`Error al actualizar la habilidad: ${error.message}`, 500)
  }

  return new Habilidad(data)
}