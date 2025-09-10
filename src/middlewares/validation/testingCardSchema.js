// src/middlewares/validation/testingCardSchema.js
import { z } from 'zod';

const statusValues = ['EN PLANEACION', 'EN VALIDACION', 'EN ANALISIS', 'CANCELADO', 'TERMINADO'];

// Esquema base que puede ser reutilizado
const testingCardBaseSchema = z.object({
  id_secuencia: z.number().int().positive('El ID de secuencia debe ser un número positivo'),
  padre_id: z.number().int().positive('El ID padre debe ser un número positivo').optional(),
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres').max(300, 'El título no puede exceder los 300 caracteres'),
  hipotesis: z.string().min(10, 'La hipótesis debe tener al menos 10 caracteres').optional(),
  id_experimento_tipo: z.number().int().positive('El ID de tipo de experimento debe ser un número positivo').optional(),
  descripcion: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
  dia_inicio: z.coerce.date().optional(),
  dia_fin: z.coerce.date().optional(),
  anexo_url: z.string().url('Debe ser una URL válida').optional(),
  id_responsable: z.number().int().positive('El ID del responsable debe ser un número positivo').optional(),
  status: z.enum(statusValues).optional().default('EN PLANEACION')
});

// Esquema para creación con validación adicional de fechas
const testingCardCreateSchema = testingCardBaseSchema.refine(
  data => !data.dia_fin || !data.dia_inicio || data.dia_fin >= data.dia_inicio,
  {
    message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
    path: ['dia_fin']
  }
);

// Esquema para actualización (todos los campos opcionales)
const testingCardUpdateSchema = z.object({
  id_secuencia: z.number().int().positive().optional(),
  padre_id: z.number().int().positive().optional(),
  titulo: z.string().min(3).max(300).optional(),
  hipotesis: z.string().min(10).optional(),
  id_experimento_tipo: z.number().int().positive().optional(),
  descripcion: z.string().min(10).optional(),
  dia_inicio: z.coerce.date().optional(),
  dia_fin: z.coerce.date().optional(),
  anexo_url: z.string().url().optional(),
  id_responsable: z.number().int().positive().optional(),
  status: z.enum(statusValues).optional()
}).refine(
  data => !data.dia_fin || !data.dia_inicio || data.dia_fin >= data.dia_inicio,
  {
    message: 'La fecha de fin no puede ser anterior a la fecha de inicio',
    path: ['dia_fin']
  }
);

export { testingCardBaseSchema, testingCardCreateSchema, testingCardUpdateSchema };