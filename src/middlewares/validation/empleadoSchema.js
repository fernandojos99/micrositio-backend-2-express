// src/middlewares/validation/empleadoSchema.js
/**
 * Módulo de esquemas de validación para empleados usando Zod.
 * @module middlewares/validation/empleadoSchema
 */

import { z } from 'zod';

/**
 * Esquema para la creación de empleados.
 */
const empleadoCreateSchema = z.object({
  nombre_pila: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(40, 'El nombre no puede exceder los 40 caracteres'),
  apellido_paterno: z.string()
    .min(2, 'El apellido paterno debe tener al menos 2 caracteres')
    .max(20, 'El apellido paterno no puede exceder los 20 caracteres'),
  apellido_materno: z.string()
    .max(20, 'El apellido materno no puede exceder los 20 caracteres')
    .optional(),
  celular: z.string()
    .max(20, 'El celular no puede exceder los 20 caracteres')
    .optional(),
  correo: z.string()
    .email('Debe ser un correo electrónico válido')
    .max(60, 'El correo no puede exceder los 40 caracteres'),
  numero_empleado: z.string()
    .length(6, 'El número de empleado debe tener exactamente 6 caracteres'),
  activo: z.boolean()
    .optional()
    .describe("Estado activo/inactivo del empleado")
});

/**
 * Esquema para la actualización de empleados.
 * Similar a empleadoCreateSchema pero todos los campos son opcionales.
 */
const empleadoUpdateSchema = empleadoCreateSchema.partial();

export { empleadoCreateSchema, empleadoUpdateSchema };