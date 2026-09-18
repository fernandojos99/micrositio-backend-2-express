// src/repositories/celulaProyectoRepository.js
/**
 * Repositorio para interactuar con la tabla celula_proyecto.
 * @class
 */
import { consulta, uno, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ApiError from '../utils/ApiError.js';
import CelulaProyecto from '../models/CelulaProyecto.js';

class CelulaProyectoRepository {
  /**
   * Obtiene relaciones por ID de empleado.
   * @async
   * @param {number} idEmpleado - ID del empleado.
   * @returns {Promise<Array>} Lista de relaciones.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerPorEmpleado(idEmpleado) {
    const data = await conMensaje('Error al obtener relaciones por empleado',
      consulta('SELECT * FROM celula_proyecto WHERE id_empleado = $1', [idEmpleado]));

    return data.map(item => new CelulaProyecto(item));
  }

  /**
   * Obtiene relaciones por ID de proyecto.
   * @async
   * @param {number} idProyecto - ID del proyecto.
   * @returns {Promise<Array>} Lista de relaciones.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerPorProyecto(idProyecto) {
    const data = await conMensaje('Error al obtener relaciones por proyecto',
      consulta('SELECT * FROM celula_proyecto WHERE id_proyecto = $1', [idProyecto]));

    return data.map(item => new CelulaProyecto(item));
  }

  /**
   * Obtiene todas las relaciones célula-proyecto.
   * @async
   * @returns {Promise<Array>} Lista de relaciones.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerTodos() {
    const data = await conMensaje('Error al obtener todas las relaciones',
      consulta('SELECT * FROM celula_proyecto'));

    return data.map(item => new CelulaProyecto(item));
  }

  /**
   * Crea una nueva relación célula-proyecto.
   * @async
   * @param {Object} celulaProyectoData - Datos de la relación.
   * @returns {Promise<Object>} Relación creada.
   * @throws {ApiError} Si ocurre un error al crear.
   */
  async crear(celulaProyectoData) {
    const data = await conMensaje('Error al crear relación célula-proyecto',
      insertarFilas('celula_proyecto', celulaProyectoData));

    return new CelulaProyecto(data[0]);
  }

  /**
   * Crea múltiples relaciones célula-proyecto.
   * @async
   * @param {Array<Object>} relacionesData - Array de objetos { id_empleado, id_proyecto, activo }
   * @returns {Promise<Array>} Relaciones creadas.
   * @throws {ApiError} Si ocurre un error al crear.
   */
  async crearMultiple(relacionesData) {
    const data = await conMensaje('Error al crear relaciones',
      insertarFilas('celula_proyecto', relacionesData));
    return data.map(item => new CelulaProyecto(item));
  }

  /**
   * Elimina una relación célula-proyecto.
   * @async
   * @param {number} id - ID de la relación a eliminar.
   * @returns {Promise<Object>} Relación eliminada.
   * @throws {ApiError} Si ocurre un error al eliminar.
   */
  async eliminar(id) {
    const data = await conMensaje('Error al eliminar relación célula-proyecto',
      consulta('DELETE FROM celula_proyecto WHERE id = $1 RETURNING *', [id]));

    if (!data || data.length === 0) {
      throw new ApiError('Relación no encontrada', 404);
    }

    return new CelulaProyecto(data[0]);
  }

  /**
   * Actualiza el estado activo de una relación célula-proyecto.
   * @async
   * @param {number} id - ID de la relación a actualizar.
   * @param {boolean} activo - Nuevo estado activo.
   * @returns {Promise<Object>} Relación actualizada.
   * @throws {ApiError} Si ocurre un error al actualizar.
   */
  async actualizarActivo(id, activo) {
    const data = await conMensaje('Error al actualizar relación célula-proyecto',
      actualizarFilas('celula_proyecto', { activo }, 'id = $1', [id]));

    if (!data || data.length === 0) {
      throw new ApiError('Relación no encontrada', 404);
    }

    return new CelulaProyecto(data[0]);
  }
  /**
   * Obtiene una relación célula-proyecto por su ID.
   * @async
   * @param {number} id - ID de la relación.
   * @returns {Promise<CelulaProyecto|null>} Relación encontrada o null si no existe.
   * @throws {ApiError} Si ocurre un error al consultar.
   */
  async obtenerPorId(id) {
    const data = await conMensaje('Error al obtener relación por ID',
      uno('SELECT * FROM celula_proyecto WHERE id = $1', [id]));

    return data ? new CelulaProyecto(data) : null;
  }




}

export default CelulaProyectoRepository;
