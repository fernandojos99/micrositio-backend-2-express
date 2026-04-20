import * as habilidadService from '../services/habilidadService.js';

/**
 * Obtener habilidades por empleado
 */
export async function obtenerPorEmpleado(req, res, next) {
  try {
    const idEmpleado = parseInt(req.params.id);

    const habilidades = await habilidadService.obtenerPorEmpleado(idEmpleado);

    res.status(200).json({
      success: true,
      data: habilidades
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Crear habilidad
 */
export async function crear(req, res, next) {
  try {
    const habilidadData = req.body;
    const idEmpleado = parseInt(req.params.id);

    const nuevaHabilidad = await habilidadService.crear({
      ...habilidadData,
      id_empleado: idEmpleado
    });

    res.status(201).json({
      success: true,
      data: nuevaHabilidad
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Actualizar habilidad
 */
export async function actualizar(req, res, next) {
  try {
    const idHabilidad = parseInt(req.params.id);
    const updateData = req.body;

    const habilidadActualizada = await habilidadService.actualizar(idHabilidad, updateData);

    res.status(200).json({
      success: true,
      data: habilidadActualizada
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar habilidad
 */
export async function eliminar(req, res, next) {
  try {
    const idHabilidad = parseInt(req.params.id);

    const habilidadEliminada = await habilidadService.eliminar(idHabilidad);

    res.status(200).json({
      success: true,
      data: habilidadEliminada
    });

  } catch (error) {
    next(error);
  }
}

/**
 * Sincronizar habilidades de un empleado
 */
export async function sync(req, res, next) {
  try {
    const habilidades = req.body;
    const idEmpleado = parseInt(req.params.id);

    const result = await habilidadService.sync(idEmpleado, habilidades);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
}