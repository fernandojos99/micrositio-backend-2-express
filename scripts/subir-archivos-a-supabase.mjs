// Sube a Supabase Storage los archivos que la base referencia en /archivos
// (disco local) y reescribe sus URLs para que apunten a Storage. Es el camino
// inverso de migrar-archivos-supabase.mjs: sirve para llevar una base local a
// un proyecto de Supabase.
//
//   node scripts/subir-archivos-a-supabase.mjs            # solo lista qué haría
//   node scripts/subir-archivos-a-supabase.mjs --aplicar  # sube y reescribe
//
// Las variables del destino van en el entorno, que dotenv no pisa:
//   DATABASE_URL          la base del proyecto de Supabase (no la local)
//   SUPABASE_URL          https://<proyecto>.supabase.co
//   SUPABASE_SERVICE_KEY  clave service_role
// Los archivos se leen de ARCHIVOS_DIR (por defecto <paquete>/uploads).
//
// Crea como públicos los buckets que falten. Se puede repetir: una URL ya
// reescrita deja de coincidir con el patrón, y la subida sobrescribe. Si falta
// un archivo en disco o falla una subida, esa URL se deja como está y el script
// sale con código 1.

import fs from 'node:fs/promises';
import path from 'node:path';
import { consulta, ejecutar, cerrar } from '../src/config/db.js';
import archivos from '../src/config/archivos.js';

const aplicar = process.argv.includes('--aplicar');
const PATRON = /^https?:\/\/[^/]+\/archivos\/([^/]+)\/(.+)$/;
const ident = (s) => `"${s.replace(/"/g, '""')}"`;
const TIPOS = {
  pdf: 'application/pdf',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
};

if (archivos.DESTINO !== 'supabase') {
  console.error('Faltan SUPABASE_URL y SUPABASE_SERVICE_KEY en el entorno.');
  process.exit(1);
}
const SUPABASE_URL = process.env.SUPABASE_URL.replace(/\/+$/, '');
const cabeceras = {
  Authorization: `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
  apikey: process.env.SUPABASE_SERVICE_KEY,
};

const columnas = await consulta(`
  SELECT c.table_name, c.column_name
  FROM information_schema.columns c
  JOIN information_schema.tables t USING (table_schema, table_name)
  WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
    AND c.data_type IN ('text', 'character varying')
  ORDER BY 1, 2`);

// Primero se reúnen las URLs, para crear los buckets antes de subir.
const pendientes = [];
for (const { table_name: tabla, column_name: col } of columnas) {
  const filas = await consulta(
    `SELECT DISTINCT ${ident(col)} AS url FROM ${ident(tabla)} WHERE ${ident(col)} LIKE '%/archivos/%'`);
  for (const { url } of filas) {
    const m = url.match(PATRON);
    if (!m) {
      console.log(`? ${tabla}.${col}: no se reconoce como URL de /archivos, se deja: ${url}`);
      continue;
    }
    const bucket = decodeURIComponent(m[1]);
    const ruta = m[2].split('?')[0].split('/').map(decodeURIComponent).join('/');
    pendientes.push({ tabla, col, url, bucket, ruta });
  }
}

const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, { headers: cabeceras });
if (!res.ok) throw new Error(`No se pudieron listar los buckets: HTTP ${res.status} ${await res.text()}`);
const existentes = new Set((await res.json()).map((b) => b.id));
const faltan = [...new Set(pendientes.map((p) => p.bucket))].filter((b) => !existentes.has(b));

for (const bucket of faltan) {
  if (!aplicar) {
    console.log(`+ bucket público ${bucket}`);
    continue;
  }
  const r = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: 'POST',
    headers: { ...cabeceras, 'content-type': 'application/json' },
    body: JSON.stringify({ id: bucket, name: bucket, public: true }),
  });
  if (!r.ok) throw new Error(`No se pudo crear el bucket ${bucket}: HTTP ${r.status} ${await r.text()}`);
  console.log(`+ bucket público ${bucket}`);
}

let fallos = 0;
let migradas = 0;

for (const { tabla, col, url, bucket, ruta } of pendientes) {
  const nueva = archivos.urlPublica(bucket, ruta);
  const local = path.join(archivos.DIRECTORIO, bucket, ruta);

  if (!aplicar) {
    console.log(`· ${tabla}.${col}\n    ${url}\n  → ${nueva}`);
    continue;
  }

  try {
    const contenido = await fs.readFile(local);
    const extension = path.extname(ruta).slice(1).toLowerCase();
    await archivos.subir(bucket, ruta, contenido, {
      sobrescribir: true,
      contentType: TIPOS[extension] || 'application/octet-stream',
    });
    const n = await ejecutar(`UPDATE ${ident(tabla)} SET ${ident(col)} = $1 WHERE ${ident(col)} = $2`, [nueva, url]);
    migradas++;
    console.log(`✓ ${tabla}.${col} (${n} fila${n === 1 ? '' : 's'}): ${bucket}/${ruta}`);
  } catch (error) {
    fallos++;
    console.error(`✗ ${tabla}.${col}: ${url}\n    ${error.message}`);
  }
}

console.log(aplicar
  ? `\nMigradas: ${migradas}. Fallidas: ${fallos}.`
  : `\n${pendientes.length} URLs. Nada cambió. Ejecuta con --aplicar para subir y reescribir.`);
await cerrar();
process.exit(fallos > 0 ? 1 : 0);
