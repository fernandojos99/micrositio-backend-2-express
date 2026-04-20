import * as habilidadRepo from '../repositories/habilidadesRepositorio.js';
import ApiError from '../utils/ApiError.js';

/**
 * Obtener habilidades por empleado
 */
export async function obtenerPorEmpleado(idEmpleado) {
  if (!Number.isInteger(idEmpleado)) {
    throw new ApiError('ID de empleado inválido', 400);
  }

  const habilidades = await habilidadRepo.obtenerPorEmpleado(idEmpleado);

  return habilidades.map(h => h.fromRow());
}

/**
 * Crear una habilidad
 */
export async function crear(habilidadData) {

  if (!habilidadData.id_empleado || !Number.isInteger(habilidadData.id_empleado)) {
    throw new ApiError('ID de empleado inválido', 400);
  }

  if (!habilidadData.nombre_habilidad) {
    throw new ApiError('El nombre de la habilidad es requerido', 400);
  }

  const habilidad = await habilidadRepo.crear(habilidadData);

  return habilidad.fromRow();
}

/**
 * Actualizar una habilidad
 */
export async function actualizar(idHabilidad, updateData) {

  if (!Number.isInteger(idHabilidad)) {
    throw new ApiError('ID de habilidad inválido', 400);
  }

  const habilidad = await habilidadRepo.actualizar(idHabilidad, updateData);

  return habilidad.fromRow();
}

/**
 * Eliminar una habilidad
 */
export async function eliminar(idHabilidad) {

  if (!Number.isInteger(idHabilidad)) {
    throw new ApiError('ID de habilidad inválido', 400);
  }

  const habilidad = await habilidadRepo.eliminar(idHabilidad);

  return habilidad.fromRow();
}


/**
 * Sincronizar habilidades de un empleado
 * (similar a sync de accionables)
 */
export async function sync(idEmpleado, habilidades = []) {

  const id = Number(idEmpleado);

  if (!Number.isInteger(id)) {
    throw new ApiError('ID de empleado inválido', 400);
  }

  const existentes = await habilidadRepo.obtenerPorEmpleado(id);

  const idsEnviados = new Set();
  const resultados = [];

  // CREATE / UPDATE
  for (const habilidad of habilidades) {

    const existente = existentes.find(e =>
      e.nombre === habilidad.nombre &&
      e.nivel === habilidad.nivel
    );

    if (existente) {
      idsEnviados.add(existente.id_habilidad);

      const actualizado = await habilidadRepo.actualizar(
        existente.id_habilidad,
        habilidad
      );

      resultados.push(actualizado.fromRow());
    } else {
      const nuevo = await habilidadRepo.crear({
        ...habilidad,
        id_empleado: id
      });

      resultados.push(nuevo.fromRow());
    }
  }

  // DELETE
  for (const existente of existentes) {
    if (!idsEnviados.has(existente.id_habilidad)) {
      await habilidadRepo.eliminar(existente.id_habilidad);
    }
  }

  return resultados;
}