// src/utils/metricas.js
//
// Evalúa si una métrica se cumplió comparando su `resultado` contra su
// `criterio` con su `operador`.
//
// Los tres campos son texto libre: no hay CHECK ni validación que los obligue
// a ser numéricos. En la base conviven `>=` y `≥` para lo mismo, y los valores
// mezclan números pelados (`33`), porcentajes (`50%`) y abreviaturas (`30K`).
// Por eso la respuesta tiene tres estados y no dos: lo que no se puede
// comparar con certeza se marca como no evaluable, en vez de contarlo como
// incumplido y ensuciar el tablero.

/** Comparadores admitidos, ya normalizados. */
const COMPARADORES = {
  '>=': (a, b) => a >= b,
  '>': (a, b) => a > b,
  '<=': (a, b) => a <= b,
  '<': (a, b) => a < b,
  '=': (a, b) => a === b,
  '!=': (a, b) => a !== b,
};

/** Equivalencias de los símbolos que aparecen escritos de varias formas. */
const EQUIVALENCIAS = {
  '≥': '>=', '=>': '>=', '≤': '<=', '=<': '<=',
  '==': '=', '===': '=', '≠': '!=', '<>': '!=',
};

/**
 * Lleva un operador escrito a mano a uno de los comparadores conocidos.
 * @param {string} operador
 * @returns {string|null} El operador normalizado, o null si no se reconoce.
 */
export function normalizarOperador(operador) {
  if (typeof operador !== 'string') return null;
  const limpio = operador.trim();
  const equivalente = EQUIVALENCIAS[limpio] ?? limpio;
  return equivalente in COMPARADORES ? equivalente : null;
}

/**
 * Extrae el número de un texto de métrica. Admite el porcentaje y las
 * abreviaturas de miles y millones que hay en los datos (`50%`, `30K`, `1.2M`),
 * y la coma como separador decimal.
 * @param {string|number} texto
 * @returns {number|null} El número, o null si no hay uno claro.
 */
export function aNumero(texto) {
  if (typeof texto === 'number') return Number.isFinite(texto) ? texto : null;
  if (typeof texto !== 'string') return null;

  let limpio = texto.trim().replace(/\s/g, '').replace(/^[$€]/, '');
  if (limpio === '') return null;

  // Una coma sola es ambigua: en "1,5" es decimal y en "1,200" es de millares.
  // Se toma como decimal solo cuando deja una o dos cifras detrás; con tres
  // (el tamaño de un grupo de millares) se descarta. El punto, si ya está,
  // hace de decimal y entonces las comas solo pueden ser de millares.
  if (!limpio.includes('.') && /^[+-]?\d+,\d{1,2}$/.test(limpio)) {
    limpio = limpio.replace(',', '.');
  }
  limpio = limpio.replace(/,/g, '');

  let factor = 1;
  const porcentaje = limpio.endsWith('%');
  if (porcentaje) limpio = limpio.slice(0, -1);

  const sufijo = limpio.slice(-1).toLowerCase();
  if (sufijo === 'k') { factor = 1_000; limpio = limpio.slice(0, -1); }
  else if (sufijo === 'm') { factor = 1_000_000; limpio = limpio.slice(0, -1); }

  if (!/^[+-]?\d+(\.\d+)?$/.test(limpio)) return null;

  return Number(limpio) * factor;
}

/**
 * ¿Se cumplió la métrica?
 * @param {{operador?: string, criterio?: string, resultado?: string}} metrica
 * @returns {'cumplida'|'no_cumplida'|'no_evaluable'}
 */
export function evaluarMetrica(metrica) {
  if (!metrica) return 'no_evaluable';

  const comparador = COMPARADORES[normalizarOperador(metrica.operador)];
  const objetivo = aNumero(metrica.criterio);
  const obtenido = aNumero(metrica.resultado);

  // Sin resultado todavía no es un incumplimiento: es que no se ha medido.
  if (!comparador || objetivo === null || obtenido === null) return 'no_evaluable';

  return comparador(obtenido, objetivo) ? 'cumplida' : 'no_cumplida';
}

/**
 * Cuenta el cumplimiento de una lista de métricas.
 * @param {Array<Object>} metricas
 * @returns {{total: number, medidas: number, cumplidas: number, no_cumplidas: number, no_evaluables: number}}
 */
export function resumirMetricas(metricas = []) {
  const resumen = { total: metricas.length, medidas: 0, cumplidas: 0, no_cumplidas: 0, no_evaluables: 0 };

  for (const metrica of metricas) {
    const veredicto = evaluarMetrica(metrica);
    if (veredicto === 'cumplida') { resumen.cumplidas++; resumen.medidas++; }
    else if (veredicto === 'no_cumplida') { resumen.no_cumplidas++; resumen.medidas++; }
    else resumen.no_evaluables++;
  }

  return resumen;
}

export default { normalizarOperador, aNumero, evaluarMetrica, resumirMetricas };
