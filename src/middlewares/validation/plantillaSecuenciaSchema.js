// src/middlewares/validation/plantillaSecuenciaSchema.js
import { z } from 'zod';

// Esquema para crear una plantilla secuencia
export const plantillaSecuenciaCreateSchema = z.object({
  id_secuencia: z.number()
    .int()
    .positive()
    .describe('ID de la secuencia - debe ser un entero positivo'),
  id_empleado: z.number()
    .int()
    .positive()
    .describe('ID del empleado - debe ser un entero positivo')
});

// Esquema para actualizar una plantilla secuencia
export const plantillaSecuenciaUpdateSchema = z.object({
  id_secuencia: z.number()
    .int()
    .positive()
    .optional()
    .describe('ID de la secuencia - debe ser un entero positivo'),
  id_empleado: z.number()
    .int()
    .positive()
    .optional()
    .describe('ID del empleado - debe ser un entero positivo')
}).refine(data => Object.keys(data).length > 0, {
  message: "Al menos un campo debe ser proporcionado para la actualización"
});

// Esquema para validar UUID de plantilla secuencia
export const plantillaSecuenciaIdSchema = z.object({
  id: z.string()
    .uuid()
    .describe('ID de la plantilla secuencia - debe ser un UUID válido')
});
