import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizarOperador, aNumero, evaluarMetrica, resumirMetricas } from '../metricas.js';

test('normalizarOperador acepta los operadores que hay en la base', () => {
  for (const op of ['>=', '>', '=', '<=', '<']) assert.equal(normalizarOperador(op), op);
  assert.equal(normalizarOperador('≥'), '>=', 'el símbolo unicode que aparece en una fila real');
  assert.equal(normalizarOperador('≤'), '<=');
  assert.equal(normalizarOperador('  >=  '), '>=', 'con espacios alrededor');
  assert.equal(normalizarOperador('=='), '=');
  assert.equal(normalizarOperador('aprox'), null);
  assert.equal(normalizarOperador(''), null);
  assert.equal(normalizarOperador(undefined), null);
});

test('aNumero entiende los formatos reales de criterio y resultado', () => {
  assert.equal(aNumero('4'), 4);
  assert.equal(aNumero('33'), 33);
  assert.equal(aNumero('50%'), 50, 'el porcentaje se compara como número');
  assert.equal(aNumero('30K'), 30000);
  assert.equal(aNumero('1.2M'), 1200000);
  assert.equal(aNumero('1,5'), 1.5, 'coma decimal');
  assert.equal(aNumero('1,200'), 1200, 'coma de millares');
  assert.equal(aNumero(' 8 '), 8);
  assert.equal(aNumero('$500'), 500);
  assert.equal(aNumero(0), 0);
  assert.equal(aNumero('0'), 0, 'el cero es un resultado válido, no ausencia de dato');
});

test('aNumero devuelve null cuando no hay un número claro', () => {
  for (const valor of ['', '   ', 'muchos', 'más de 10', null, undefined, 'N/A', '10-20']) {
    assert.equal(aNumero(valor), null, `${JSON.stringify(valor)} no es evaluable`);
  }
});

test('evaluarMetrica: casos tomados de la base', () => {
  assert.equal(evaluarMetrica({ operador: '>=', criterio: '50%', resultado: '33' }), 'no_cumplida');
  assert.equal(evaluarMetrica({ operador: '>', criterio: '30K', resultado: '0' }), 'no_cumplida');
  assert.equal(evaluarMetrica({ operador: '>=', criterio: '8', resultado: '0' }), 'no_cumplida');
  assert.equal(evaluarMetrica({ operador: '>=', criterio: '8', resultado: '9' }), 'cumplida');
  assert.equal(evaluarMetrica({ operador: '≥', criterio: '4', resultado: '4' }), 'cumplida');
  assert.equal(evaluarMetrica({ operador: '=', criterio: '10', resultado: '10' }), 'cumplida');
  assert.equal(evaluarMetrica({ operador: '<', criterio: '5', resultado: '3' }), 'cumplida');
});

test('evaluarMetrica: sin resultado no es incumplimiento, es que no se ha medido', () => {
  assert.equal(evaluarMetrica({ operador: '>=', criterio: '50%', resultado: null }), 'no_evaluable');
  assert.equal(evaluarMetrica({ operador: '>=', criterio: '50%', resultado: '' }), 'no_evaluable');
  assert.equal(evaluarMetrica({ operador: '>=', criterio: 'la mayoría', resultado: '33' }), 'no_evaluable');
  assert.equal(evaluarMetrica({ operador: 'sube', criterio: '10', resultado: '20' }), 'no_evaluable');
  assert.equal(evaluarMetrica(null), 'no_evaluable');
  assert.equal(evaluarMetrica({}), 'no_evaluable');
});

test('resumirMetricas cuenta cumplidas, no cumplidas y no evaluables', () => {
  const resumen = resumirMetricas([
    { operador: '>=', criterio: '8', resultado: '9' },
    { operador: '>=', criterio: '8', resultado: '2' },
    { operador: '>=', criterio: '8', resultado: null },
    { operador: 'raro', criterio: '8', resultado: '9' },
  ]);

  assert.deepEqual(resumen, { total: 4, medidas: 2, cumplidas: 1, no_cumplidas: 1, no_evaluables: 2 });
  assert.deepEqual(resumirMetricas(), { total: 0, medidas: 0, cumplidas: 0, no_cumplidas: 0, no_evaluables: 0 });
});
