import * as accionableRepo from '../repositories/accionableRepository.js';
import LearningCardRepository from '../repositories/learningCardRepository.js';  
import ApiError from '../utils/ApiError.js';

// Instanciamos los repositorios
// const accionableRepo = new AccionableRepository();

const learningCardRepo = new LearningCardRepository();




/**
 * Obtener un accionable por ID
 */
export async function obtenerPorId(id) {
  if (!Number.isInteger(id)) {
    throw new ApiError('ID de accionable inválido  no rd nurto 2 ', 400);
  }

  const accionable = await accionableRepo.obtenerPorId(id);
  if (!accionable) {
    throw new ApiError('Accionable no encontrado', 404);
  }

  return accionable.fromRow();
}







/**
 * Obtener todos los accionables
 */
// export async function obtenerTodos() {
//   const accionables = await accionableRepo.obtenerTodos();
//   return accionables.map(a => a.fromRow());
// }







/**
 * Crear un accionable
 * Verifica que la learning card asociada exista antes de crear el accionable
 * , para mantener la integridad referencial
 */
export async function crear(accionableData) {
  // Verificar que existe la learning card
  const learningCard = await learningCardRepo.obtenerPorId(accionableData.id_learning_card);
  if (!learningCard) {
    throw new ApiError('Learning card no encontrada', 404);
  }

  const accionable = await accionableRepo.crear(accionableData);
  return accionable.fromRow();
}





/**
 * Actualizar un accionable
 */
export async function actualizar(id, updateData) {
  if (!Number.isInteger(id)) {
    throw new ApiError('ID de accionable inválido no es numero', 400);
  }

  const accionable = await accionableRepo.actualizar(id, updateData);
  return accionable.fromRow();
}

/**
 * Eliminar un accionable
 */
export async function eliminar(id) {
  const accionable = await accionableRepo.eliminar(id);
  return accionable.fromRow();
}





/**
 * Obtener accionables por Learning Card
 */
export async function obtenerPorLearningCard(idLearningCard) {

  if (!Number.isInteger(idLearningCard)) {
    throw new ApiError('ID de learning card inválido', 400);
  }

  // Verificar que la learning card exista
  const learningCard = await learningCardRepo.obtenerPorId(idLearningCard);

  if (!learningCard) {
    throw new ApiError('Learning card no encontrada', 404);
  }

  // Obtener accionables
  const accionables = await accionableRepo.obtenerPorLearningCard(idLearningCard);

  return accionables.map(a => a.fromRow());
}




/**
 * Sincronizar accionables de una learning card
 * Recibe un array de accionables y actualiza la base de datos para que coincida exactamente con ese array
 * Crea nuevos, actualiza existentes y elimina los que no estén en el array
 */
export async function sync(learningCardId, accionables = []) {

    const id = Number(learningCardId)
    if (!Number.isInteger(id)) {
        throw new ApiError('ID de learning card inválido', 400)
    }

    const existentes = await accionableRepo.obtenerPorLearningCard(id);

    const existentesMap = new Map(
        existentes.map(a => [a.id_accionable, a])
    );

    const idsEnviados = new Set();
    const resultados = [];

    // CREATE y UPDATE
    for (const accionable of accionables) {

        const existente = existentes.find(e =>
            e.contenido === accionable.contenido &&
            e.impacto === accionable.impacto &&
            e.esfuerzo === accionable.esfuerzo
        );

        // UPDATE
        if (existente) {

            idsEnviados.add(existente.id_accionable);

            const actualizado = await accionableRepo.actualizar(
                existente.id_accionable,
                accionable
            );

            resultados.push(actualizado.fromRow());
        }

        // CREATE
        else {

            const nuevo = await accionableRepo.crear(accionable);
            resultados.push(nuevo.fromRow());
        }
    }
    // DELETE
    for (const existente of existentes) {
        if (!idsEnviados.has(existente.id_accionable)) {
            await accionableRepo.eliminar(existente.id_accionable);
        }
    }

    return resultados;
}



/**

* Obtener accionables por testing card
  */
export async function obtenerPorTestingCard(idTestingCard) {

  if (!Number.isInteger(idTestingCard)) {
  throw new ApiError('ID de testing card inválido', 400);
  }
  
  const accionables = await accionableRepo.obtenerPorTestingCard(idTestingCard);
  
  return accionables.map(a => a.fromRow());
  }
  
  /**
  
  * Obtener accionables por secuencia
    */
    export async function obtenerPorSecuencia(idSecuencia) {
  
  if (!Number.isInteger(idSecuencia)) {
  throw new ApiError('ID de secuencia inválido', 400);
  }
  
  const accionables = await accionableRepo.obtenerPorSecuencia(idSecuencia);
  
  return accionables.map(a => a.fromRow());
  }
  
  /**
  
  * Obtener accionables por proyecto
    */
    export async function obtenerPorProyecto(idProyecto) {
  
  if (!Number.isInteger(idProyecto)) {
  throw new ApiError('ID de proyecto inválido', 400);
  }
  
  const accionables = await accionableRepo.obtenerPorProyecto(idProyecto);
  
  return accionables.map(a => a.fromRow());
  }
  







