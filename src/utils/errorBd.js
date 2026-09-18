// src/utils/errorBd.js
import ApiError from './ApiError.js';

/**
 * Espera una consulta y, si falla, lanza ApiError con el mismo mensaje que
 * producían los repositorios con supabase-js:
 *
 *   if (error) throw new ApiError(`${mensaje}: ${error.message}`, 500);
 *
 * El texto de los errores de Postgres es idéntico al de antes, porque PostgREST
 * los reenviaba tal cual. Un ApiError que ya venga de más abajo se relanza sin
 * tocar.
 *
 * @param {string|null} mensaje - Prefijo, p. ej. 'Error al obtener categoría'.
 *   Con null se usa solo el mensaje del error, para los repositorios que
 *   lanzaban `new ApiError(error.message, 500)`.
 * @param {Promise} promesa - La consulta (db.consulta, db.uno...)
 * @param {number} [status=500]
 */
export async function conMensaje(mensaje, promesa, status = 500) {
  try {
    return await promesa;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(mensaje ? `${mensaje}: ${error.message}` : error.message, status);
  }
}

export default conMensaje;
