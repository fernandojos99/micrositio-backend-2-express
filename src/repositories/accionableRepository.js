import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import Accionable from '../models/Accionable.js';

/**
 * Obtener accionable por ID
 */
export async function obtenerPorId(id) {

  const { data, error } = await supabase
    .from('accionable')
    .select('*')
    .eq('id_accionable', id)
    .maybeSingle();

  if (error) {
    throw new ApiError(`Error al obtener accionable: ${error.message}`, 500);
  }

  return data ? new Accionable(data) : null;
}






/**
 * Obtener todos los accionable
 */
export async function obtenerTodos() {

  const { data, error } = await supabase
    .from('accionable')
    .select('*')
    .order('id_accionable');


  if (error) {
    throw new ApiError(`Error al obtener accionables: ${error.message}`, 500);
  }

  // Para conocer la estructura de los datos obtenidos, puedes imprimir el primer elemento del array
  // console.log("Datos obtenidos:", data[0]);
  return data.map(item => new Accionable(item));
}





/**
 * Crear accionable
 */

export async function crear(accionableData) {

  const { data, error } = await supabase
    .from('accionable')
    .insert(accionableData)
    .select()
    .single();

  if (error) {
    throw new ApiError(`Error al crear accionable: ${error.message}`, 500);
  }

  return new Accionable(data);
}


/**
 * Actualizar accionable
 */

export async function actualizar(id, updateData) {

  if (!Number.isInteger(id) || id <= 0) {
    throw new ApiError('ID inválido', 400);
  }

  const { data, error } = await supabase
    .from('accionable')
    .update(updateData)
    .eq('id_accionable', id)
    .select()
    .single();

  if (error) {
    throw new ApiError(`Error al actualizar accionable: ${error.message}`, 500);
  }

  return new Accionable(data);
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
    .single();

  if (error) {
    throw new ApiError(`Error al eliminar accionable: ${error.message}`, 500);
  }

  if (!data) {
    throw new ApiError('Accionable no encontrado', 404);
  }

  return new Accionable(data);
}



export async function obtenerPorLearningCard(idLearningCard) {

  const { data, error } = await supabase
    .from('accionable')
    .select('*')
    .eq('id_learning_card', idLearningCard);

  if (error) {
    throw new ApiError(`Error al obtener accionables: ${error.message}`, 500);
  }

  return data.map(item => new Accionable(item));
}




/**
 * Buscar accionable por texto
 */


// export async function buscarPorTexto(q) {

//   const term = q.trim();

//   const { data, error } = await supabase
//     .from('accionable')
//     .select('*')
//     .ilike('contenido', `%${term}%`)
//     .order('id_accionable');

//   if (error) {
//     throw new ApiError(`Error al buscar accionables: ${error.message}`, 500);
//   }

//   return data.map(item => new Accionable(item));
// }


// =================== Obtener Accionables Por Proyecto =======================================
//Funciona creo 

// export async function obtenerAccionablesPorProyecto(idProyecto) {
//   // 1. Obtener todas las secuencias del proyecto
//   const { data: secuencias, error: errorSecuencia } = await supabase
//     .from('secuencia')
//     .select('id_secuencia')
//     .eq('id_proyecto', idProyecto);

//   if (errorSecuencia) throw errorSecuencia;

//   const secuenciaIds = secuencias.map(s => s.id_secuencia);

//   // 2. Obtener los testing_cards correspondientes
//   const { data: testingCards, error: errorTesting } = await supabase
//     .from('testing_card')
//     .select('id_testing_card')
//     .in('id_secuencia', secuenciaIds);

//   if (errorTesting) throw errorTesting;

//   const testingCardIds = testingCards.map(tc => tc.id_testing_card);

//   // 3. Obtener las learning_cards
//   const { data: learningCards, error: errorLearning } = await supabase
//     .from('learning_card')
//     .select('id')
//     .in('id_testing_card', testingCardIds);

//   if (errorLearning) throw errorLearning;

//   const learningCardIds = learningCards.map(lc => lc.id);

//   // 4. Finalmente, los accionables
//   const { data: accionables, error: errorAccionable } = await supabase
//     .from('accionable')
//     .select('*')
//     .in('id_learning_card', learningCardIds);

//   if (errorAccionable) throw errorAccionable;

//   return accionables.map(item => new Accionable(item));
// }


// con embedding
// Esto sale si lo embebo 
/*ApiError: Error al obtener accionables por proyecto: Could not embed 
because more than one relationship was found for 'testing_card' and 'secuencia'
 */
// export async function obtenerAccionablesPorProyecto(idProyecto) {
// const { data, error } = await supabase
//   .from('accionable')
//   .select(`
//     *,
//     learning_card (
//       id,
//       testing_card (
//         id_testing_card,
//         secuencia (
//           id_secuencia,
//           proyecto (id_proyecto)
//         )
//       )
//     )
//   `)
//   .eq('learning_card.testing_card.secuencia.proyecto.id_proyecto', idProyecto);
        
// if (error) {
//   throw new ApiError(`Error al obtener accionables por proyecto: ${error.message}`, 500);
// }
// return data.map(item => new Accionable(item));

// }


