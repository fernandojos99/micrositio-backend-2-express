// Compara dos capturas hechas con capturar-referencia.mjs.
//
//   node scripts/comparar-referencia.mjs <dir-referencia> <dir-nuevo>
//
// Cada captura es un <nombre>.json con { status, body }. Una ruta pasa si el
// status y el cuerpo son idénticos. Si solo cambia el orden de un array se
// informa aparte: es aceptable únicamente cuando la consulta no tiene ORDER BY
// (el orden físico no está garantizado), y hay que comprobarlo a mano.
//
// Sale con código 1 si alguna ruta difiere.

import fs from 'node:fs';
import path from 'node:path';

const [dirRef, dirNuevo] = process.argv.slice(2);
if (!dirRef || !dirNuevo) {
  console.error('Uso: node scripts/comparar-referencia.mjs <dir-referencia> <dir-nuevo>');
  process.exit(2);
}

// Serialización estable: mismo texto para el mismo valor, sea cual sea el
// orden en que se escribieron las claves de los objetos.
const estable = (v) =>
  Array.isArray(v) ? `[${v.map(estable).join(',')}]`
  : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${estable(v[k])}`).join(',')}}`
  : JSON.stringify(v);

// Igual que estable(), pero ordenando también los arrays.
const sinOrden = (v) =>
  Array.isArray(v) ? `[${v.map(sinOrden).sort().join(',')}]`
  : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${sinOrden(v[k])}`).join(',')}}`
  : JSON.stringify(v);

// Primera ruta (a.b[3].c) donde dos valores difieren, para el informe.
function primeraDiferencia(a, b, ruta = '') {
  if (estable(a) === estable(b)) return null;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return `${ruta || '(raíz)'}: longitud ${a.length} → ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = primeraDiferencia(a[i], b[i], `${ruta}[${i}]`);
      if (d) return d;
    }
  }
  if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
      if (!(k in a)) return `${ruta}.${k}: no estaba en la referencia`;
      if (!(k in b)) return `${ruta}.${k}: falta en la nueva`;
      const d = primeraDiferencia(a[k], b[k], `${ruta}.${k}`);
      if (d) return d;
    }
  }
  const corto = (v) => { const s = JSON.stringify(v); return s && s.length > 70 ? s.slice(0, 70) + '…' : s; };
  return `${ruta || '(raíz)'}: ${corto(a)} → ${corto(b)}`;
}

const nombres = fs.readdirSync(dirRef).filter((f) => f.endsWith('.json') && !f.startsWith('_')).sort();
const resultado = { iguales: [], soloOrden: [], distintas: [], faltan: [] };

for (const f of nombres) {
  const pNuevo = path.join(dirNuevo, f);
  if (!fs.existsSync(pNuevo)) { resultado.faltan.push(f); continue; }
  const ref = JSON.parse(fs.readFileSync(path.join(dirRef, f), 'utf8'));
  const nuevo = JSON.parse(fs.readFileSync(pNuevo, 'utf8'));
  const nombre = f.replace(/\.json$/, '');

  if (ref.status === nuevo.status && estable(ref.body) === estable(nuevo.body)) {
    resultado.iguales.push(nombre);
  } else if (ref.status === nuevo.status && sinOrden(ref.body) === sinOrden(nuevo.body)) {
    resultado.soloOrden.push(nombre);
  } else {
    const motivo = ref.status !== nuevo.status
      ? `status ${ref.status} → ${nuevo.status}`
      : primeraDiferencia(ref.body, nuevo.body);
    resultado.distintas.push(`${nombre}: ${motivo}`);
  }
}

console.log(`Rutas comparadas: ${nombres.length}`);
console.log(`  idénticas:          ${resultado.iguales.length}`);
console.log(`  solo cambia orden:  ${resultado.soloOrden.length}${resultado.soloOrden.length ? '  → ' + resultado.soloOrden.join(', ') : ''}`);
console.log(`  distintas:          ${resultado.distintas.length}`);
for (const d of resultado.distintas) console.log(`    ✗ ${d}`);
if (resultado.faltan.length) console.log(`  sin captura nueva:  ${resultado.faltan.join(', ')}`);

process.exit(resultado.distintas.length || resultado.faltan.length ? 1 : 0);
