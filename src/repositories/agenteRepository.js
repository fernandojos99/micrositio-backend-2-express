// src/repositories/agenteRepository.js
import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import Agente from '../models/Agente.js';

class AgenteRepository {
  /**
   * Obtiene un agente por su ID
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Agente|null>} Agente encontrado o null
   */
  async obtenerPorId(id_agente) {
    const data = await conMensaje('Error al obtener agente',
      uno('SELECT * FROM agente WHERE id_agente = $1', [id_agente]));

    return data ? Agente.fromDatabase(data) : null;
  }

  /**
   * Lista todos los agentes
   * @returns {Promise<Array<Agente>>} Lista de agentes
   */
  async listarTodos() {
    const data = await conMensaje('Error al listar agentes',
      consulta('SELECT * FROM agente ORDER BY created_at DESC'));

    return data.map(agente => Agente.fromDatabase(agente));
  }

  /**
   * Crea un nuevo agente
   * @param {Object} agenteData - Datos del agente
   * @returns {Promise<Agente>} Agente creado
   */
  async crear(agenteData) {
    const data = await conMensaje('Error al crear agente',
      insertarFilas('agente', agenteData));

    return Agente.fromDatabase(data[0]);
  }

  /**
   * Actualiza un agente existente
   * @param {number} id_agente - ID del agente
   * @param {Object} agenteData - Datos a actualizar
   * @returns {Promise<Agente|null>} Agente actualizado o null
   */
  async actualizar(id_agente, agenteData) {
    const data = await conMensaje('Error al actualizar agente',
      actualizarFilas('agente', { ...agenteData, updated_at: new Date().toISOString() }, 'id_agente = $1', [id_agente]));

    return data ? Agente.fromDatabase(data[0]) : null;
  }

  /**
   * Elimina un agente
   * @param {number} id_agente - ID del agente
   * @returns {Promise<Agente|null>} Agente eliminado o null
   */
  async eliminar(id_agente) {
    const data = await conMensaje('Error al eliminar agente',
      consulta('DELETE FROM agente WHERE id_agente = $1 RETURNING *', [id_agente]));

    return data ? Agente.fromDatabase(data[0]) : null;
  }

  /**
   * Buscar agentes por texto.
   * @param {string} q - Texto de búsqueda.
   * @returns {Promise<Array>} Lista de agentes que coinciden con el texto.
   */
  async buscarPorTexto(q) {
    try {
      // q va como parámetro: antes se interpolaba dentro del filtro .or() de
      // PostgREST, y una coma o un paréntesis en la búsqueda alteraba el filtro.
      const data = await conMensaje('Error al buscar agentes', consulta(`
        SELECT * FROM agente
        WHERE nombre ILIKE $1 OR descripcion ILIKE $1 OR prompt ILIKE $1
           OR link ILIKE $1 OR categoria ILIKE $1
      `, [`%${q}%`]));

      return data.map(agente => Agente.fromDatabase(agente));
    } catch (error) {
      console.error('Error en AgenteRepository.buscarPorTexto:', error);
      throw error;
    }
  }
}

export default AgenteRepository;
