// src/middlewares/validation/usuarioSchema.js
/**
 * Módulo de esquemas de validación para usuarios usando Zod.
 * @module middlewares/validation/usuarioSchema
 */

import { z } from 'zod';

/**
 * Esquema para la creación de usuarios.
 */
const usuarioCreateSchema = z.object({
  alias: z.string()
    .min(3, 'El alias debe tener al menos 3 caracteres')
    .max(50, 'El alias no puede exceder los 50 caracteres')
    .regex(/^[a-zA-Z0-9_@-]+$/, 'El alias solo puede contener letras, números, guiones, guiones bajos y @'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder los 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
  tipo: z.enum(['EDITOR', 'VISITANTE'], {
    message: 'El tipo debe ser EDITOR o VISITANTE'
  }),
  id_empleado: z.number()
    .int()
    .positive('El ID del empleado debe ser un número positivo')
    .optional()
    .nullable(),
  activo: z.boolean()
    .optional()
    .default(true)
}).refine(
  data => {
    // Si es EDITOR, debe tener id_empleado
    if (data.tipo === 'EDITOR' && !data.id_empleado) {
      return false;
    }
    // Si es VISITANTE, no debe tener id_empleado
    if (data.tipo === 'VISITANTE' && data.id_empleado) {
      return false;
    }
    return true;
  },
  {
    message: 'Los usuarios EDITOR deben tener id_empleado y los VISITANTE no deben tenerlo',
    path: ['id_empleado']
  }
);

/**
 * Esquema para la actualización de usuarios.
 */
const usuarioUpdateSchema = z.object({
  alias: z.string()
    .min(3, 'El alias debe tener al menos 3 caracteres')
    .max(50, 'El alias no puede exceder los 50 caracteres')
    .regex(/^[a-zA-Z0-9_-]+$/, 'El alias solo puede contener letras, números, guiones y guiones bajos')
    .optional(),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder los 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número')
    .optional(),
  id_empleado: z.number()
    .int()
    .positive('El ID del empleado debe ser un número positivo')
    .optional()
    .nullable(),
  activo: z.boolean().optional()
}).refine(
  data => {
    // Solo validar la relación tipo-empleado si ambos campos están presentes
    if (data.tipo && data.hasOwnProperty('id_empleado')) {
      if (data.tipo === 'EDITOR' && !data.id_empleado) {
        return false;
      }
      if (data.tipo === 'VISITANTE' && data.id_empleado) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'Los usuarios EDITOR deben tener id_empleado y los VISITANTE no deben tenerlo',
    path: ['id_empleado']
  }
);

/**
 * Esquema para obtener usuario por ID (solo validación del UUID)
 */
const usuarioIdSchema = z.object({
  id_usuario: z.string()
    .uuid('El ID del usuario debe ser un UUID válido')
});

export { usuarioCreateSchema, usuarioUpdateSchema, usuarioIdSchema };
