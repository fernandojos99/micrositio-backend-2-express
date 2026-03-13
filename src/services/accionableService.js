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
export async function obtenerTodos() {
  const accionables = await accionableRepo.obtenerTodos();
  return accionables.map(a => a.fromRow());
}







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
 * Función de sincronización de accionables para una learning card
 * 
*/

/* export async function sync(accionables) {

  if (!Array.isArray(accionables)) {
    throw new ApiError('Se esperaba un arreglo de accionables', 400);
  }


  if (accionables.length === 0) return [];

  const learningCardId = accionables[0].id_learning_card;

  // Obtener accionables actuales en BD
  const existentes = await accionableRepo.obtenerPorLearningCard(learningCardId);

  const existentesMap = new Map(
    existentes.map(a => [a.id_accionable, a])
  );

  const idsEnviados = new Set();

  const resultados = [];

  for (const accionable of accionables) {

    // CREATE
    if (!accionable.id_accionable) {
      const nuevo = await accionableRepo.crear(accionable);
      resultados.push(nuevo.fromRow());
      continue;
    }

    idsEnviados.add(accionable.id_accionable);

    // UPDATE
    if (existentesMap.has(accionable.id_accionable)) {
      const actualizado = await accionableRepo.actualizar(
        accionable.id_accionable,
        accionable
      );
      resultados.push(actualizado.fromRow());
    }

  }

  // DELETE (los que estaban en BD pero no vinieron en request)
  for (const existente of existentes) {

    if (!idsEnviados.has(existente.id_accionable)) {
      await accionableRepo.eliminar(existente.id_accionable);
    }

  }

  return resultados;
}


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
 * Obtener accionables por proyecto (Pendiente de implementación completa)
 */


// export async function obtenerPorProyecto(idProyecto) {
//   if (!Number.isInteger(idProyecto)) {
//     throw new ApiError('ID de proyecto inválido', 400);
//   }

//   try {
//     // 1. Obtener secuencias del proyecto
//     const secuencias = await testingCardRepo.obtenerSecuenciasPorProyecto(idProyecto);
//     if (!secuencias.length) return [];

//     const secuenciaIds = secuencias.map(s => s.id_secuencia);

//     // 2. Obtener testing cards de esas secuencias
//     const testingCards = await testingCardRepo.obtenerPorSecuencias(secuenciaIds);
//     if (!testingCards.length) return [];

//     const testingCardIds = testingCards.map(tc => tc.id_testing_card);

//     // 3. Obtener learning cards de esas testing cards
//     const learningCards = await learningCardRepo.obtenerPorTestingCards(testingCardIds);
//     if (!learningCards.length) return [];

//     const learningCardIds = learningCards.map(lc => lc.id);

//     // 4. Finalmente, obtener los accionables
//     const accionables = await accionableRepo.obtenerPorLearningCards(learningCardIds);
//     return accionables.map(a => a.fromRow());
//   } catch (err) {
//     throw new ApiError(`Error al obtener accionables por proyecto: ${err.message}`, 500);
//   }
// }
