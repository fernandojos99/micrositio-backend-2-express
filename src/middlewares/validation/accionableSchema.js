import { z } from 'zod';

/**
 * Esquemas de accionable. No existían: accionableController aceptaba
 * `req.body` tal cual en crear, actualizar y sync.
 *
 * Los límites salen del esquema real de la tabla `accionable` en Supabase:
 * contenido y titulo son varchar(255), impacto y esfuerzo enteros,
 * realizado booleano con default false.
 */

export const accionableCreateSchema = z.object({
  id_learning_card: z.number().int().positive('El ID de learning card debe ser un número positivo'),
  contenido: z.string().min(1, 'El contenido es requerido').max(255, 'El contenido no puede exceder los 255 caracteres'),
  titulo: z.string().max(255, 'El título no puede exceder los 255 caracteres').optional(),
  impacto: z.number().int('El impacto debe ser un número entero'),
  esfuerzo: z.number().int('El esfuerzo debe ser un número entero'),
  realizado: z.boolean().optional(),
});

export const accionableUpdateSchema = accionableCreateSchema
  .partial()
  .refine(data => Object.keys(data).length > 0, {
    message: 'Debe proporcionar al menos un campo para actualizar',
  });

/** El endpoint de sync recibe la lista completa de accionables de una learning card. */
export const accionableSyncSchema = z.array(
  accionableCreateSchema.partial({ id_learning_card: true }).extend({
    id_accionable: z.number().int().positive().optional(),
  })
);
