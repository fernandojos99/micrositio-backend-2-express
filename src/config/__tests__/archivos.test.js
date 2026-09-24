import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

// Directorio temporal propio: estas pruebas no tocan uploads/ ni la base, así
// que corren en `npm test` y en el CI.
const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'archivos-'));
process.env.ARCHIVOS_DIR = dir;
process.env.ARCHIVOS_URL_BASE = 'http://backend.test/';
const archivos = await import('../archivos.js');

test.after(() => fs.rm(dir, { recursive: true, force: true }));

test('subir() guarda el contenido en <dir>/<bucket>/<ruta>', async () => {
  await archivos.subir('testing-card-docs', 'testing-cards/a.txt', Buffer.from('hola'));
  const leido = await fs.readFile(path.join(dir, 'testing-card-docs', 'testing-cards', 'a.txt'), 'utf8');
  assert.equal(leido, 'hola');
});

test('subir() no sobrescribe por defecto, igual que Supabase con upsert: false', async () => {
  await archivos.subir('image', 'dup.png', Buffer.from('1'));
  await assert.rejects(archivos.subir('image', 'dup.png', Buffer.from('2')), { code: 'EEXIST' });
  await archivos.subir('image', 'dup.png', Buffer.from('3'), { sobrescribir: true });
  assert.equal(await fs.readFile(path.join(dir, 'image', 'dup.png'), 'utf8'), '3');
});

test('urlPublica() conserva /<bucket>/<carpeta>/<archivo> al final', () => {
  const url = archivos.urlPublica('formato-docs', 'formatos/x y.pdf');
  assert.equal(url, 'http://backend.test/archivos/formato-docs/formatos/x%20y.pdf');
  // Los servicios de documentos recuperan la ruta con los dos últimos segmentos.
  const ruta = new URL(url).pathname.split('/').slice(-2).map(decodeURIComponent).join('/');
  assert.equal(ruta, 'formatos/x y.pdf');
});

test('borrar() elimina el archivo y no falla si ya no existía', async () => {
  await archivos.subir('formato-docs', 'formatos/b.pdf', Buffer.from('x'));
  await archivos.borrar('formato-docs', ['formatos/b.pdf']);
  await assert.rejects(fs.access(path.join(dir, 'formato-docs', 'formatos', 'b.pdf')));
  await archivos.borrar('formato-docs', ['formatos/b.pdf']);
});

test('rechaza rutas que se salen del bucket', async () => {
  await assert.rejects(archivos.subir('image', '../fuera.txt', Buffer.from('x')), /no válida/);
  await assert.rejects(archivos.subir('image', '/etc/passwd', Buffer.from('x')), /no válida/);
  await assert.rejects(archivos.subir('../otro', 'a.txt', Buffer.from('x')), /Bucket no válido/);
  assert.throws(() => archivos.urlPublica('image', '../../x'), /no válida/);
});
