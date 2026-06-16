import { z } from 'zod';

export const servicioCreateSchema = z.object({
  nombre: z.string().min(1),
  descripcion: z.string().min(1),
  objetivo: z.string().min(1),
  entregables: z.string().min(1),
  precio_aprox: z.number().positive(),
  horas_totales: z.number().positive(),
  categoria: z.string().min(1)
});

export const servicioUpdateSchema = z.object({
  id: z.number().int().positive().optional(),
  nombre: z.string().min(1).optional(),
  descripcion: z.string().min(1).optional(),
  objetivo: z.string().min(1).optional(),
  entregables: z.string().min(1).optional(),
  precio_aprox: z.number().positive().optional(),
  horas_totales: z.number().positive().optional(),
  categoria: z.string().min(1).optional()
}).refine(
  data =>
    Object.keys(data).filter(k => k !== 'id').length > 0,
  {
    message: 'Debe proporcionar al menos un campo para actualizar'
  }
);