// src/middlewares/validation/plantillaMetricaTcSchema.js
import { z } from 'zod';

// Esquema base para crear plantilla metrica tc
const plantillaMetricaTcCreateSchema = z.object({
  id_metrica: z.number()
    .int('El ID de métrica debe ser un número entero')
    .positive('El ID de métrica debe ser un número positivo'),
  id_empleado: z.number()
    .int('El ID de empleado debe ser un número entero')
    .positive('El ID de empleado debe ser un número positivo')
});

// Esquema para actualización (todos los campos opcionales excepto que al menos uno debe estar presente)
const plantillaMetricaTcUpdateSchema = z.object({
  id_metrica: z.number()
    .int('El ID de métrica debe ser un número entero')
    .positive('El ID de métrica debe ser un número positivo')
    .optional(),
  id_empleado: z.number()
    .int('El ID de empleado debe ser un número entero')
    .positive('El ID de empleado debe ser un número positivo')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: "Al menos un campo debe ser proporcionado para actualizar"
});

export { plantillaMetricaTcCreateSchema, plantillaMetricaTcUpdateSchema };
