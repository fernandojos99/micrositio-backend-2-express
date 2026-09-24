// src/middlewares/validation/proyectoBriefSchema.js
/**
 * Esquemas de validación del brief de un proyecto.
 * @module middlewares/validation/proyectoBriefSchema
 */

import { z } from 'zod';

/** De dónde salió el brief: del texto pegado o de un .docx. */
export const ORIGENES = ['texto', 'docx'];

/**
 * Guardado del resultado de Ejecutar. Todo es opcional porque el .pptx puede
 * subirse sin haber ejecutado nunca, pero se exige al menos un campo para que
 * un PUT vacío no sobrescriba con nada.
 *
 * `resumen_estructurado` viene de la Lambda y su forma cambia, así que se
 * acepta libre y solo se limita su tamaño, para que nadie use la tabla como
 * almacén de archivos.
 */
/**
 * Texto que puede llegar como número.
 *
 * La Lambda devuelve el `id` del transcript como número, no como cadena, y el
 * tipo del front (`id?: string`) es solo una declaración de TypeScript, no una
 * garantía en ejecución. Exigir string aquí hacía fallar el guardado entero
 * con un 400 después de haber procesado el transcript.
 */
const textoONumero = (max, mensaje) =>
  z.union([z.string(), z.number()])
    .transform(v => String(v))
    .refine(v => v.length <= max, { message: mensaje });

const proyectoBriefUpdateSchema = z.object({
  nombre_proyecto: z.string().max(255, 'El nombre no puede exceder los 255 caracteres').nullish(),
  transcript_id: textoONumero(255, 'El id del transcript no puede exceder los 255 caracteres').nullish(),
  url: textoONumero(2000, 'La URL no puede exceder los 2000 caracteres').nullish(),
  resumen: z.string().nullish(),
  resumen_estructurado: z.any()
    .refine(d => d === null || d === undefined || JSON.stringify(d).length <= 500_000, {
      message: 'El resumen estructurado no puede exceder 500 KB'
    })
    .nullish(),
  origen: z.enum(ORIGENES, {
    message: `El origen debe ser uno de: ${ORIGENES.join(', ')}`
  }).nullish(),
  ejecutado_en: z.string().nullish()
}).refine(
  data => Object.keys(data).length > 0,
  { message: 'No hay nada que guardar' }
);

export { proyectoBriefUpdateSchema };
