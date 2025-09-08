// src/middlewares/validation/secuenciaSchema.js
import { z } from 'zod';

const statusValues = ['EN PLANEACION', 'EN VALIDACION', 'EN ANALISIS', 'CANCELADO', 'TERMINADO','EN PROCESO'];

/**
 * Esquema para la creación de secuencias
 */
const secuenciaCreateSchema = z.object({
  id_proyecto: z.number().int().positive('El ID de proyecto debe ser un número positivo'),
  id_testing_card_padre: z.number().int().optional(),
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),
  descripcion: z.string().optional(),
  dia_inicio: z.coerce.date().optional(),
  dia_fin: z.coerce.date().optional(),
  estado: z.enum(statusValues).optional().default('EN PLANEACION')
});

/**
 * Esquema para la actualización de secuencias
 */
const secuenciaUpdateSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres')
    .optional(),
  descripcion: z.string().optional(),
  id_testing_card_padre: z.number()
    .int()
    .positive('El ID de testing card debe ser un número positivo')
    .optional(),  dia_inicio: z.coerce.date().optional(),
  dia_fin: z.coerce.date().optional(),
  estado: z.enum(statusValues).optional()
  }).refine(
    data => !data.dia_fin || !data.dia_inicio || data.dia_fin >= data.dia_inicio,
    {
      message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
      path: ['dia_fin']
    }
  );

export { secuenciaCreateSchema, secuenciaUpdateSchema };