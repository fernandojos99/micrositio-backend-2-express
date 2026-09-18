// src/repositories/secuenciaRepository.js
import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import Secuencia from '../models/Secuencia.js';

class SecuenciaRepository {
  /**
   * Obtiene una secuencia por ID de proyecto
   * @param {number} id_proyecto - ID del proyecto
   * @returns {Promise<Array>} Lista de instancias de Secuencia
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerPorProyecto(id_proyecto) {
    const data = await conMensaje('Error al obtener secuencias',
      consulta('SELECT * FROM secuencia WHERE id_proyecto = $1', [id_proyecto]));

    // Devuelve instancias del modelo
    return data.map(sec => new Secuencia(sec));
  }

  /**
   * Obtiene una secuencia por su ID
   * @param {number} id_secuencia - ID de la secuencia
   * @returns {Promise<Secuencia|null>} Instancia del modelo Secuencia o null
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerPorId(id_secuencia) {
    const data = await conMensaje('Error al obtener secuencia',
      uno('SELECT * FROM secuencia WHERE id_secuencia = $1', [id_secuencia]));

    return data ? new Secuencia(data) : null;
  }

  /**
   * Obtiene todas las secuencias
   * @returns {Promise<Array>} Lista de instancias de Secuencia
   * @throws {ApiError} Si ocurre un error
   */
  async obtenerTodas() {
    const data = await conMensaje('Error al obtener secuencias',
      consulta('SELECT * FROM secuencia'));

    return data.map(sec => new Secuencia(sec));
  }

  /**
   * Crea una nueva secuencia
   * @param {Object} secuenciaData - Datos de la secuencia
   * @returns {Promise<Secuencia>} Instancia del modelo Secuencia creada
   * @throws {ApiError} Si ocurre un error
   */
  async crear(secuenciaData) {
    const data = await conMensaje('Error al crear secuencia',
      insertarFilas('secuencia', secuenciaData));

    if (!data || data.length === 0) {
      throw new ApiError('Error al crear secuencia: No se devolvieron datos', 500);
    }

    return new Secuencia(data[0]);
  }

  /**
   * Actualiza una secuencia existente
   * @param {number} id_secuencia - ID de la secuencia
   * @param {Object} secuenciaData - Datos a actualizar
   * @returns {Promise<Secuencia>} Instancia del modelo Secuencia actualizada
   * @throws {ApiError} Si ocurre un error
   */
  async actualizar(id_secuencia, secuenciaData) {
    const data = await conMensaje('Error al actualizar secuencia',
      actualizarFilas('secuencia', secuenciaData, 'id_secuencia = $1', [id_secuencia]));

    if (!data || data.length === 0) {
      throw new ApiError(`Secuencia con ID ${id_secuencia} no encontrada`, 404);
    }

    return new Secuencia(data[0]);
  }

  /**
   * Elimina una secuencia
   * @param {number} id_secuencia - ID de la secuencia
   * @returns {Promise<Secuencia>} Instancia del modelo Secuencia eliminada
   * @throws {ApiError} Si ocurre un error
   */
  async eliminar(id_secuencia) {
    const data = await conMensaje('Error al eliminar secuencia',
      consulta('DELETE FROM secuencia WHERE id_secuencia = $1 RETURNING *', [id_secuencia]));

    if (!data || data.length === 0) {
      throw new ApiError('Secuencia no encontrada', 404);
    }

    return new Secuencia(data[0]);
  }

  /**
   * Busca secuencias por texto en nombre y descripción
   * (para la búsqueda general)
   * @param {string} q - Texto de búsqueda
   * @returns {Promise<Array<Secuencia>>}
   */
  async buscarPorTexto(q) {
    try {
      // El proyecto se anida como objeto (o null), igual que el join embebido
      // `proyecto:proyecto(...)` de PostgREST.
      const data = await conMensaje('Error al buscar secuencias', consulta(`
        SELECT
          s.id_secuencia,
          s.id_proyecto,
          s.nombre,
          s.descripcion,
          s.estado,
          (SELECT row_to_json(x) FROM (
             SELECT p.id_proyecto, p.titulo
             FROM proyecto p
             WHERE p.id_proyecto = s.id_proyecto
           ) x) AS proyecto
        FROM secuencia s
        WHERE s.nombre ILIKE $1 OR s.descripcion ILIKE $1
      `, [`%${q}%`]));

      // devolvemos objetos "crudos" con la relación anidada proyecto
      return data;
    } catch (error) {
      console.error('Error en SecuenciaRepository.buscarPorTexto:', error);
      throw error;
    }
  }
}

export default SecuenciaRepository;
