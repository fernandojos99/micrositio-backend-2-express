import supabase from '../config/supabaseClient.js'
import ApiError from '../utils/ApiError.js'
import Accionable from '../models/Accionable.js'



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
 * Obtener accionables por testing card
 */
export async function obtenerPorTestingCard(idTestingCard) {

  const { data: learningCards, error: learningError } = await supabase
    .from('learning_card')
    .select('id')
    .eq('id_testing_card', idTestingCard)

  if (learningError) {
    throw new ApiError(`Error obteniendo learning cards: ${learningError.message}`, 500)
  }

  if (!learningCards.length) return []

  const learningIds = learningCards.map(l => l.id)

  const { data, error } = await supabase
    .from('accionable')
    .select('*')
    .in('id_learning_card', learningIds)

  if (error) {
    throw new ApiError(`Error al obtener accionables: ${error.message}`, 500)
  }

  return data.map(item => new Accionable(item))
}


/**
 * Obtener accionables por secuencia
 */
export async function obtenerPorSecuencia(idSecuencia) {

  const { data: testingCards, error: testingError } = await supabase
    .from('testing_card')
    .select('id_testing_card')
    .eq('id_secuencia', idSecuencia)

  if (testingError) {
    throw new ApiError(`Error obteniendo testing cards: ${testingError.message}`, 500)
  }

  if (!testingCards.length) return []

  const testingIds = testingCards.map(t => t.id_testing_card)

  const { data: learningCards, error: learningError } = await supabase
    .from('learning_card')
    .select('id')
    .in('id_testing_card', testingIds)

  if (learningError) {
    throw new ApiError(`Error obteniendo learning cards: ${learningError.message}`, 500)
  }

  if (!learningCards.length) return []

  const learningIds = learningCards.map(l => l.id)

  const { data, error } = await supabase
    .from('accionable')
    .select('*')
    .in('id_learning_card', learningIds)

  if (error) {
    throw new ApiError(`Error obteniendo accionables: ${error.message}`, 500)
  }

  return data.map(item => new Accionable(item))
}


/**
 * Obtener accionables por proyecto
 */
export async function obtenerPorProyecto(idProyecto) {

  const { data: secuencias, error: secuenciaError } = await supabase
    .from('secuencia')
    .select('id_secuencia')
    .eq('id_proyecto', idProyecto)

  if (secuenciaError) {
    throw new ApiError(`Error obteniendo secuencias: ${secuenciaError.message}`, 500)
  }

  if (!secuencias.length) return []

  const secuenciaIds = secuencias.map(s => s.id_secuencia)

  const { data: testingCards, error: testingError } = await supabase
    .from('testing_card')
    .select('id_testing_card')
    .in('id_secuencia', secuenciaIds)

  if (testingError) {
    throw new ApiError(`Error obteniendo testing cards: ${testingError.message}`, 500)
  }

  if (!testingCards.length) return []

  const testingIds = testingCards.map(t => t.id_testing_card)

  const { data: learningCards, error: learningError } = await supabase
    .from('learning_card')
    .select('id')
    .in('id_testing_card', testingIds)

  if (learningError) {
    throw new ApiError(`Error obteniendo learning cards: ${learningError.message}`, 500)
  }

  if (!learningCards.length) return []

  const learningIds = learningCards.map(l => l.id)

  const { data, error } = await supabase
    .from('accionable')
    .select('*')
    .in('id_learning_card', learningIds)

  if (error) {
    throw new ApiError(`Error obteniendo accionables: ${error.message}`, 500)
  }

  return data.map(item => new Accionable(item))
}