import { consulta, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js'
import { conMensaje } from '../utils/errorBd.js'
import ApiError from '../utils/ApiError.js'
import Habilidad from '../models/Habilidad.js' // Asumiendo que crearás este modelo

/**
 * Obtener todas las habilidades de un empleado específico
 */
export async function obtenerPorEmpleado(idEmpleado) {
  const data = await conMensaje('Error al obtener las habilidades del empleado',
    consulta(`
      SELECT id_habilidad, id_empleado, nombre_habilidad, nivel
      FROM habilidades
      WHERE id_empleado = $1
    `, [idEmpleado]));

  return data ? data.map(item => new Habilidad(item)) : [];
}

/**
 * Agregar una nueva habilidad a un empleado
 */
export async function crear(habilidadData) {
  const data = await conMensaje('Error al registrar la habilidad',
    exigirFila(insertarFilas('habilidades', habilidadData)))

  return new Habilidad(data)
}

/**
 * Eliminar una habilidad específica por su ID
 */
export async function eliminar(idHabilidad) {
  const data = await conMensaje('Error al eliminar la habilidad',
    exigirFila(consulta('DELETE FROM habilidades WHERE id_habilidad = $1 RETURNING *', [idHabilidad])))

  if (!data) {
    throw new ApiError('Habilidad no encontrada', 404)
  }

  return new Habilidad(data)
}

/**
 * Actualizar una habilidad (por ejemplo, cambiar el nombre o nivel)
 */
export async function actualizar(idHabilidad, updateData) {
  const data = await conMensaje('Error al actualizar la habilidad',
    exigirFila(actualizarFilas('habilidades', updateData, 'id_habilidad = $1', [idHabilidad])))

  return new Habilidad(data)
}
