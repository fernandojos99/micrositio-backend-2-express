// src/repositories/categoriaRepository.js
/**
 * Repositorio para interactuar con la tabla categoria.
 * @class
 */
import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import Categoria from '../models/Categoria.js';

class CategoriaRepository {
  /**
   * Obtiene una categoría por su ID.
   * @async
   * @param {number} id - ID de la categoría.
   * @returns {Promise<Object|null>} Categoría encontrada o null si no existe.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerPorId(id) {
    const data = await conMensaje('Error al obtener categoría',
      uno('SELECT * FROM categoria WHERE id_categoria = $1', [id]));

    return data ? new Categoria(data) : null;
  }

  /**
   * Obtiene todas las categorías.
   * @async
   * @returns {Promise<Array>} Lista de categorías.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerTodas() {
    const data = await conMensaje('Error al obtener categorías',
      consulta('SELECT * FROM categoria'));

    return data.map(categoria => new Categoria(categoria));
  }

  /**
   * Crea una nueva categoría.
   * @async
   * @param {Object} categoriaData - Datos de la categoría.
   * @returns {Promise<Object>} Categoría creada.
   * @throws {ApiError} Si ocurre un error al crear.
   */
  async crear(categoriaData) {
    const data = await conMensaje('Error al crear categoría',
      insertarFilas('categoria', categoriaData));

    return new Categoria(data[0]);
  }

  /**
   * Actualiza una categoría existente.
   * @async
   * @param {number} id - ID de la categoría a actualizar.
   * @param {Object} categoriaData - Datos a actualizar.
   * @returns {Promise<Object>} Categoría actualizada.
   * @throws {ApiError} Si ocurre un error al actualizar.
   */
  async actualizar(id, categoriaData) {
    const data = await conMensaje('Error al actualizar categoría',
      actualizarFilas('categoria', categoriaData, 'id_categoria = $1', [id]));

    return new Categoria(data[0]);
  }

  /**
   * Elimina una categoría.
   * @async
   * @param {number} id - ID de la categoría a eliminar.
   * @returns {Promise<Object>} Categoría eliminada.
   * @throws {ApiError} Si ocurre un error al eliminar.
   */
  async eliminar(id) {
    const data = await conMensaje('Error al eliminar categoría',
      consulta('DELETE FROM categoria WHERE id_categoria = $1 RETURNING *', [id]));

    if (!data || data.length === 0) {
      throw new ApiError('Categoría no encontrada', 404);
    }

    return new Categoria(data[0]);
  }
}

export default CategoriaRepository;
