// src/middlewares/validation/agenteSchema.js
import { z } from 'zod';

// Esquema base para crear agente
const agenteCreateSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder los 150 caracteres'),
  link: z.string()
    .url('Debe ser una URL válida')
    .optional(),
  descripcion: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .optional(),
  prompt: z.string()
    .min(10, 'El prompt debe tener al menos 10 caracteres')
    .optional()
});

// Esquema para actualización (todos los campos opcionales)
const agenteUpdateSchema = z.object({
  nombre: z.string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder los 150 caracteres')
    .optional(),
  link: z.string()
    .url('Debe ser una URL válida')
    .optional(),
  descripcion: z.string()
    .min(10, 'La descripción debe tener al menos 10 caracteres')
    .optional(),
  prompt: z.string()
    .min(10, 'El prompt debe tener al menos 10 caracteres')
    .optional()
});

export { agenteCreateSchema, agenteUpdateSchema };
