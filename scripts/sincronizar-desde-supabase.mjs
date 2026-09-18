// Trae de producción (Supabase, solo lectura por su API REST) lo que le falta a
// la base de DATABASE_URL:
//   - filas que no existen en local (por clave primaria)
//   - celdas que en local están vacías (NULL) y en producción tienen valor
//   - con --conflictos=prod, además, las celdas donde ambos tienen valor y
//     difieren (gana producción)
//
//   node scripts/sincronizar-desde-supabase.mjs                 # simulacro: todo y ROLLBACK
//   node scripts/sincronizar-desde-supabase.mjs --aplicar       # COMMIT
//   opciones: --conflictos=prod   --tablas=t1,t2
//
// Nunca borra filas locales: las que solo existen aquí se quedan. Solo
// sincroniza tablas que ya existen en local (las que falten, créalas antes;
// ver local/completar-esquema.sql) y columnas que existen en ambos lados.
// Las URLs de archivos ya migradas a /archivos no se sustituyen por las de
// Supabase Storage; las filas nuevas que traigan URLs de Storage se migran
// después con scripts/migrar-archivos-supabase.mjs --aplicar.
//
// Una celda o fila que la base local rechace (un CHECK más estricto, un
// UNIQUE) se reporta como FALLIDA y el resto sigue. Todo va en una sola
// transacción: con --aplicar entra todo lo demás, o nada si algo revienta.
//
// Credenciales de producción: src/.env.supabase (SUPABASE_URL, SUPABASE_KEY).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import '../src/config/entorno.js';
import pg from 'pg';

const args = process.argv.slice(2);
const aplicar = args.includes('--aplicar');
const ganaProd = args.includes('--conflictos=prod');
const soloTablas = args.find((a) => a.startsWith('--tablas='))?.slice(9).split(',');
// Filas por petición a Supabase. Se reduce sola si la consulta se pasa de
// tiempo, pero con tablas de blobs conviene empezar ya pequeño (--pagina=50).
const paginaInicial = Number(args.find((a) => a.startsWith('--pagina='))?.slice(9)) || 1000;

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const env = Object.fromEntries(fs.readFileSync(path.join(raiz, 'src/.env.supabase'), 'utf8').split('\n')
  .map((l) => l.match(/^([A-Z_]+)=(.*)$/)).filter(Boolean).map(([, k, v]) => [k, v.trim().replace(/^["']|["']$/g, '')]));
if (!env.SUPABASE_URL || !env.SUPABASE_KEY) throw new Error('src/.env.supabase debe definir SUPABASE_URL y SUPABASE_KEY');
const H = { apikey: env.SUPABASE_KEY, Authorization: `Bearer ${env.SUPABASE_KEY}` };

const q = (s) => `"${s.replace(/"/g, '""')}"`;
const ES_TS = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}:\d{2}|Z)?$/;
const igual = (a, b) => (typeof a === 'string' && typeof b === 'string' && ES_TS.test(a) && ES_TS.test(b)
  ? Date.parse(a) === Date.parse(b) : JSON.stringify(a) === JSON.stringify(b));
const URL_STORAGE = /\/storage\/v1\/object\/public\//;
const protegida = (local, prod) => typeof local === 'string' && local.includes('/archivos/')
  && typeof prod === 'string' && URL_STORAGE.test(prod);

// Páginas de producción. Si Supabase corta la consulta por tiempo (57014, pasa
// con las tablas de blobs), se reduce el tamaño de página; y si aun así corta
// (es intermitente), se reintenta con espera creciente antes de rendirse.
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
async function* paginasProd(tabla, orden) {
  let limite = paginaInicial;
  let reintentos = 0;
  for (let desde = 0; ;) {
    const url = `${env.SUPABASE_URL}/rest/v1/${tabla}?select=*&order=${orden.join(',')}&offset=${desde}&limit=${limite}`;
    let fallo;
    try {
      const r = await fetch(url, { headers: H, signal: AbortSignal.timeout(180_000) });
      if (r.ok) {
        const lote = await r.json();
        reintentos = 0;
        yield lote;
        if (lote.length < limite) return;
        desde += lote.length;
        continue;
      }
      fallo = `HTTP ${r.status}: ${(await r.text()).slice(0, 150)}`;
      if (fallo.includes('57014') && limite > 10) { limite = Math.max(10, Math.floor(limite / 4)); continue; }
      if (r.status < 500 && r.status !== 429) throw new Error(`${tabla}: ${fallo}`);
    } catch (e) {
      if (e.message.startsWith(`${tabla}:`)) throw e;
      fallo = e.message;
    }
    if (++reintentos > 6) throw new Error(`${tabla} (offset ${desde}): ${fallo}`);
    console.error(`  ${tabla} offset ${desde}: ${fallo.slice(0, 80)} — reintento ${reintentos}/6`);
    await esperar(5_000 * reintentos);
  }
}

const bd = new pg.Client({ connectionString: process.env.DATABASE_URL });
await bd.connect();
const filasDe = async (sql, params) => (await bd.query(sql, params)).rows;

// --- Metadatos locales -------------------------------------------------------
const tablas = (await filasDe(`
  SELECT c.relname AS tabla, pg_get_userbyid(c.relowner) = current_user AS propia,
    (SELECT json_agg(a.attname ORDER BY k.ord) FROM unnest(i.indkey) WITH ORDINALITY k(attnum, ord)
       JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = k.attnum) AS pk,
    (SELECT json_agg(attname ORDER BY attnum) FROM pg_attribute
       WHERE attrelid = c.oid AND attnum > 0 AND NOT attisdropped AND attgenerated = '') AS columnas,
    EXISTS (SELECT 1 FROM pg_trigger t WHERE t.tgrelid = c.oid AND NOT t.tgisinternal) AS con_triggers
  FROM pg_class c JOIN pg_index i ON i.indrelid = c.oid AND i.indisprimary
  WHERE c.relnamespace = 'public'::regnamespace AND c.relkind = 'r' ORDER BY 1`))
  .filter((t) => !soloTablas || soloTablas.includes(t.tabla));

// Orden por dependencias (madres antes que hijas). Los ciclos (secuencia <->
// testing_card, testing_card -> testing_card) los resuelven los reintentos.
const fks = await filasDe(`SELECT conrelid::regclass::text AS hija, confrelid::regclass::text AS madre
  FROM pg_constraint WHERE contype = 'f' AND connamespace = 'public'::regnamespace`);
const orden = [];
const visitar = (t, camino = new Set()) => {
  if (orden.includes(t) || camino.has(t)) return;
  camino.add(t);
  for (const { madre } of fks.filter((f) => f.hija === t && f.madre !== t)) visitar(madre, camino);
  orden.push(t);
};
tablas.forEach((t) => visitar(t.tabla));
tablas.sort((a, b) => orden.indexOf(a.tabla) - orden.indexOf(b.tabla));

// --- Escrituras --------------------------------------------------------------
let nSp = 0;
async function intentar(sql, params) {
  const sp = `sp${nSp++}`;
  await bd.query(`SAVEPOINT ${sp}`);
  try { await bd.query(sql, params); await bd.query(`RELEASE SAVEPOINT ${sp}`); return null; }
  catch (e) { await bd.query(`ROLLBACK TO SAVEPOINT ${sp}`); return e; }
}
const idDe = (t, fila) => t.pk.map((c) => fila[c]).join('/');

function insertar(t, fila) {
  const cols = t.columnas.filter((c) => c in fila).map(q).join(', ');
  return intentar(
    `INSERT INTO ${q(t.tabla)} (${cols}) OVERRIDING SYSTEM VALUE SELECT ${cols} FROM json_populate_record(NULL::${q(t.tabla)}, $1::json)`,
    [JSON.stringify(fila)]);
}

// Una celda por sentencia: si la base local rechaza una (un CHECK más
// estricto), las demás de la misma fila entran igual.
function actualizar(t, fila, cols) {
  const set = cols.map((c) => `${q(c)} = r.${q(c)}`).join(', ');
  const where = t.pk.map((c) => `x.${q(c)} = r.${q(c)}`).join(' AND ');
  return intentar(
    `UPDATE ${q(t.tabla)} AS x SET ${set} FROM json_populate_record(NULL::${q(t.tabla)}, $1::json) r WHERE ${where}`,
    [JSON.stringify(fila)]);
}

const informe = {};
await bd.query('BEGIN');
try {
  // Los triggers de updated_at pisarían las fechas de producción
  for (const t of tablas.filter((x) => x.con_triggers && x.propia)) await bd.query(`ALTER TABLE ${q(t.tabla)} DISABLE TRIGGER USER`);

  let diferidas = []; // inserciones cuya fila madre aún no existe (23503)

  for (const t of tablas) {
    const inf = informe[t.tabla] = { prod: 0, insertadas: 0, fallidas: [], rellenadas: 0, conflictos: 0, conflictosAplicados: 0, protegidas: 0 };
    const local = (await filasDe(`SELECT coalesce(json_agg(x), '[]'::json) AS f FROM ${q(t.tabla)} x`))[0].f;
    const clave = (f) => JSON.stringify(t.pk.map((c) => f[c]));
    const mapa = new Map(local.map((f) => [clave(f), f]));
    const conUpdatedAt = t.columnas.includes('updated_at');

    for await (const lote of paginasProd(t.tabla, t.pk)) {
      inf.prod += lote.length;
      for (const fila of lote) {
        const l = mapa.get(clave(fila));
        if (!l) {
          const e = await insertar(t, fila);
          if (!e) inf.insertadas++;
          else if (e.code === '23503') diferidas.push({ t, fila, e });
          else inf.fallidas.push(`${idDe(t, fila)}: ${e.message}`);
          continue;
        }
        const cambios = [];
        for (const c of t.columnas) {
          if (!(c in fila) || c === 'updated_at' || t.pk.includes(c) || igual(fila[c], l[c])) continue;
          if (l[c] === null) { cambios.push([c, 'relleno']); continue; }
          if (protegida(l[c], fila[c])) { inf.protegidas++; continue; }
          inf.conflictos++;
          if (ganaProd && fila[c] !== null) cambios.push([c, 'conflicto']);
        }
        let aplicada = false;
        for (const [c, tipo] of cambios) {
          const e = await actualizar(t, fila, [c]);
          if (e) { inf.fallidas.push(`${idDe(t, fila)} ${c} = ${JSON.stringify(fila[c])}: ${e.message}`); continue; }
          aplicada = true;
          if (tipo === 'relleno') inf.rellenadas++; else inf.conflictosAplicados++;
        }
        // updated_at viaja con la edición, para que quede la de producción
        if (aplicada && conUpdatedAt && 'updated_at' in fila) await actualizar(t, fila, ['updated_at']);
      }
    }
  }

  // Reintentos de las diferidas hasta que una pasada no avance
  while (diferidas.length) {
    const siguiente = [];
    for (const d of diferidas) {
      const e = await insertar(d.t, d.fila);
      if (!e) informe[d.t.tabla].insertadas++;
      else siguiente.push({ ...d, e });
    }
    if (siguiente.length === diferidas.length) {
      for (const d of siguiente) informe[d.t.tabla].fallidas.push(`${idDe(d.t, d.fila)}: ${d.e.message}`);
      break;
    }
    diferidas = siguiente;
  }

  for (const t of tablas.filter((x) => x.con_triggers && x.propia)) await bd.query(`ALTER TABLE ${q(t.tabla)} ENABLE TRIGGER USER`);

  // Secuencias e identidades: que el próximo id no choque con los insertados
  for (const t of tablas) {
    for (const c of t.columnas) {
      const [{ seq }] = await filasDe('SELECT pg_get_serial_sequence($1, $2) AS seq', [`public.${q(t.tabla)}`, c]);
      if (!seq) continue;
      const [{ max }] = await filasDe(`SELECT max(${q(c)})::bigint AS max FROM ${q(t.tabla)}`);
      const [{ last_value: actual, is_called: usada }] = await filasDe(`SELECT last_value, is_called FROM ${seq}`);
      if (max !== null && (BigInt(max) > BigInt(actual) || (BigInt(max) === BigInt(actual) && !usada))) {
        await bd.query('SELECT setval($1, $2, true)', [seq, max]);
      }
    }
  }

  await bd.query(aplicar ? 'COMMIT' : 'ROLLBACK');
} catch (e) {
  await bd.query('ROLLBACK').catch(() => {});
  await bd.end();
  console.error(`\nNada se aplicó (ROLLBACK): ${e.message}`);
  process.exit(2);
}
await bd.end();

// --- Informe -----------------------------------------------------------------
let totalFallidas = 0;
console.log(`${aplicar ? 'APLICADO' : 'SIMULACRO (ROLLBACK)'} — conflictos: ${ganaProd ? 'gana producción' : 'se conserva local'}\n`);
for (const [tabla, i] of Object.entries(informe)) {
  const partes = [];
  if (i.insertadas) partes.push(`+${i.insertadas} filas`);
  if (i.rellenadas) partes.push(`${i.rellenadas} celdas rellenadas`);
  if (i.conflictos) partes.push(`${i.conflictos} celdas en conflicto (${i.conflictosAplicados} con el valor de producción)`);
  if (i.protegidas) partes.push(`${i.protegidas} URLs de /archivos conservadas`);
  if (i.fallidas.length) partes.push(`${i.fallidas.length} FALLIDAS`);
  console.log(`${tabla.padEnd(26)} prod ${String(i.prod).padStart(5)}  ${partes.join(', ') || 'al día'}`);
  for (const f of i.fallidas) console.log(`    ✗ ${f}`);
  totalFallidas += i.fallidas.length;
}
if (aplicar) console.log('\nSi entraron filas con URLs de Supabase Storage: node scripts/migrar-archivos-supabase.mjs --aplicar');
process.exit(totalFallidas ? 1 : 0);
