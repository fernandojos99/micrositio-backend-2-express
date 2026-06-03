import * as accionableService from '../services/accionableService.js';
import { success, created } from '../utils/responseHelper.js';
import { getPaginationParams } from '../utils/paginationHelper.js';

export async function obtenerPorId(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const accionable = await accionableService.obtenerPorId(id);
    return success(res, accionable);
  } catch (error) {
    next(error);
  }
}

export async function crear(req, res, next) {
  try {
    const accionableData = req.body;
    const nuevoAccionable = await accionableService.crear(accionableData);
    return created(res, nuevoAccionable);
  } catch (error) {
    next(error);
  }
}

export async function actualizar(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;
    const accionableActualizado = await accionableService.actualizar(id, updateData);
    return success(res, accionableActualizado);
  } catch (error) {
    next(error);
  }
}

export async function eliminar(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const accionableEliminado = await accionableService.eliminar(id);
    return success(res, accionableEliminado);
  } catch (error) {
    next(error);
  }
}

export async function sync(req, res, next) {
  try {
    const accionables = req.body;
    const idLearningCard = parseInt(req.params.id);
    const result = await accionableService.sync(idLearningCard, accionables);
    return success(res, result);
  } catch (error) {
    next(error);
  }
}

export async function obtenerPorLearningCard(req, res, next) {
  try {
    const idLearningCard = parseInt(req.params.id);
    const accionables = await accionableService.obtenerPorLearningCard(idLearningCard);
    return success(res, accionables);
  } catch (error) {
    next(error);
  }
}

export async function obtenerPorTestingCard(req, res, next) {
  try {
    const idTestingCard = parseInt(req.params.id);
    const accionables = await accionableService.obtenerPorTestingCard(idTestingCard);
    return success(res, accionables);
  } catch (error) {
    next(error);
  }
}

export async function obtenerPorSecuencia(req, res, next) {
  try {
    const idSecuencia = parseInt(req.params.id);
    const accionables = await accionableService.obtenerPorSecuencia(idSecuencia);
    return success(res, accionables);
  } catch (error) {
    next(error);
  }
}

export async function obtenerPorProyecto(req, res, next) {
  try {
    const { page, limit } = getPaginationParams(req);
    const idProyecto = parseInt(req.params.id);
    const accionables = await accionableService.obtenerPorProyecto(idProyecto);
    const total = accionables.length;
    return success(res, accionables, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}
