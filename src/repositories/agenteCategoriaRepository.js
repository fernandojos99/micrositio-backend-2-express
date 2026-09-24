// src/repositories/agenteCategoriaRepository.js
import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import AgenteCategoria from '../models/AgenteCategoria.js';

// Objetos anidados que reproducen los joins embebidos de PostgREST de antes
// (`alias:columna_fk(campos)`): un objeto con esos campos, o null si no hay
// fila relacionada.
const AGENTE_RESUMIDO = `(SELECT row_to_json(x) FROM (
    SELECT a.id_agente, a.nombre FROM agente a WHERE a.id_agente = r.id_agente
  ) x) AS agente`;
const AGENTE_COMPLETO = `(SELECT row_to_json(a) FROM agente a WHERE a.id_agente = r.id_agente) AS agente`;
const CATEGORIA = `(SELECT row_to_json(y) FROM (
    SELECT c.id_categoria, c.nombre_categoria FROM categoria_agente c WHERE c.id_categoria = r.id_categoria
  ) y) AS categoria_agente`;

class AgenteCategoriaRepository {

  /**
   * Obtiene todas las categorías disponibles
   * @returns {Promise<Array>} Lista de categorías disponibles
   */
  async listarCategorias() {
    return conMensaje('Error al listar categorías',
      consulta('SELECT * FROM categoria_agente ORDER BY nombre_categoria ASC'));
  }

  /**
   * Obtiene una relación agente-categoría por su ID único
   * @param {number} id_relacion_agente_categoria - ID de la relación
   * @returns {Promise<AgenteCategoria|null>} Relación encontrada o null
   */
  async obtenerPorId(id_relacion_agente_categoria) {
    const data = await conMensaje('Error al obtener relación agente-categoría',
      uno('SELECT * FROM relacion_agente_categoria WHERE id_relacion_agente_categoria = $1', [id_relacion_agente_categoria]));

    return data ? AgenteCategoria.fromDatabase(data) : null;
  }

  /**
   * Lista todas las relaciones agente-categoría
   * @returns {Promise<Array<AgenteCategoria>>} Lista de relaciones
   */
  async listarTodos() {
    const data = await conMensaje('Error al listar relaciones agente-categoría', consulta(`
      SELECT r.*, ${AGENTE_RESUMIDO}, ${CATEGORIA}
      FROM relacion_agente_categoria r
      ORDER BY r.id_agente ASC
    `));

    return data.map(relacion => AgenteCategoria.fromDatabase(relacion));
  }

  /**
   * Lista las categorías de un agente específico
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Array<AgenteCategoria>>} Lista de relaciones del agente
   */
  async listarPorAgente(id_agente) {
    const data = await conMensaje('Error al listar categorías del agente', consulta(`
      SELECT r.*, ${CATEGORIA}
      FROM relacion_agente_categoria r
      WHERE r.id_agente = $1
      ORDER BY r.es_principal DESC
    `, [id_agente]));

    return data.map(relacion => AgenteCategoria.fromDatabase(relacion));
  }

  /**
   * Lista los agentes de una categoría específica
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<Array<AgenteCategoria>>} Lista de relaciones de la categoría
   */
  async listarPorCategoria(id_categoria) {
    const data = await conMensaje('Error al listar agentes de la categoría', consulta(`
      SELECT r.*, ${AGENTE_COMPLETO}
      FROM relacion_agente_categoria r
      WHERE r.id_categoria = $1
      ORDER BY r.es_principal DESC, r.id_agente
    `, [id_categoria]));

    return data.map(relacion => AgenteCategoria.fromDatabase(relacion));
  }

  /**
   * Crea una nueva relación agente-categoría
   * @param {Object} relacionData - Datos de la relación
   * @returns {Promise<AgenteCategoria>} Relación creada
   */
  async crear(relacionData) {
    const data = await conMensaje('Error al crear relación agente-categoría',
      insertarFilas('relacion_agente_categoria', relacionData));

    return AgenteCategoria.fromDatabase(data[0]);
  }

  /**
   * Actualiza una relación agente-categoría existente
   * @param {number} id_agente - ID del agente
   * @param {number} id_categoria - ID de la categoría
   * @param {Object} relacionData - Datos a actualizar
   * @returns {Promise<AgenteCategoria|null>} Relación actualizada o null
   */
  async actualizar(id_agente, id_categoria, relacionData) {
    const data = await conMensaje('Error al actualizar relación agente-categoría',
      actualizarFilas('relacion_agente_categoria', { ...relacionData, updated_at: new Date().toISOString() },
        'id_agente = $1 AND id_categoria = $2', [id_agente, id_categoria]));

    return data && data.length > 0 ? AgenteCategoria.fromDatabase(data[0]) : null;
  }

  /**
   * Elimina una relación agente-categoría
   * @param {number} id_agente - ID del agente
   * @param {number} id_categoria - ID de la categoría
   * @returns {Promise<AgenteCategoria|null>} Relación eliminada o null
   */
  async eliminar(id_agente, id_categoria) {
    const data = await conMensaje('Error al eliminar relación agente-categoría',
      consulta('DELETE FROM relacion_agente_categoria WHERE id_agente = $1 AND id_categoria = $2 RETURNING *',
        [id_agente, id_categoria]));

    return data && data.length > 0 ? AgenteCategoria.fromDatabase(data[0]) : null;
  }
}

export default AgenteCategoriaRepository;
