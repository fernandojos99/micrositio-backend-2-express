// src/config/archivos.js
//
// Almacenamiento de archivos, con dos destinos:
//
// - Supabase Storage, si están definidas SUPABASE_URL y SUPABASE_SERVICE_KEY
//   (producción: en Vercel o Lambda el disco no es persistente). Se habla con
//   su API REST por fetch, sin supabase-js. Los buckets deben existir y ser
//   públicos (scripts/subir-archivos-a-supabase.mjs los crea).
// - Disco, si no (desarrollo): <ARCHIVOS_DIR>/<bucket>/<ruta>, servida por
//   express.static en /archivos.
//
// En los dos casos la URL pública termina en .../<bucket>/<carpeta>/<archivo>,
// porque los servicios de documentos recuperan la ruta del archivo a partir de
// los dos últimos segmentos de su URL.

import './entorno.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raizPaquete = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

export const DIRECTORIO = path.resolve(process.env.ARCHIVOS_DIR || path.join(raizPaquete, 'uploads'));
export const PREFIJO_URL = '/archivos';

const BUCKET_VALIDO = /^[a-z0-9][a-z0-9-]*$/i;

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || '';
export const DESTINO = SUPABASE_URL && SUPABASE_SERVICE_KEY ? 'supabase' : 'disco';

const codificar = (bucket, ruta) => [bucket, ...ruta.split('/')].map(encodeURIComponent).join('/');

async function storage(metodo, ruta, { cuerpo, cabeceras = {} } = {}) {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/${ruta}`, {
    method: metodo,
    headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`, apikey: SUPABASE_SERVICE_KEY, ...cabeceras },
    body: cuerpo,
  });
  if (!res.ok) {
    const texto = await res.text();
    const error = new Error(`Supabase Storage ${metodo} ${ruta}: HTTP ${res.status} ${texto}`);
    // Mismo código que el disco cuando el archivo ya existe (upsert: false)
    if (res.status === 409 || /Duplicate|already exists/i.test(texto)) error.code = 'EEXIST';
    throw error;
  }
  return res;
}

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
export async function subir(bucket, ruta, contenido, { sobrescribir = false, contentType } = {}) {
  const destino = resolver(bucket, ruta);
  if (DESTINO === 'supabase') {
    await storage('POST', `object/${codificar(bucket, ruta)}`, {
      cuerpo: contenido,
      cabeceras: {
        'content-type': contentType || 'application/octet-stream',
        'x-upsert': sobrescribir ? 'true' : 'false',
      },
    });
    return { ruta };
  }
  await fs.mkdir(path.dirname(destino), { recursive: true });
  await fs.writeFile(destino, contenido, { flag: sobrescribir ? 'w' : 'wx' });
  return { ruta };
}

/** URL pública del archivo: la de Supabase Storage, o la del propio backend. */
export function urlPublica(bucket, ruta) {
  resolver(bucket, ruta);
  if (DESTINO === 'supabase') {
    return `${SUPABASE_URL}/storage/v1/object/public/${codificar(bucket, ruta)}`;
  }
  return `${urlBase()}${PREFIJO_URL}/${codificar(bucket, ruta)}`;
}

/** Borra los archivos indicados. Si alguno ya no existía, no es un error. */
export async function borrar(bucket, rutas) {
  if (DESTINO === 'supabase') {
    rutas.forEach((ruta) => resolver(bucket, ruta));
    if (rutas.length === 0) return;
    // Storage no falla por rutas que no existen: las omite.
    await storage('DELETE', `object/${encodeURIComponent(bucket)}`, {
      cuerpo: JSON.stringify({ prefixes: rutas }),
      cabeceras: { 'content-type': 'application/json' },
    });
    return;
  }
  for (const ruta of rutas) {
    try {
      await fs.unlink(resolver(bucket, ruta));
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }
}

export default { DIRECTORIO, PREFIJO_URL, DESTINO, subir, urlPublica, borrar };
