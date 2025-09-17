// src/middlewares/validation/agenteCategoriaSchema.js
import { z } from 'zod';

// Esquema base para crear relación agente-categoría
const agenteCategoriaCreateSchema = z.object({
  id_agente: z.number()
    .int('El ID del agente debe ser un número entero')
    .positive('El ID del agente debe ser positivo'),
  id_categoria: z.number()
    .int('El ID de la categoría debe ser un número entero')
    .positive('El ID de la categoría debe ser positivo'),
  es_principal: z.boolean()
    .optional()
});

// Esquema para actualización (solo es_principal puede actualizarse)
const agenteCategoriaUpdateSchema = z.object({
  es_principal: z.boolean()
    .optional()
});

// Esquema para obtener por IDs compuestos
const agenteCategoriaKeySchema = z.object({
  id_agente: z.number()
    .int('El ID del agente debe ser un número entero')
    .positive('El ID del agente debe ser positivo'),
  id_categoria: z.number()
    .int('El ID de la categoría debe ser un número entero')
    .positive('El ID de la categoría debe ser positivo')
});

export { agenteCategoriaCreateSchema, agenteCategoriaUpdateSchema, agenteCategoriaKeySchema };
