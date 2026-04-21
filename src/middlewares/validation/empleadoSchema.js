// src/middlewares/validation/empleadoSchema.js

import { z } from 'zod';

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
    .max(60, 'El correo no puede exceder los 60 caracteres'),

  numero_empleado: z.string()
    .length(6, 'El número de empleado debe tener exactamente 6 caracteres'),

  activo: z.boolean()
    .optional()
    .describe("Estado activo/inactivo del empleado"),

  // Campos de perfil
  cargo: z.string()
    .max(50, 'El cargo no puede exceder los 50 caracteres')
    .optional(),

  departamento: z.string()
    .max(50, 'El departamento no puede exceder los 50 caracteres')
    .optional(),

  infopersonal: z.string()
    .max(255, 'La información personal no puede exceder los 255 caracteres')
    .optional(),

  // 🔽 Nuevo campo de habilidades
  habilidades: z.array(z.string())
    .optional()
    .default([])
    .describe("Lista de nombres de habilidades del empleado")
});

const empleadoUpdateSchema = empleadoCreateSchema.partial();

export { empleadoCreateSchema, empleadoUpdateSchema };