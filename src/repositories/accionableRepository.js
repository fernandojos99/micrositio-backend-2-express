import supabase from '../config/supabaseClient.js'
import ApiError from '../utils/ApiError.js'
import Accionable from '../models/Accionable.js'

/**
 * Obtener accionables por learning card
 */
export async function obtenerPorLearningCard(idLearningCard) {

  const { data, error } = await supabase
    .from('accionable')
    .select('*')
    .eq('id_learning_card', idLearningCard)

  if (error) {
    throw new ApiError(`Error al obtener accionables: ${error.message}`, 500)
  }

  return data.map(item => new Accionable(item))
}


/**
 * Obtener accionable por ID
 */
export async function obtenerPorId(id) {

  const { data, error } = await supabase
    .from('accionable')
    .select('*')
    .eq('id_accionable', id)
    .maybeSingle()

  if (error) {
    throw new ApiError(`Error al obtener accionable: ${error.message}`, 500)
  }

  return data ? new Accionable(data) : null
}


/**
 * Crear accionable
 */
export async function crear(accionableData) {

  const { data, error } = await supabase
    .from('accionable')
    .insert(accionableData)
    .select()
    .single()

  if (error) {
    throw new ApiError(`Error al crear accionable: ${error.message}`, 500)
  }

  return new Accionable(data)
}


/**
 * Actualizar accionable
 */
export async function actualizar(id, updateData) {

  const { data, error } = await supabase
    .from('accionable')
    .update(updateData)
    .eq('id_accionable', id)
    .select()
    .single()

  if (error) {
    throw new ApiError(`Error al actualizar accionable: ${error.message}`, 500)
  }

  return new Accionable(data)
}


/**
 * Eliminar accionable
 */
export async function eliminar(id) {

  const { data, error } = await supabase
    .from('accionable')
    .delete()
    .eq('id_accionable', id)
    .select()
    .single()

  if (error) {
    throw new ApiError(`Error al eliminar accionable: ${error.message}`, 500)
  }

  if (!data) {
    throw new ApiError('Accionable no encontrado', 404)
  }

  return new Accionable(data)
}