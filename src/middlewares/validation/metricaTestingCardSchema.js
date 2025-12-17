// src/middlewares/validation/metricaTestingCardSchema.js
import { z } from 'zod';

const metricaCreateSchema = z.object({
  id_testing_card: z.number().int().positive('El ID de testing card debe ser un número positivo'),
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder los 50 caracteres'),
  operador: z.string()
    .min(1, 'El operador es requerido'),
  criterio: z.string().min(1, 'El criterio es requerido'),
  resultado: z.string().max(30, 'El resultado no puede exceder los 30 caracteres').optional()
});

const metricaUpdateSchema = z.object({
  nombre: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder los 20 caracteres')
    .optional(),
  operador: z.string()
    .min(1, 'El operador es requerido')
    .optional(),
  criterio: z.string().min(1, 'El criterio es requerido').optional(),
  resultado: z.string().max(30).optional().nullable()
});

const metricaResultadoUpdateSchema = z.object({
  resultado: z.string().max(30).nullable()
});

export { metricaCreateSchema, metricaUpdateSchema, metricaResultadoUpdateSchema };