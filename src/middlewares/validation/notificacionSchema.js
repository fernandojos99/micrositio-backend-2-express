// src/middlewares/validation/notificacionSchema.js
/**
 * Esquemas de validación para notificaciones usando Zod.
 * @module middlewares/validation/notificacionSchema
 */

import { z } from 'zod';

/**
 * Esquema para la notificación del siguiente responsable.
 */
const notificacionSiguienteResponsableSchema = z.object({
  id_empleado: z.number()
    .int()
    .positive('El ID de empleado debe ser un número positivo'),
  id_learning_card: z.number()
    .int()
    .positive('El ID de learning card debe ser un número positivo'),
  id_empleado_remitente: z.number()
    .int()
    .positive('El ID de empleado remitente debe ser un número positivo')
});

export { notificacionSiguienteResponsableSchema };
