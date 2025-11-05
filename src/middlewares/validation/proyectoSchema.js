// src/middlewares/validation/proyectoSchema.js
import { z } from 'zod';

const proyectoCreateSchema = z.object({
  titulo: z.string()
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(50, 'El título no puede exceder los 50 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'COMPLETADO'])
    .optional()
    .default('ACTIVO'), // Valor por defecto
  fecha_inicio: z.coerce.date().optional(),
  fecha_fin_estimada: z.coerce.date().optional(),
  id_categoria: z.number().int().positive().default(1),
  id_lider: z.number().int().positive('El ID del líder debe ser un número positivo')
});

const proyectoUpdateSchema = proyectoCreateSchema.partial().extend({
  id_lider: z.number().int().positive('El ID del líder debe ser un número positivo').optional()
});

const proyectoPorUsuarioSchema = z.object({
  id_usuario: z.string()
    .uuid('El ID del usuario debe ser un UUID válido')
});

export { proyectoCreateSchema, proyectoUpdateSchema, proyectoPorUsuarioSchema };