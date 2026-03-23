import { z } from 'zod';

export const learningCardCreateSchema = z.object({
  id_secuencia: z.number().int().optional(),
  id_testing_card: z.number().int().positive('El ID de testing card debe ser un número positivo'),
  resultado: z.string().nullable().optional(),
  hallazgo: z.string().nullable().optional(),
  estado: z.string().optional(),
  id_responsable: z.number().int().positive('El ID del responsable debe ser un número positivo').optional()
});

export const learningCardUpdateSchema = z.object({
  id_learning_card: z.number().int().positive().optional(),
  resultado: z.string().nullable().optional(),
  hallazgo: z.string().nullable().optional(),
  estado: z.string().optional(),
  id_responsable: z.number().int().positive('El ID del responsable debe ser un número positivo').optional(),
}).refine(data => data.resultado !== undefined || data.hallazgo !== undefined || data.estado !== undefined, {
  message: 'Debe proporcionar al menos resultado, hallazgo o estado para actualizar'
});
