// src/repositories/proyectoRepository.js
import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import Proyecto from '../models/Proyecto.js';

class ProyectoRepository {
  async obtenerPorId(id_proyecto) {
    const data = await conMensaje('Error al obtener proyecto',
      uno('SELECT * FROM proyecto WHERE id_proyecto = $1', [id_proyecto]));

    return data ? Proyecto.fromDatabase(data) : null;
  }

  async crear(proyectoData) {
    const data = await conMensaje('Error al crear proyecto',
      insertarFilas('proyecto', proyectoData));

    return Proyecto.fromDatabase(data[0]);
  }

  async actualizar(id_proyecto, proyectoData) {
    const data = await conMensaje('Error al actualizar proyecto',
      actualizarFilas('proyecto', proyectoData, 'id_proyecto = $1', [id_proyecto]));

    if (!data || data.length === 0) {
      throw new ApiError(`Proyecto con ID ${id_proyecto} no encontrado`, 404);
    }

    return Proyecto.fromDatabase(data[0]);
  }

  async eliminar(id_proyecto) {
    const data = await conMensaje('Error al eliminar proyecto',
      consulta('DELETE FROM proyecto WHERE id_proyecto = $1 RETURNING *', [id_proyecto]));

    return data ? Proyecto.fromDatabase(data[0]) : null;
  }

  async listarTodos() {
    const data = await conMensaje('Error al listar proyectos',
      consulta('SELECT * FROM proyecto'));

    return data.map(proyecto => Proyecto.fromDatabase(proyecto));
  }

  async listarPorIds(ids_proyectos) {
    if (!ids_proyectos || ids_proyectos.length === 0) {
      return [];
    }

    const data = await conMensaje('Error al listar proyectos por IDs',
      consulta('SELECT * FROM proyecto WHERE id_proyecto = ANY($1)', [ids_proyectos]));

    return data.map(proyecto => Proyecto.fromDatabase(proyecto));
  }

  /**
   * Buscar proyectos por texto.
   * @param {string} q - Texto de búsqueda.
   * @returns {Promise<Array>} Lista de proyectos que coinciden con el texto.
   */
  async buscarPorTexto(q) {
    try {
      // q va como parámetro: antes se interpolaba dentro del filtro .or() de
      // PostgREST, y una coma o un paréntesis en la búsqueda alteraba el filtro.
      const data = await conMensaje('Error al buscar proyectos',
        consulta('SELECT * FROM proyecto WHERE titulo ILIKE $1 OR descripcion ILIKE $1', [`%${q}%`]));

      return data.map((proyecto) => Proyecto.fromDatabase(proyecto));
    } catch (error) {
      console.error('Error en ProyectoRepository.buscarPorTexto:', error);
      throw error;
    }
  }
}

export default ProyectoRepository;
