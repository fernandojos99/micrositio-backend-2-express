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
    throw new ApiError('ID de accionable inválido', 400);
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
    throw new ApiError('ID de accionable inválido', 400);
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