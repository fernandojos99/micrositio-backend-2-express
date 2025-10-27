// src/middlewares/validation/plantillaSecuenciaSchema.js
import { z } from 'zod';

// Esquema para crear una plantilla secuencia (recibe id_testing_card para copiar)
export const plantillaSecuenciaCreateSchema = z.object({
  id_testing_card: z.number()
    .int()
    .positive()
    .describe('ID de la testing card original a copiar - debe ser un entero positivo'),
  id_empleado: z.number()
    .int()
    .positive()
    .describe('ID del empleado - debe ser un entero positivo')
});

// Esquema interno para validar datos antes de insertar en BD
export const plantillaSecuenciaDBSchema = z.object({
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
