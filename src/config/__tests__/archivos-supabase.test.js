import test from 'node:test';
import assert from 'node:assert/strict';

// Modo Supabase Storage: fetch simulado, sin red ni base. El destino se decide
// al cargar el módulo, así que las variables van antes del import.
process.env.SUPABASE_URL = 'https://proyecto.supabase.test/';
process.env.SUPABASE_SERVICE_KEY = 'clave-servicio';
const llamadas = [];
let respuesta = () => new Response('{}', { status: 200 });
globalThis.fetch = async (url, opciones) => {
  llamadas.push({ url, ...opciones });
  return respuesta();
};
const archivos = await import('../archivos.js');

test.beforeEach(() => {
  llamadas.length = 0;
  respuesta = () => new Response('{}', { status: 200 });
});

test('con SUPABASE_URL y SUPABASE_SERVICE_KEY el destino es Supabase', () => {
  assert.equal(archivos.DESTINO, 'supabase');
});

test('subir() hace POST al objeto, con tipo y sin upsert por defecto', async () => {
  await archivos.subir('formato-docs', 'formatos/x y.pdf', Buffer.from('a'), { contentType: 'application/pdf' });
  const [l] = llamadas;
  assert.equal(l.method, 'POST');
  assert.equal(l.url, 'https://proyecto.supabase.test/storage/v1/object/formato-docs/formatos/x%20y.pdf');
  assert.equal(l.headers.Authorization, 'Bearer clave-servicio');
  assert.equal(l.headers['content-type'], 'application/pdf');
  assert.equal(l.headers['x-upsert'], 'false');

  await archivos.subir('image', 'a.png', Buffer.from('a'), { sobrescribir: true });
  assert.equal(llamadas[1].headers['x-upsert'], 'true');
});

test('subir() de un archivo que ya existe falla con code EEXIST, como en disco', async () => {
  respuesta = () => new Response('{"statusCode":"409","error":"Duplicate"}', { status: 400 });
  await assert.rejects(archivos.subir('image', 'dup.png', Buffer.from('1')), { code: 'EEXIST' });
});

test('urlPublica() apunta a Storage y conserva /<bucket>/<carpeta>/<archivo> al final', () => {
  const url = archivos.urlPublica('formato-docs', 'formatos/x y.pdf');
  assert.equal(url, 'https://proyecto.supabase.test/storage/v1/object/public/formato-docs/formatos/x%20y.pdf');
  const ruta = new URL(url).pathname.split('/').slice(-2).map(decodeURIComponent).join('/');
  assert.equal(ruta, 'formatos/x y.pdf');
});

test('borrar() manda un DELETE con los prefijos, y nada si no hay rutas', async () => {
  await archivos.borrar('testing-card-docs', ['testing-cards/a.pdf']);
  const [l] = llamadas;
  assert.equal(l.method, 'DELETE');
  assert.equal(l.url, 'https://proyecto.supabase.test/storage/v1/object/testing-card-docs');
  assert.deepEqual(JSON.parse(l.body), { prefixes: ['testing-cards/a.pdf'] });

  await archivos.borrar('testing-card-docs', []);
  assert.equal(llamadas.length, 1);
});

test('rechaza rutas que se salen del bucket sin llamar a Storage', async () => {
  await assert.rejects(archivos.subir('image', '../fuera.txt', Buffer.from('x')), /no válida/);
  await assert.rejects(archivos.borrar('image', ['../../x']), /no válida/);
  assert.equal(llamadas.length, 0);
});
