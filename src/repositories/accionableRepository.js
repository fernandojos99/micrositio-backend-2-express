import { consulta, uno, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js'
import { conMensaje } from '../utils/errorBd.js'
import ApiError from '../utils/ApiError.js'
import Accionable from '../models/Accionable.js'



/**
 * Obtener accionable por ID
 */
export async function obtenerPorId(id) {

  const data = await conMensaje('Error al obtener accionable',
    uno('SELECT * FROM accionable WHERE id_accionable = $1', [id]))

  return data ? new Accionable(data) : null
}


/**
 * Crear accionable
 */
export async function crear(accionableData) {

  const data = await conMensaje('Error al crear accionable',
    exigirFila(insertarFilas('accionable', accionableData)))

  return new Accionable(data)
}


/**
 * Actualizar accionable
 */
export async function actualizar(id, updateData) {

  const data = await conMensaje('Error al actualizar accionable',
    exigirFila(actualizarFilas('accionable', updateData, 'id_accionable = $1', [id])))

  return new Accionable(data)
}


/**
 * Eliminar accionable
 */
export async function eliminar(id) {

  const data = await conMensaje('Error al eliminar accionable',
    exigirFila(consulta('DELETE FROM accionable WHERE id_accionable = $1 RETURNING *', [id])))

  if (!data) {
    throw new ApiError('Accionable no encontrado', 404)
  }

  return new Accionable(data)
}




/**
 * Obtener accionables por learning card
 */
export async function obtenerPorLearningCard(idLearningCard) {

  const data = await conMensaje('Error al obtener accionables',
    consulta('SELECT * FROM accionable WHERE id_learning_card = $1', [idLearningCard]))

  return data.map(item => new Accionable(item))
}



// Los tres métodos siguientes bajan de nivel en varias consultas (proyecto →
// secuencias → testing cards → learning cards → accionables) en vez de con un
// solo JOIN, igual que antes: así el orden de los resultados no cambia y se
// sigue cortando pronto cuando un nivel intermedio está vacío.

/**
 * Obtener accionables por testing card
 */
export async function obtenerPorTestingCard(idTestingCard) {

  const learningCards = await conMensaje('Error obteniendo learning cards',
    consulta('SELECT id FROM learning_card WHERE id_testing_card = $1', [idTestingCard]))

  if (!learningCards.length) return []

  const learningIds = learningCards.map(l => l.id)

  const data = await conMensaje('Error al obtener accionables',
    consulta('SELECT * FROM accionable WHERE id_learning_card = ANY($1)', [learningIds]))

  return data.map(item => new Accionable(item))
}


/**
 * Obtener accionables por secuencia
 */
export async function obtenerPorSecuencia(idSecuencia) {

  const testingCards = await conMensaje('Error obteniendo testing cards',
    consulta('SELECT id_testing_card FROM testing_card WHERE id_secuencia = $1', [idSecuencia]))

  if (!testingCards.length) return []

  const testingIds = testingCards.map(t => t.id_testing_card)

  const learningCards = await conMensaje('Error obteniendo learning cards',
    consulta('SELECT id FROM learning_card WHERE id_testing_card = ANY($1)', [testingIds]))

  if (!learningCards.length) return []

  const learningIds = learningCards.map(l => l.id)

  const data = await conMensaje('Error obteniendo accionables',
    consulta('SELECT * FROM accionable WHERE id_learning_card = ANY($1)', [learningIds]))

  return data.map(item => new Accionable(item))
}


/**
 * Obtener accionables por proyecto
 */
export async function obtenerPorProyecto(idProyecto) {

  const secuencias = await conMensaje('Error obteniendo secuencias',
    consulta('SELECT id_secuencia FROM secuencia WHERE id_proyecto = $1', [idProyecto]))

  if (!secuencias.length) return []

  const secuenciaIds = secuencias.map(s => s.id_secuencia)

  const testingCards = await conMensaje('Error obteniendo testing cards',
    consulta('SELECT id_testing_card FROM testing_card WHERE id_secuencia = ANY($1)', [secuenciaIds]))

  if (!testingCards.length) return []

  const testingIds = testingCards.map(t => t.id_testing_card)

  const learningCards = await conMensaje('Error obteniendo learning cards',
    consulta('SELECT id FROM learning_card WHERE id_testing_card = ANY($1)', [testingIds]))

  if (!learningCards.length) return []

  const learningIds = learningCards.map(l => l.id)

  const data = await conMensaje('Error obteniendo accionables',
    consulta('SELECT * FROM accionable WHERE id_learning_card = ANY($1)', [learningIds]))

  return data.map(item => new Accionable(item))
}
