import * as accionableService from '../services/accionableService.js';
import {
  accionableCreateSchema,
  accionableUpdateSchema,
  accionableSyncSchema,
} from '../middlewares/validation/accionableSchema.js';

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
// export async function obtenerTodos(req, res, next) {
//   try {
//     const accionables = await accionableService.obtenerTodos();

//     res.status(200).json({
//       success: true,
//       data: accionables
//     });

//   } catch (error) {
//     next(error);
//   }
// }



/**
 * Crear accionable  
 */

// investigar el next y el error handling en express, para 
//que el error se propague al middleware de manejo de errores y
// no se quede colgado el request sin respuesta
export async function crear(req, res, next) {
  try {
    const accionableData = accionableCreateSchema.parse(req.body);

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
    const updateData = accionableUpdateSchema.parse(req.body);

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




/**
 * Sincronizar accionables de una learning card
 */
export async function sync(req, res, next) {
  try {

    const accionables = accionableSyncSchema.parse(req.body);
    const idLearningCard = parseInt(req.params.id);

    const result = await accionableService.sync(idLearningCard, accionables);

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    next(error);
  }
}


/**
 * Obtener accionables por Learning Card
 */
export async function obtenerPorLearningCard(req, res, next) {
  try {

    const idLearningCard = parseInt(req.params.id);

    const accionables = await accionableService.obtenerPorLearningCard(idLearningCard);

    res.status(200).json({
      success: true,
      data: accionables
    });

  } catch (error) {
    next(error);
  }
}




/**

* Obtener accionables por Testing Card
  */
export async function obtenerPorTestingCard(req, res, next) {
  try {

  const idTestingCard = parseInt(req.params.id);

  const accionables = await accionableService.obtenerPorTestingCard(idTestingCard);

  res.status(200).json({
  success: true,
  data: accionables
  });

} catch (error) {
next(error);
}
}

/**

* Obtener accionables por Secuencia
  */
  export async function obtenerPorSecuencia(req, res, next) {
  try {

  const idSecuencia = parseInt(req.params.id);

  const accionables = await accionableService.obtenerPorSecuencia(idSecuencia);

  res.status(200).json({
  success: true,
  data: accionables
  });

} catch (error) {
next(error);
}
}

/**

* Obtener accionables por Proyecto
  */
  export async function obtenerPorProyecto(req, res, next) {
  try {

  const idProyecto = parseInt(req.params.id);

  const accionables = await accionableService.obtenerPorProyecto(idProyecto);

  res.status(200).json({
  success: true,
  data: accionables
  });

} catch (error) {
next(error);
}
}
