// src/middlewares/validation/urlFormatoSchema.js
import { z } from 'zod';

// Schema para crear una nueva URL formato
export const urlFormatoCreateSchema = z.object({
  url: z.string()
    .min(1, 'La URL es requerida')
    .url('Debe ser una URL válida'),
  categoria: z.string()
    .min(1, 'La categoría es requerida').max(20, 'La categoría no puede exceder 20 caracteres').optional(),
  descripcion: z.string()
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .optional()
});

// Schema para actualizar una URL formato (PATCH - actualización parcial)
export const urlFormatoUpdateSchema = z.object({
  url: z.string()
    .url('Debe ser una URL válida')
    .optional(),
  categoria: z.string()
    .max(20, 'La categoría no puede exceder 20 caracteres')
    .optional(),
  descripcion: z.string()
    .max(255, 'La descripción no puede exceder 255 caracteres')
    .optional()
}).refine(data => Object.keys(data).length > 0, {
  message: 'Debe proporcionar al menos un campo para actualizar'
});

export default {
  urlFormatoCreateSchema,
  urlFormatoUpdateSchema
};