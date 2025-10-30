// src/repositories/plantillaSecuenciaRepository.js
import supabase from '../config/supabaseClient.js';
import PlantillaSecuencia from '../models/PlantillaSecuencia.js';
import ApiError from '../utils/ApiError.js';

class PlantillaSecuenciaRepository {
  /**
   * Obtiene una plantilla secuencia por su ID
   * @param {string} id - UUID de la plantilla secuencia
   * @returns {Promise<PlantillaSecuencia|null>} Plantilla secuencia encontrada o null
   * 
   * SQL Equivalente:
   * SELECT * FROM plantilla_secuencia WHERE id_plantilla_secuencia = $1;
   */
  async obtenerPorId(id) {
    try {
      const { data, error } = await supabase
        .from('plantilla_secuencia')
        .select('*')
        .eq('id_plantilla_secuencia', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw new ApiError(`Error al consultar la base de datos: ${error.message}`, 500);
      }

      return data ? PlantillaSecuencia.fromDatabase(data) : null;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al obtener plantilla secuencia: ${error.message}`, 500);
    }
  }

  /**
   * Obtiene todas las plantillas secuencia
   * @returns {Promise<PlantillaSecuencia[]>} Array de plantillas secuencia
   * 
   * SQL Equivalente:
   * SELECT * FROM plantilla_secuencia ORDER BY created_at DESC;
   */
  async listarTodas() {
    try {
      const { data, error } = await supabase
        .from('plantilla_secuencia')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new ApiError(`Error al consultar la base de datos: ${error.message}`, 500);
      }

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
   * 
   * SQL Equivalente:
   * INSERT INTO plantilla_secuencia (id_secuencia, id_empleado)
   * VALUES ($1, $2)
   * RETURNING *;
   */
  async crear(datosPlantillaSecuencia) {
    try {
      const plantillaSecuencia = new PlantillaSecuencia(datosPlantillaSecuencia);
      const datosParaInsertar = plantillaSecuencia.toDatabase();

      const { data, error } = await supabase
        .from('plantilla_secuencia')
        .insert(datosParaInsertar)
        .select()
        .single();

      if (error) {
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
   * 
   * SQL Equivalente:
   * UPDATE plantilla_secuencia 
   * SET id_secuencia = COALESCE($2, id_secuencia),
   *     id_empleado = COALESCE($3, id_empleado),
   *     updated_at = NOW()
   * WHERE id_plantilla_secuencia = $1
   * RETURNING *;
   */
  async actualizar(id, datosActualizacion) {
    try {
      const datosConTimestamp = {
        ...datosActualizacion,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('plantilla_secuencia')
        .update(datosConTimestamp)
        .eq('id_plantilla_secuencia', id)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new ApiError('Plantilla secuencia no encontrada', 404);
        }
        if (error.code === '23503') {
          throw new ApiError('El ID de secuencia o empleado no existe', 400);
        }
        throw new ApiError(`Error al actualizar plantilla secuencia: ${error.message}`, 500);
      }

      return PlantillaSecuencia.fromDatabase(data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al actualizar plantilla secuencia: ${error.message}`, 500);
    }
  }

  /**
   * Elimina una plantilla secuencia
   * @param {string} id - UUID de la plantilla secuencia
   * @returns {Promise<boolean>} true si se eliminó correctamente
   * 
   * SQL Equivalente:
   * DELETE FROM plantilla_secuencia WHERE id_plantilla_secuencia = $1;
   */
  async eliminar(id) {
    try {
      const { error } = await supabase
        .from('plantilla_secuencia')
        .delete()
        .eq('id_plantilla_secuencia', id);

      if (error) {
        throw new ApiError(`Error al eliminar plantilla secuencia: ${error.message}`, 500);
      }

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
   * 
   * SQL Equivalente:
   * SELECT EXISTS(
   *   SELECT 1 FROM plantilla_secuencia WHERE id_secuencia = $1
   * );
   */
  async existeRelacion(idSecuencia) {
    try {
      const { data, error } = await supabase
        .from('plantilla_secuencia')
        .select('id_plantilla_secuencia')
        .eq('id_secuencia', idSecuencia)
        .limit(1);

      if (error) {
        throw new ApiError(`Error al verificar relación: ${error.message}`, 500);
      }

      return data.length > 0;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Error inesperado al verificar relación: ${error.message}`, 500);
    }
  }
}

export default new PlantillaSecuenciaRepository();
