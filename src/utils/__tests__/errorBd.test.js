import test from 'node:test';
import assert from 'node:assert/strict';
import ApiError from '../ApiError.js';
import { conMensaje } from '../errorBd.js';

test('devuelve el resultado si la consulta va bien', async () => {
  assert.deepEqual(await conMensaje('Error al obtener', Promise.resolve([1, 2])), [1, 2]);
});

test('envuelve un error de la base con el prefijo de siempre y status 500', async () => {
  const errorPg = Object.assign(new Error('llave duplicada viola restricción de unicidad'), { code: '23505' });
  await assert.rejects(conMensaje('Error al crear categoría', Promise.reject(errorPg)), (e) => {
    assert.ok(e instanceof ApiError);
    assert.equal(e.message, 'Error al crear categoría: llave duplicada viola restricción de unicidad');
    assert.equal(e.statusCode, 500);
    return true;
  });
});

test('respeta un status distinto si se pide', async () => {
  await assert.rejects(conMensaje('Error', Promise.reject(new Error('x')), 400), { statusCode: 400 });
});

test('un ApiError que ya viene de más abajo se relanza sin tocar', async () => {
  const original = new ApiError('Categoría no encontrada', 404);
  await assert.rejects(conMensaje('Error al obtener', Promise.reject(original)), (e) => e === original);
});

test('sin prefijo usa solo el mensaje del error', async () => {
  await assert.rejects(conMensaje(null, Promise.reject(new Error('fallo de la base'))),
    { message: 'fallo de la base', statusCode: 500 });
});
