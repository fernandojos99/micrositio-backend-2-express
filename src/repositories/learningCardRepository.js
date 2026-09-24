import { consulta, uno, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import LearningCard from '../models/LearningCard.js';

// Nota: este archivo definía obtenerPorTestingCard dos veces. La primera era un
// resto de Sequelize (`this.model.findAll`) que nunca se ejecutaba, porque en
// una clase la segunda definición sustituye a la primera. Solo queda la buena.
// Ver la nota de testingCardRepository: los borradores del plan de trabajo no
// se ven hasta que se aprueba el proyecto.
const filtro = (incluirBorradores) => (incluirBorradores ? 'TRUE' : 'es_borrador = false');

class LearningCardRepository {
  /**
   * Obtiene una learning card por ID
   * @async
   * @param {number} id - ID de learning card
   * @returns {Promise<Object|null>} Learning card encontrada o null
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerPorId(id) {
    const data = await conMensaje('Error al obtener learning card',
      uno('SELECT * FROM learning_card WHERE id = $1', [id]));

    return data ? new LearningCard(data) : null;
  }

  /**
   * Obtiene todas las learning cards
   * @async
   * @returns {Promise<Array>} Lista de learning cards
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerTodos({ incluirBorradores = false } = {}) {
    const data = await conMensaje('Error al obtener learning cards',
      consulta(`SELECT * FROM learning_card WHERE ${filtro(incluirBorradores)}`));

    return data.map(item => new LearningCard(item));
  }

  /**
   * Crea una nueva learning card
   * @async
   * @param {Object} learningCardData - Datos de la learning card
   * @returns {Promise<Object>} Learning card creada
   * @throws {ApiError} Si ocurre un error
   */
  async crear(learningCardData) {
    const data = await conMensaje('Error al crear learning card',
      exigirFila(insertarFilas('learning_card', learningCardData)));

    return new LearningCard(data);
  }

  /**
   * Actualiza una learning card
   * @async
   * @param {number} id - ID de learning card
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Learning card actualizada
   * @throws {ApiError} Si ocurre un error
   */
  async actualizar(id, updateData) {
    // Validar que el ID es un número positivo
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError('ID de learning card inválido', 400);
    }

    const data = await conMensaje('Error al actualizar learning card',
      exigirFila(actualizarFilas('learning_card', updateData, 'id = $1', [id])));

    return new LearningCard(data);
  }

  /**
   * Elimina una learning card
   * @async
   * @param {number} id - ID de learning card
   * @returns {Promise<Object>} Learning card eliminada
   * @throws {ApiError} Si ocurre un error
   */
  async eliminar(id) {
    const data = await conMensaje('Error al eliminar learning card',
      exigirFila(consulta('DELETE FROM learning_card WHERE id = $1 RETURNING *', [id])));

    if (!data) {
      throw new ApiError('Learning card no encontrada', 404);
    }

    return new LearningCard(data);
  }

  /**
   * Obtiene todas las learning cards por ID de testing card
   * @async
   * @param {number} idTestingCard - ID de testing card
   * @returns {Promise<Array>} Lista de learning cards encontradas
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerPorTestingCard(idTestingCard, { incluirBorradores = false } = {}) {
    const data = await conMensaje('Error al obtener learning cards',
      consulta(`SELECT * FROM learning_card WHERE id_testing_card = $1 AND ${filtro(incluirBorradores)}`, [idTestingCard]));

    // Si no hay resultados, regresa un array vacío
    return data.map(item => new LearningCard(item));
  }

  /**
   * Busca learning cards por texto, incluyendo:
   * - testing card asociada
   * - secuencia y proyecto de esa testing card
   * - responsable (empleado) de la testing card
   *
   * Los objetos anidados reproducen los joins embebidos de PostgREST que había
   * antes (misma forma, mismas claves, null si no hay relación):
   *   testing_card ← learning_card.id_testing_card (learning_card_id_testing_card_fkey)
   *   secuencia    ← testing_card.id_secuencia     (testing_card_id_secuencia_fkey)
   *   proyecto     ← secuencia.id_proyecto          (secuencia_id_proyecto_fkey)
   *   responsable  ← testing_card.id_responsable   (testing_card_id_empleado_fkey)
   */
  async buscarPorTexto(q) {
    try {
      const term = q.trim();

      const data = await conMensaje('Error al buscar learning cards', consulta(`
        SELECT
          lc.id,
          lc.id_testing_card,
          lc.resultado,
          lc.hallazgo,
          lc.estado,
          lc.created_at,
          lc.updated_at,
          (SELECT row_to_json(t) FROM (
             SELECT
               tc.id_testing_card,
               tc.titulo,
               tc.hipotesis,
               tc.descripcion,
               tc.status,
               tc.id_secuencia,
               (SELECT row_to_json(s) FROM (
                  SELECT
                    sec.id_secuencia,
                    sec.nombre,
                    sec.descripcion,
                    sec.id_proyecto,
                    sec.estado,
                    (SELECT row_to_json(p) FROM (
                       SELECT pr.id_proyecto, pr.titulo
                       FROM proyecto pr
                       WHERE pr.id_proyecto = sec.id_proyecto
                     ) p) AS proyecto
                  FROM secuencia sec
                  WHERE sec.id_secuencia = tc.id_secuencia
                ) s) AS secuencia,
               (SELECT row_to_json(r) FROM (
                  SELECT e.id_empleado, e.nombre_pila, e.apellido_paterno, e.apellido_materno
                  FROM empleado e
                  WHERE e.id_empleado = tc.id_responsable
                ) r) AS responsable
             FROM testing_card tc
             WHERE tc.id_testing_card = lc.id_testing_card
           ) t) AS testing_card
        FROM learning_card lc
        WHERE lc.es_borrador = false
          AND (lc.resultado ILIKE $1 OR lc.hallazgo ILIKE $1)
        ORDER BY lc.created_at DESC
      `, [`%${term}%`]));

      return data || [];
    } catch (err) {
      console.error('Error en LearningCardRepository.buscarPorTexto:', err);
      if (err instanceof ApiError) {
        throw err;
      }
      throw new ApiError('Error al buscar learning cards', 500);
    }
  }
}

export default LearningCardRepository;
