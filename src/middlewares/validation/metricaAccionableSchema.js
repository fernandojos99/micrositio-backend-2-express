// src/middlewares/validation/metricaAccionableSchema.js
/**
 * Esquemas de validación de las métricas de un accionable.
 * Los límites salen de las columnas reales: operador varchar(10),
 * resultado varchar(30).
 * @module middlewares/validation/metricaAccionableSchema
 */

import { z } from 'zod';

const metricaAccionableCreateSchema = z.object({
  id_accionable: z.number().int().positive('El ID del accionable debe ser un número positivo'),
  nombre: z.string()
    .min(1, 'El nombre de la métrica es obligatorio')
    .max(255, 'El nombre no puede exceder los 255 caracteres'),
  operador: z.string().max(10, 'El operador no puede exceder los 10 caracteres').optional().nullable(),
  criterio: z.string().optional().nullable(),
  resultado: z.string().max(30, 'El resultado no puede exceder los 30 caracteres').optional().nullable(),
});

const metricaAccionableUpdateSchema = z.object({
  nombre: z.string().min(1).max(255).optional(),
  operador: z.string().max(10).optional().nullable(),
  criterio: z.string().optional().nullable(),
  resultado: z.string().max(30).optional().nullable(),
}).refine(
  (datos) => Object.keys(datos).length > 0,
  { message: 'No hay nada que actualizar: envía nombre, operador, criterio o resultado' }
);

export { metricaAccionableCreateSchema, metricaAccionableUpdateSchema };
