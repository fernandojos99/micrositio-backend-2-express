import supabase from '../config/supabaseClient.js';
import ApiError from '../utils/ApiError.js';
import LearningCard from '../models/LearningCard.js';

class LearningCardRepository {
  /**
   * Obtiene una learning card por ID de testing card
   * @async
   * @param {number} idTestingCard - ID de testing card
   * @returns {Promise<Object|null>} Learning card encontrada o null
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerPorTestingCard(idTestingCard) {
    return await this.model.findAll({ where: { id_testing_card: idTestingCard } });
  }

  /**
   * Obtiene una learning card por ID
   * @async
   * @param {number} id - ID de learning card
   * @returns {Promise<Object|null>} Learning card encontrada o null
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerPorId(id) {
    const { data, error } = await supabase
      .from('learning_card')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new ApiError(`Error al obtener learning card: ${error.message}`, 500);
    }

    return data ? new LearningCard(data) : null;
  }

  /**
   * Obtiene todas las learning cards
   * @async
   * @returns {Promise<Array>} Lista de learning cards
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('learning_card')
      .select('*');

    if (error) {
      throw new ApiError(`Error al obtener learning cards: ${error.message}`, 500);
    }

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
    const { data, error } = await supabase
      .from('learning_card')
      .insert(learningCardData)
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al crear learning card: ${error.message}`, 500);
    }

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

    const { data, error } = await supabase
      .from('learning_card')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al actualizar learning card: ${error.message}`, 500);
    }

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
    const { data, error } = await supabase
      .from('learning_card')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApiError(`Error al eliminar learning card: ${error.message}`, 500);
    }

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
  async obtenerPorTestingCard(idTestingCard) {
    const { data, error } = await supabase
      .from('learning_card')
      .select('*')
      .eq('id_testing_card', idTestingCard);

    if (error) {
      throw new ApiError(`Error al obtener learning cards: ${error.message}`, 500);
    }

    // Si no hay resultados, regresa un array vacío
    return data.map(item => new LearningCard(item));
  }

  /**
   * Busca learning cards por texto, incluyendo:
   * - testing card asociada
   * - secuencia y proyecto de esa testing card
   * - responsable (empleado) de la testing card
   */
  async buscarPorTexto(q) {
    try {
      const term = q.trim();

      const { data, error } = await supabase
        .from('learning_card')
        .select(`
          id,
          id_testing_card,
          resultado,
          hallazgo,
          estado,
          created_at,
          updated_at,
          testing_card:learning_card_id_testing_card_fkey (
            id_testing_card,
            titulo,
            hipotesis,
            descripcion,
            status,
            id_secuencia,
            secuencia:testing_card_id_secuencia_fkey (
              id_secuencia,
              nombre,
              descripcion,
              id_proyecto,
              estado,
              proyecto:secuencia_id_proyecto_fkey (
                id_proyecto,
                titulo
              )
            ),
            responsable:testing_card_id_empleado_fkey (
              id_empleado,
              nombre_pila,
              apellido_paterno,
              apellido_materno
            )
          )
        `)
        .or(
          `resultado.ilike.%${term}%,hallazgo.ilike.%${term}%`
        )
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error al buscar learning cards:', error);
        throw new ApiError(
          `Error al buscar learning cards: ${error.message}`,
          500
        );
      }

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