import test from 'node:test';
import assert from 'node:assert/strict';
import { leerId } from '../leerId.js';

/**
 * leerId es lo que permite que las rutas nuevas (ID en el path) y las viejas
 * (ID en el body o en la query) compartan controller. Si se rompe, se rompen
 * las dos a la vez y sin ruido, asi que conviene tenerlo cubierto.
 */

const req = (params = {}, body = {}, query = {}) => ({ params, body, query });

test('prefiere el path param sobre el body y la query', () => {
  const r = req({ id_proyecto: '1' }, { id_proyecto: 2 }, { id_proyecto: 3 });
  assert.equal(leerId(r, 'id_proyecto'), '1');
});

test('cae al body cuando no hay path param', () => {
  assert.equal(leerId(req({}, { id_proyecto: 2 }), 'id_proyecto'), 2);
});

test('cae a la query cuando no hay ni path param ni body', () => {
  assert.equal(leerId(req({}, {}, { padre_id: '7' }), 'padre_id'), '7');
});

test('respeta el orden de los nombres pasados', () => {
  const r = req({ id: '9' }, { id_empleado: 4 });
  assert.equal(leerId(r, 'id', 'id_empleado'), '9');
  assert.equal(leerId(req({}, { id_empleado: 4 }), 'id', 'id_empleado'), 4);
});

test('devuelve undefined si no hay nada', () => {
  assert.equal(leerId(req(), 'id_proyecto'), undefined);
});

test('ignora cadena vacia, null y undefined y sigue buscando', () => {
  assert.equal(leerId(req({ id: '' }, { id: 5 }), 'id'), 5);
  assert.equal(leerId(req({ id: null }, { id: 5 }), 'id'), 5);
});

test('acepta el cero como identificador valido', () => {
  assert.equal(leerId(req({ id: 0 }), 'id'), 0);
});

test('no revienta si falta req.body', () => {
  assert.equal(leerId({ params: { id: '3' } }, 'id'), '3');
});
