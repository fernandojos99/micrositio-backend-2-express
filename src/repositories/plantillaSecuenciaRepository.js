// src/repositories/plantillaSecuenciaRepository.js
import { consulta, uno, ejecutar, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import PlantillaSecuencia from '../models/PlantillaSecuencia.js';
import ApiError from '../utils/ApiError.js';

class PlantillaSecuenciaRepository {
  /**
   * Obtiene una plantilla secuencia por su ID
   * @param {string} id - UUID de la plantilla secuencia
   * @returns {Promise<PlantillaSecuencia|null>} Plantilla secuencia encontrada o null
   */
  async obtenerPorId(id) {
    try {
      const data = await conMensaje('Error al consultar la base de datos',
        uno('SELECT * FROM plantilla_secuencia WHERE id_plantilla_secuencia = $1', [id]));

      return data ? PlantillaSecuencia.fromDatabase(data) : null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al obtener plantilla secuencia: ${error.message}`, 500);
    }
  }

  /**
   * Obtiene todas las plantillas secuencia
   * @returns {Promise<PlantillaSecuencia[]>} Array de plantillas secuencia
   */
  async listarTodas() {
    try {
      const data = await conMensaje('Error al consultar la base de datos',
        consulta('SELECT * FROM plantilla_secuencia ORDER BY created_at DESC'));

      return data.map(item => PlantillaSecuencia.fromDatabase(item));
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al listar plantillas secuencia: ${error.message}`, 500);
    }
  }

  /**
   * Crea una nueva plantilla secuencia
   * @param {Object} datosPlantillaSecuencia - Datos de la plantilla secuencia
   * @returns {Promise<PlantillaSecuencia>} Plantilla secuencia creada
   */
  async crear(datosPlantillaSecuencia) {
    try {
      const plantillaSecuencia = new PlantillaSecuencia(datosPlantillaSecuencia);
      const datosParaInsertar = plantillaSecuencia.toDatabase();

      let data;
      try {
        data = await exigirFila(insertarFilas('plantilla_secuencia', datosParaInsertar));
      } catch (error) {
        if (error.code === '23503') {
          throw new ApiError('El ID de secuencia o empleado no existe', 400);
        }
        if (error.code === '23505') {
          throw new ApiError('Ya existe una plantilla secuencia con esos datos', 409);
        }
        throw new ApiError(`Error al crear plantilla secuencia: ${error.message}`, 500);
      }

      return PlantillaSecuencia.fromDatabase(data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al crear plantilla secuencia: ${error.message}`, 500);
    }
  }

  /**
   * Actualiza una plantilla secuencia existente
   * @param {string} id - UUID de la plantilla secuencia
   * @param {Object} datosActualizacion - Datos a actualizar
   * @returns {Promise<PlantillaSecuencia>} Plantilla secuencia actualizada
   */
  async actualizar(id, datosActualizacion) {
    try {
      const datosConTimestamp = {
        ...datosActualizacion,
        updated_at: new Date().toISOString()
      };

      let filas;
      try {
        filas = await actualizarFilas('plantilla_secuencia', datosConTimestamp, 'id_plantilla_secuencia = $1', [id]);
      } catch (error) {
        if (error.code === '23503') {
          throw new ApiError('El ID de secuencia o empleado no existe', 400);
        }
        throw new ApiError(`Error al actualizar plantilla secuencia: ${error.message}`, 500);
      }

      // Con .single(), no encontrar exactamente una fila era PGRST116, que este
      // repositorio traducía a 404.
      if (filas.length !== 1) {
        throw new ApiError('Plantilla secuencia no encontrada', 404);
      }

      return PlantillaSecuencia.fromDatabase(filas[0]);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al actualizar plantilla secuencia: ${error.message}`, 500);
    }
  }

  /**
   * Elimina una plantilla secuencia
   * @param {string} id - UUID de la plantilla secuencia
   * @returns {Promise<boolean>} true si se eliminó correctamente
   */
  async eliminar(id) {
    try {
      await conMensaje('Error al eliminar plantilla secuencia',
        ejecutar('DELETE FROM plantilla_secuencia WHERE id_plantilla_secuencia = $1', [id]));

      return true;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al eliminar plantilla secuencia: ${error.message}`, 500);
    }
  }

  /**
   * Verifica si existe una relación con secuencia específica
   * @param {number} idSecuencia - ID de la secuencia
   * @returns {Promise<boolean>} true si existe la relación
   */
  async existeRelacion(idSecuencia) {
    try {
      const data = await conMensaje('Error al verificar relación',
        consulta('SELECT id_plantilla_secuencia FROM plantilla_secuencia WHERE id_secuencia = $1 LIMIT 1', [idSecuencia]));

      return data.length > 0;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al verificar relación: ${error.message}`, 500);
    }
  }

  /**
   * Obtiene una plantilla secuencia por el ID de secuencia
   * @param {string} idSecuencia - ID de la secuencia
   * @returns {Promise<PlantillaSecuencia|null>} Plantilla secuencia encontrada o null
   */
  async obtenerPorIdSecuencia(idSecuencia) {
    try {
      const filas = await conMensaje('Error al consultar la base de datos',
        consulta('SELECT * FROM plantilla_secuencia WHERE id_secuencia = $1', [idSecuencia]));

      // Era un .single() con PGRST116 → null: sin filas y también con más de
      // una (id_secuencia no es único en esta tabla) devolvía null.
      return filas.length === 1 ? PlantillaSecuencia.fromDatabase(filas[0]) : null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al obtener plantilla secuencia por ID de secuencia: ${error.message}`, 500);
    }
  }
}

export default new PlantillaSecuenciaRepository();
