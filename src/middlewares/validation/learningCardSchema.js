import { z } from 'zod';

// Los 4 valores del CHECK real de learning_card.estado en Supabase. Antes esto
// era un z.string() sin restriccion: cualquier estado inventado pasaba la
// validacion y lo rechazaba la BD.
const estadoValues = ['ACEPTADA', 'RECHAZADA', 'REITERAR', 'MAL PLANTEADA'];

export const learningCardCreateSchema = z.object({
  // La tabla learning_card no tiene columna id_secuencia: cuelga de la testing
  // card. Aceptarla aqui solo servia para que PostgREST rechazara el insert.
  id_testing_card: z.number().int().positive('El ID de testing card debe ser un número positivo'),
  resultado: z.string().nullable().optional(),
  hallazgo: z.string().nullable().optional(),
  estado: z.enum(estadoValues).optional().default('ACEPTADA'),
  // Card propuesta por el plan de trabajo: no se ve hasta que se aprueba
  es_borrador: z.boolean().optional(),
  id_responsable: z.number().int().positive('El ID del responsable debe ser un número positivo').optional()
});

export const learningCardUpdateSchema = z.object({
  id_learning_card: z.number().int().positive().optional(),
  resultado: z.string().nullable().optional(),
  hallazgo: z.string().nullable().optional(),
  estado: z.enum(estadoValues).optional(),
  id_responsable: z.number().int().positive('El ID del responsable debe ser un número positivo').optional(),
}).refine(data => data.resultado !== undefined || data.hallazgo !== undefined || data.estado !== undefined, {
  message: 'Debe proporcionar al menos resultado, hallazgo o estado para actualizar'
});
