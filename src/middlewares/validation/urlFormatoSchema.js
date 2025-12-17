// src/middlewares/validation/urlFormatoSchema.js
import { z } from 'zod';

// Schema para crear una nueva URL formato
export const urlFormatoCreateSchema = z.object({
  url: z.string()
    .min(1, 'La URL es requerida')
    .url('Debe ser una URL válida')
});

// Schema para actualizar una URL formato
export const urlFormatoUpdateSchema = z.object({
  url: z.string()
    .min(1, 'La URL es requerida')
    .url('Debe ser una URL válida')
    .optional()
});

export default {
  urlFormatoCreateSchema,
  urlFormatoUpdateSchema
};