import { z } from 'zod';

/**
 * Esquemas de /auth. authController era uno de los controllers que no
 * validaban nada: `login` hacía dos comprobaciones a mano y `registro` pasaba
 * `req.body` entero al servicio.
 */

export const loginSchema = z.object({
  alias: z.string().min(1, 'El alias es requerido').max(50, 'Alias demasiado largo'),
  password: z.string().min(1, 'La contraseña es requerida').max(100, 'Contraseña demasiado larga'),
});

/**
 * Registro público.
 *
 * `tipo` NO se acepta desde el body a propósito: la ruta no lleva
 * authMiddleware, así que aceptarlo permitía a cualquiera darse de alta como
 * EDITOR mandando `"tipo": "EDITOR"`. El controller lo fija a VISITANTE, que
 * es lo que el propio front ya enviaba siempre. Para crear un EDITOR está
 * `POST /usuarios`, que sí exige sesión.
 */
export const registroSchema = z.object({
  alias: z.string()
    .min(3, 'El alias debe tener al menos 3 caracteres')
    .max(50, 'El alias no puede exceder los 50 caracteres')
    .regex(/^[a-zA-Z0-9_@.-]+$/, 'El alias solo puede contener letras, números, guiones y guiones bajos'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'La contraseña no puede exceder los 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número'),
});
