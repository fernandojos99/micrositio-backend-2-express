// src/config/archivos.js
//
// Almacenamiento de archivos en disco. Sustituye a Supabase Storage.
//
// Estructura: <ARCHIVOS_DIR>/<bucket>/<ruta>, servida por express.static en
// /archivos. La URL pública conserva la forma .../<bucket>/<carpeta>/<archivo>
// porque los servicios de documentos recuperan la ruta del archivo a partir de
// los dos últimos segmentos de su URL.
//
// Ojo al desplegar: en Lambda y en Render el disco no es persistente. Ahí hace
// falta un disco persistente montado en ARCHIVOS_DIR.

import './entorno.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raizPaquete = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const DIRECTORIO = path.resolve(process.env.ARCHIVOS_DIR || path.join(raizPaquete, 'uploads'));
export const PREFIJO_URL = '/archivos';

const BUCKET_VALIDO = /^[a-z0-9][a-z0-9-]*$/i;

function urlBase() {
  const base = process.env.ARCHIVOS_URL_BASE || `http://localhost:${process.env.PORT || 3000}`;
  return base.replace(/\/+$/, '');
}

// Resuelve bucket/ruta dentro de DIRECTORIO y rechaza cualquier ruta que se
// salga de su bucket (".." o rutas absolutas): parte de la ruta procede del
// nombre del archivo que sube el usuario.
function resolver(bucket, ruta) {
  if (!BUCKET_VALIDO.test(bucket)) {
    throw new Error(`Bucket no válido: ${bucket}`);
  }
  const raizBucket = path.join(DIRECTORIO, bucket);
  const destino = path.resolve(raizBucket, ruta);
  if (!destino.startsWith(raizBucket + path.sep)) {
    throw new Error(`Ruta de archivo no válida: ${bucket}/${ruta}`);
  }
  return destino;
}

/**
 * Guarda un archivo. Por defecto falla si ya existe, igual que upload() de
 * Supabase con `upsert: false`.
 */
export async function subir(bucket, ruta, contenido, { sobrescribir = false } = {}) {
  const destino = resolver(bucket, ruta);
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, contenido, { flag: sobrescribir ? 'w' : 'wx' });
  return { ruta };
}

/** URL pública del archivo, servida por el propio backend. */
export function urlPublica(bucket, ruta) {
  resolver(bucket, ruta);
  const segmentos = [bucket, ...ruta.split('/')].map(encodeURIComponent);
  return `${urlBase()}${PREFIJO_URL}/${segmentos.join('/')}`;
}

/** Borra los archivos indicados. Si alguno ya no existía, no es un error. */
export async function borrar(bucket, rutas) {
  for (const ruta of rutas) {
    try {
      await fs.unlink(resolver(bucket, ruta));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

export default { DIRECTORIO, PREFIJO_URL, subir, urlPublica, borrar };
