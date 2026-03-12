import * as accionableService from '../services/accionableService.js';

/**
 * Obtener accionable por ID
 */
export async function obtenerPorId(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const accionable = await accionableService.obtenerPorId(id);

    res.status(200).json({
      success: true,
      data: accionable
    });

  } catch (error) {
    next(error);
  }
}



/**
 * Obtener todos los accionables
 */
export async function obtenerTodos(req, res, next) {
  try {
    const accionables = await accionableService.obtenerTodos();

    res.status(200).json({
      success: true,
      data: accionables
    });

  } catch (error) {
    next(error);
  }
}



/**
 * Crear accionable  
 */

// investigar el next y el error handling en express, para 
//que el error se propague al middleware de manejo de errores y
// no se quede colgado el request sin respuesta
export async function crear(req, res, next) {
  try {
    const accionableData = req.body;

    const nuevoAccionable = await accionableService.crear(accionableData);

    res.status(201).json({
      success: true,
      data: nuevoAccionable
    });

  } catch (error) {
    next(error);
  }
}



/**
 * Actualizar accionable
 */
export async function actualizar(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    const accionableActualizado = await accionableService.actualizar(id, updateData);

    res.status(200).json({
      success: true,
      data: accionableActualizado
    });

  } catch (error) {
    next(error);
  }
}



/**
 * Eliminar accionable
 */
export async function eliminar(req, res, next) {
  try {
    const id = parseInt(req.params.id);

    const accionableEliminado = await accionableService.eliminar(id);

    res.status(200).json({
      success: true,
      data: accionableEliminado
    });

  } catch (error) {
    next(error);
  }
}