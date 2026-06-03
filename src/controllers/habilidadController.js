import * as habilidadService from '../services/habilidadService.js';
import { success, created } from '../utils/responseHelper.js';

export async function obtenerPorEmpleado(req, res, next) {
  try {
    const idEmpleado = parseInt(req.params.id);
    const habilidades = await habilidadService.obtenerPorEmpleado(idEmpleado);
    return success(res, habilidades);
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    const habilidadData = req.body;
    const idEmpleado = parseInt(req.params.id);
    const nuevaHabilidad = await habilidadService.crear({
      ...habilidadData,
      id_empleado: idEmpleado
    });
    return created(res, nuevaHabilidad);
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req, res, next) {
  try {
    const idHabilidad = parseInt(req.params.id);
    const updateData = req.body;
    const habilidadActualizada = await habilidadService.actualizar(idHabilidad, updateData);
    return success(res, habilidadActualizada);
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req, res, next) {
  try {
    const idHabilidad = parseInt(req.params.id);
    const habilidadEliminada = await habilidadService.eliminar(idHabilidad);
    return success(res, habilidadEliminada);
  } catch (error) {
    next(error);
  }
}

export async function sync(req, res, next) {
  try {
    const habilidades = req.body;
    const idEmpleado = parseInt(req.params.id);
    const result = await habilidadService.sync(idEmpleado, habilidades);
    return success(res, result);
  } catch (error) {
    next(error);
  }
}
