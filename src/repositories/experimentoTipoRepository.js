// src/repositories/experimentoTipoRepository.js
/**
 * Repositorio para interactuar con la tabla experimento_tipo.
 * @class
 */
import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import ExperimentoTipo from '../models/ExperimentoTipo.js';

class ExperimentoTipoRepository {
  /**
   * Obtiene un tipo de experimento por su ID.
   * @async
   * @param {number} id - ID del tipo de experimento.
   * @returns {Promise<Object|null>} Tipo de experimento encontrado o null si no existe.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerPorId(id) {
    const data = await conMensaje('Error al obtener tipo de experimento',
      uno('SELECT * FROM experimento_tipo WHERE id_experimento_tipo = $1', [id]));

    return data ? new ExperimentoTipo(data) : null;
  }

  /**
   * Obtiene todos los tipos de experimento.
   * @async
   * @returns {Promise<Array>} Lista de tipos de experimento.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerTodos() {
    const data = await conMensaje('Error al obtener tipos de experimento',
      consulta('SELECT * FROM experimento_tipo'));

    return data.map(item => new ExperimentoTipo(item));
  }

  /**
   * Crea un nuevo tipo de experimento.
   * @async
   * @param {Object} experimentoTipoData - Datos del tipo de experimento.
   * @returns {Promise<Object>} Tipo de experimento creado.
   * @throws {ApiError} Si ocurre un error al crear.
   */
  async crear(experimentoTipoData) {
    const data = await conMensaje('Error al crear tipo de experimento',
      insertarFilas('experimento_tipo', experimentoTipoData));

    return new ExperimentoTipo(data[0]);
  }

  /**
   * Actualiza un tipo de experimento existente.
   * @async
   * @param {number} id - ID del tipo de experimento a actualizar.
   * @param {Object} experimentoTipoData - Datos a actualizar.
   * @returns {Promise<Object>} Tipo de experimento actualizado.
   * @throws {ApiError} Si ocurre un error al actualizar.
   */
  async actualizar(id, experimentoTipoData) {
    const data = await conMensaje('Error al actualizar tipo de experimento',
      actualizarFilas('experimento_tipo', experimentoTipoData, 'id_experimento_tipo = $1', [id]));

    return new ExperimentoTipo(data[0]);
  }

  /**
   * Elimina un tipo de experimento.
   * @async
   * @param {number} id - ID del tipo de experimento a eliminar.
   * @returns {Promise<Object>} Tipo de experimento eliminado.
   * @throws {ApiError} Si ocurre un error al eliminar.
   */
  async eliminar(id) {
    const data = await conMensaje('Error al eliminar tipo de experimento',
      consulta('DELETE FROM experimento_tipo WHERE id_experimento_tipo = $1 RETURNING *', [id]));

    if (!data || data.length === 0) {
      throw new ApiError('Tipo de experimento no encontrado', 404);
    }

    return new ExperimentoTipo(data[0]);
  }
}

export default ExperimentoTipoRepository;
