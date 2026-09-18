// src/middlewares/validation/proyectoEtapaSchema.js
/**
 * Esquemas de validación de las etapas de un proyecto.
 * @module middlewares/validation/proyectoEtapaSchema
 */

import { z } from 'zod';

/** Las 5 pestañas, en orden. Debe coincidir con el CHECK de proyecto_etapa. */
export const ETAPAS = ['BRIEF', 'PLAN', 'EJECUCION', 'IDEACION', 'RESULTADOS'];

/**
 * Guardado de una etapa. `datos` es libre a propósito (lo que capturan las
 * pestañas todavía está cambiando de forma), pero se limita su tamaño para que
 * nadie use la tabla como almacén de archivos.
 */
const proyectoEtapaUpdateSchema = z.object({
  etapa_actual: z.enum(ETAPAS, {
    message: `La etapa debe ser una de: ${ETAPAS.join(', ')}`
  }).optional(),
  datos: z.record(z.string(), z.any())
    .refine(d => JSON.stringify(d).length <= 500_000, {
      message: 'Los datos de la etapa no pueden exceder 500 KB'
    })
    .optional(),
  es_maqueta: z.boolean().optional()
}).refine(
  data => data.etapa_actual !== undefined || data.datos !== undefined || data.es_maqueta !== undefined,
  { message: 'No hay nada que guardar: envía etapa_actual, datos o es_maqueta' }
);

export { proyectoEtapaUpdateSchema };
