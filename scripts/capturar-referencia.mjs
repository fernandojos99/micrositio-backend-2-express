// Captura el JSON que devuelve cada ruta GET del backend, para comprobar que
// la migración de supabase-js a pg no cambia ninguna respuesta.
//
//   node scripts/capturar-referencia.mjs <dir-salida>                   primera captura
//   node scripts/capturar-referencia.mjs <dir-salida> --como <dir-ref>  repite exactamente
//                                                                       las mismas peticiones
//
// Necesita el backend corriendo (BACKEND_URL, por defecto http://localhost:3001).
// La primera vez resuelve ids reales en la base y firma un token; ambos se
// guardan en <dir-salida>/_peticiones.json y --como los reutiliza, así las dos
// capturas piden exactamente lo mismo.
//
// Las capturas llevan datos reales (nombres, correos): no deben ir a git.
// Se comparan con scripts/comparar-referencia.mjs.

import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const args = process.argv.slice(2);
const dirSalida = args[0];
const iComo = args.indexOf('--como');
const dirComo = iComo >= 0 ? args[iComo + 1] : null;
const BASE = process.env.BACKEND_URL || 'http://localhost:3001';

if (!dirSalida) {
  console.error('Uso: node scripts/capturar-referencia.mjs <dir-salida> [--como <dir-ref>]');
  process.exit(2);
}
fs.mkdirSync(dirSalida, { recursive: true });

const SIN_UUID = '00000000-0000-0000-0000-000000000000';
const NO_EXISTE = 999999;

async function construirPeticiones() {
  const db = await import('../src/config/db.js');
  const { JWT_CONFIG } = await import('../src/config/jwtConfig.js');
  const { default: jwt } = await import('jsonwebtoken');
  const valor = async (sql) => { const f = await db.uno(sql); return f ? Object.values(f)[0] : null; };

  const usuario = await db.uno(`SELECT id_usuario, id_empleado, tipo, alias FROM usuarios
    WHERE id_empleado IS NOT NULL AND activo AND tipo = 'EDITOR' ORDER BY created_at LIMIT 1`);
  // Mismo payload que JWTUtils.generarToken, firmado con el mismo secreto que el backend.
  const token = jwt.sign(
    { user_id: usuario.id_usuario, alias: usuario.alias, tipo: usuario.tipo, id_empleado: usuario.id_empleado, proyectos: [] },
    JWT_CONFIG.secret, { expiresIn: '7d' });

  const id = {
    proyecto: await valor('SELECT id_proyecto FROM secuencia WHERE id_proyecto IS NOT NULL ORDER BY id_proyecto LIMIT 1'),
    usuario: await valor('SELECT id_usuario FROM usuarios ORDER BY created_at LIMIT 1'),
    usuarioConProyectos: await valor('SELECT id_usuario FROM usuario_proyecto ORDER BY id_usuario LIMIT 1'),
    proyectoConUsuarios: await valor('SELECT id_proyecto FROM usuario_proyecto WHERE id_proyecto IS NOT NULL ORDER BY id_proyecto LIMIT 1'),
    celula: await db.uno('SELECT id_empleado, id_proyecto FROM celula_proyecto ORDER BY id LIMIT 1'),
    empleado: await valor('SELECT id_empleado FROM empleado WHERE id_empleado IS NOT NULL ORDER BY id_empleado LIMIT 1'),
    empleadoConUsuario: await valor('SELECT id_empleado FROM usuarios WHERE id_empleado IS NOT NULL AND id_empleado IS NOT NULL ORDER BY id_empleado LIMIT 1'),
    secuencia: await valor('SELECT id_secuencia FROM testing_card WHERE id_secuencia IS NOT NULL ORDER BY id_secuencia LIMIT 1'),
    testingCard: await valor('SELECT id_testing_card FROM learning_card WHERE id_testing_card IS NOT NULL ORDER BY id_testing_card LIMIT 1'),
    padre: await valor('SELECT padre_id FROM testing_card WHERE padre_id IS NOT NULL ORDER BY padre_id LIMIT 1'),
    learningCard: await valor('SELECT id FROM learning_card WHERE id IS NOT NULL ORDER BY id LIMIT 1'),
    tcConMetricas: await valor('SELECT id_testing_card FROM metrica_testing_card WHERE id_testing_card IS NOT NULL ORDER BY id_testing_card LIMIT 1'),
    metrica: await valor('SELECT id_metrica FROM metrica_testing_card WHERE id_metrica IS NOT NULL ORDER BY id_metrica LIMIT 1'),
    tcConUrls: await valor('SELECT id_testing_card FROM url_testing_card WHERE id_testing_card IS NOT NULL ORDER BY id_testing_card LIMIT 1'),
    urlTc: await valor('SELECT id_url_tc FROM url_testing_card WHERE id_url_tc IS NOT NULL ORDER BY id_url_tc LIMIT 1'),
    lcConUrls: await valor('SELECT id_learning_card FROM url_learning_card WHERE id_learning_card IS NOT NULL ORDER BY id_learning_card LIMIT 1'),
    urlLc: await valor('SELECT id_url_lc FROM url_learning_card WHERE id_url_lc IS NOT NULL ORDER BY id_url_lc LIMIT 1'),
    nodo: await db.uno('SELECT node_id, node_type, id_secuencia FROM node_positions ORDER BY id_position LIMIT 1'),
    playbook: await db.uno('SELECT pagina, campo, tipo FROM testing_card_playbook ORDER BY pagina LIMIT 1'),
    tcConDocumentos: await valor('SELECT testing_card_id FROM testing_card_documents WHERE testing_card_id IS NOT NULL ORDER BY testing_card_id LIMIT 1'),
    categoria: await valor('SELECT id_categoria FROM categoria WHERE id_categoria IS NOT NULL ORDER BY id_categoria LIMIT 1'),
    experimentoTipo: await valor('SELECT id_experimento_tipo FROM experimento_tipo WHERE id_experimento_tipo IS NOT NULL ORDER BY id_experimento_tipo LIMIT 1'),
    agente: await valor('SELECT id_agente FROM agente WHERE id_agente IS NOT NULL ORDER BY id_agente LIMIT 1'),
    categoriaDeAgente: await valor('SELECT id_categoria FROM relacion_agente_categoria WHERE id_categoria IS NOT NULL ORDER BY id_categoria LIMIT 1'),
    relacion: await valor('SELECT id_relacion_agente_categoria FROM relacion_agente_categoria WHERE id_relacion_agente_categoria IS NOT NULL ORDER BY id_relacion_agente_categoria LIMIT 1'),
    agenteConRelacion: await valor('SELECT id_agente FROM relacion_agente_categoria WHERE id_agente IS NOT NULL ORDER BY id_agente LIMIT 1'),
    plantillaTc: await valor('SELECT id_plantilla_testing_card FROM plantilla_testing_card WHERE id_plantilla_testing_card IS NOT NULL ORDER BY id_plantilla_testing_card LIMIT 1'),
    empleadoPlantillaTc: await valor('SELECT id_empleado FROM plantilla_testing_card WHERE id_empleado IS NOT NULL ORDER BY id_empleado LIMIT 1'),
    tcPlantilla: await valor('SELECT id_testing_card FROM plantilla_testing_card WHERE id_testing_card IS NOT NULL ORDER BY id_testing_card LIMIT 1'),
    plantillaSec: await valor('SELECT id_plantilla_secuencia::text FROM plantilla_secuencia ORDER BY created_at LIMIT 1'),
    secuenciaPlantilla: await valor('SELECT id_secuencia FROM plantilla_secuencia WHERE id_secuencia IS NOT NULL ORDER BY id_secuencia LIMIT 1'),
    formato: await valor('SELECT id::text FROM formato ORDER BY created_at LIMIT 1'),
    urlFormato: await valor('SELECT id_url_formato FROM url_formato WHERE id_url_formato IS NOT NULL ORDER BY id_url_formato LIMIT 1'),
  };
  await db.cerrar();

  const p = [];
  const get = (nombre, ruta, { query, body } = {}) => p.push({ nombre, ruta, query, body });

  // --- proyectos
  get('proyectos', '/proyectos');
  get('proyectos_p_body', '/proyectos/p', { body: { id_proyecto: id.proyecto } });
  get('proyectos_por_usuario', `/proyectos/usuario/${id.usuarioConProyectos}`);
  get('proyectos_id', `/proyectos/${id.proyecto}`);
  get('proyectos_id_no_existe', `/proyectos/${NO_EXISTE}`);
  // --- celula_proyecto
  get('celula_por_empleado', '/celula_proyecto/e', { body: { id_empleado: id.celula.id_empleado }, query: { id_proyecto: id.celula.id_proyecto } });
  get('celula_por_proyecto', '/celula_proyecto/p', { query: { id_proyecto: id.celula.id_proyecto } });
  get('celula', '/celula_proyecto');
  // --- empleados
  get('empleados_todos', '/empleados/todos');
  get('empleados_sin_usuario', '/empleados/sin-usuario');
  get('empleados_id', `/empleados/${id.empleado}`);
  get('empleados_id_no_existe', `/empleados/${NO_EXISTE}`);
  // --- secuencias
  get('secuencias_por_proyecto', '/secuencias/p', { query: { id_proyecto: id.proyecto } });
  get('secuencias_id', `/secuencias/${id.secuencia}`);
  get('secuencias_id_no_existe', `/secuencias/${NO_EXISTE}`);
  get('secuencias', '/secuencias');
  // --- catálogos
  get('categorias_c', '/categorias/c', { body: { id_categoria: id.categoria } });
  get('categorias_c_no_existe', '/categorias/c', { body: { id_categoria: NO_EXISTE } });
  get('categorias', '/categorias');
  get('experimento_tipo_e', '/experimento_tipo/e', { body: { id_experimento_tipo: id.experimentoTipo } });
  get('experimento_tipo', '/experimento_tipo');
  // --- testing cards
  get('testing_card_t', `/testing_card/t/${id.testingCard}`);
  get('testing_card_por_secuencia', '/testing_card/s', { query: { id_secuencia: id.secuencia } });
  get('testing_card_por_secuencia_vacia', '/testing_card/s', { query: { id_secuencia: NO_EXISTE } });
  get('testing_card', '/testing_card');
  get('testing_card_padre', '/testing_card/padre', { query: { padre_id: id.padre } });
  get('testing_card_plantillas', '/testing_card/plantillas');
  get('testing_card_id', `/testing_card/${id.testingCard}`);
  get('testing_card_id_no_existe', `/testing_card/${NO_EXISTE}`);
  // --- learning cards
  get('learning_card_por_tc', '/learning_card/t', { query: { id_testing_card: id.testingCard } });
  get('learning_card_l', '/learning_card/l', { query: { id_learning_card: id.learningCard } });
  get('learning_card', '/learning_card');
  get('learning_card_id', `/learning_card/${id.learningCard}`);
  get('learning_card_id_no_existe', `/learning_card/${NO_EXISTE}`);
  // --- métricas y URLs
  get('metrica_por_tc', '/metrica_testing_card/t', { query: { id_testing_card: id.tcConMetricas } });
  get('metrica_m', '/metrica_testing_card/m', { query: { id_metrica_testing_card: id.metrica } });
  get('metrica_m_no_existe', '/metrica_testing_card/m', { query: { id_metrica_testing_card: NO_EXISTE } });
  get('metrica', '/metrica_testing_card');
  get('url_tc_por_tc', '/url_testing_card/t', { query: { id_testing_card: id.tcConUrls } });
  get('url_tc_u', '/url_testing_card/u', { query: { id_url_tc: id.urlTc } });
  get('url_tc', '/url_testing_card');
  get('url_lc_por_lc', '/url_learning_card/l', { query: { id_learning_card: id.lcConUrls } });
  get('url_lc_u', '/url_learning_card/u', { query: { id_url_lc: id.urlLc } });
  get('url_lc', '/url_learning_card');
  // --- flow
  get('flow_nodo', `/flow-positions/${id.nodo.node_id}/${id.nodo.node_type}/${id.nodo.id_secuencia}`);
  get('flow_nodo_no_existe', `/flow-positions/${NO_EXISTE}/testing/${id.nodo.id_secuencia}`);
  get('flow_por_secuencia', `/flow-positions/${id.nodo.id_secuencia}`);
  get('flow', '/flow-positions');
  // --- playbook
  get('playbook', '/testing_card_playbook');
  get('playbook_por_pagina', '/testing_card_playbook/por-pagina', { query: { pagina: id.playbook.pagina } });
  get('playbook_por_pagina_no_existe', '/testing_card_playbook/por-pagina', { query: { pagina: NO_EXISTE } });
  get('playbook_buscar', '/testing_card_playbook/buscar', { query: { campo: id.playbook.campo } });
  get('playbook_buscar_tipo', '/testing_card_playbook/buscar-tipo', { query: { tipo: id.playbook.tipo } });
  // --- documentos
  get('docs_testing_card', `/api/testing-card/${id.tcConDocumentos}/documents`);
  get('docs_learning_card', `/api/learning-card/${id.learningCard}/documents`);
  get('docs_learning_card_id_no_existe', `/api/learning-card/documents/${SIN_UUID}`);
  // --- usuarios y auth
  get('usuarios_estadisticas', '/usuarios/estadisticas');
  get('usuarios_por_empleado', `/usuarios/empleado/${id.empleadoConUsuario}`);
  get('usuarios', '/usuarios');
  get('usuarios_filtrados', '/usuarios', { query: { activo: 'true', tipo: 'EDITOR' } });
  get('usuarios_id', `/usuarios/${id.usuario}`);
  get('usuarios_id_no_existe', `/usuarios/${SIN_UUID}`);
  get('usuario_proyecto_estadisticas', '/usuario_proyecto/estadisticas');
  get('usuario_proyecto_por_usuario', `/usuario_proyecto/usuario/${id.usuarioConProyectos}`);
  get('usuario_proyecto_por_proyecto', `/usuario_proyecto/proyecto/${id.proyectoConUsuarios}`);
  get('usuario_proyecto', '/usuario_proyecto');
  get('auth_verificar', '/auth/verificar');
  // --- agentes
  get('agentes', '/agentes');
  get('agentes_por_categoria', `/agentes/categoria/${id.categoriaDeAgente}`);
  get('agentes_id', `/agentes/${id.agente}`);
  get('agentes_id_no_existe', `/agentes/${NO_EXISTE}`);
  get('agente_categoria_categorias', '/agente_categoria/categorias');
  get('agente_categoria', '/agente_categoria');
  get('agente_categoria_id', `/agente_categoria/${id.relacion}`);
  get('agente_categoria_por_agente', `/agente_categoria/agente/${id.agenteConRelacion}`);
  get('agente_categoria_por_categoria', `/agente_categoria/categoria/${id.categoriaDeAgente}`);
  // --- plantillas
  get('plantilla_tc', '/plantilla_testing_card');
  get('plantilla_tc_por_empleado', `/plantilla_testing_card/empleado/${id.empleadoPlantillaTc}`);
  get('plantilla_tc_por_tc', `/plantilla_testing_card/testing-card/${id.tcPlantilla}`);
  get('plantilla_tc_id', `/plantilla_testing_card/${id.plantillaTc}`);
  get('plantilla_tc_id_no_existe', `/plantilla_testing_card/${NO_EXISTE}`);
  get('plantilla_metrica', '/plantilla_metrica_tc');
  get('plantilla_metrica_por_empleado', `/plantilla_metrica_tc/empleado/${id.empleado}`);
  get('plantilla_metrica_por_metrica', `/plantilla_metrica_tc/metrica/${id.metrica}`);
  get('plantilla_metrica_id_no_existe', `/plantilla_metrica_tc/${NO_EXISTE}`);
  get('plantilla_secuencia', '/plantilla_secuencia');
  get('plantilla_secuencia_id', `/plantilla_secuencia/${id.plantillaSec}`);
  get('plantilla_secuencia_id_no_existe', `/plantilla_secuencia/${SIN_UUID}`);
  get('plantilla_secuencia_por_secuencia', `/plantilla_secuencia/secuencia/${id.secuenciaPlantilla}`);
  // --- búsqueda (los joins embebidos de testing y learning cards pasan por aquí)
  for (const scope of ['all', 'proyectos', 'secuencias', 'testing_cards', 'learning_cards', 'agentes', 'prompts']) {
    get(`search_${scope}`, '/search', { query: { q: 'a', scope } });
  }
  get('search_sin_resultados', '/search', { query: { q: 'zzzqqq', scope: 'all' } });
  // --- formatos
  get('url_formato', '/url_formato');
  get('url_formato_id', `/url_formato/${id.urlFormato}`);
  get('url_formato_id_no_existe', `/url_formato/${NO_EXISTE}`);
  get('formato', '/formato');
  get('formato_id', `/formato/${id.formato}`);
  get('formato_id_no_existe', `/formato/${SIN_UUID}`);
  // --- accionables (la tabla está vacía en la copia local)
  get('accionables_raiz', '/accionables');
  get('accionables_id', '/accionables/1');
  get('accionables_por_lc', `/accionables/learning-card/${id.learningCard}/accionables`);
  get('accionables_por_tc', `/accionables/testing-card/${id.testingCard}/accionables`);
  get('accionables_por_secuencia', `/accionables/secuencia/${id.secuencia}/accionables`);
  get('accionables_por_proyecto', `/accionables/proyecto/${id.proyecto}/accionables`);
  // --- resto
  get('habilidad_por_empleado', `/habilidad/empleado/${id.empleado}`);
  get('chat_sesiones', '/api/chat/sessions');
  get('servicio', '/servicio');
  get('servicio_s', '/servicio/s', { query: { id: 1 } });
  // Fuera a propósito: /api/chat/ping y /api/chat/sessions/:thread_id/messages
  // llaman al agente externo (AGENT_API_URL), no a la base.

  return { peticiones: p, token };
}

function pedir({ ruta, query, body }, token) {
  const url = new URL(ruta, BASE);
  for (const [k, v] of Object.entries(query || {})) url.searchParams.set(k, String(v));
  const cuerpo = body ? JSON.stringify(body) : null;
  return new Promise((resolve, reject) => {
    // node:http y no fetch: algunas rutas GET leen el ID del body, y fetch no
    // permite body en un GET.
    const req = http.request(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(cuerpo ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(cuerpo) } : {}),
      },
    }, (res) => {
      let texto = '';
      res.setEncoding('utf8');
      res.on('data', (c) => { texto += c; });
      res.on('end', () => {
        let cuerpoRespuesta;
        try { cuerpoRespuesta = JSON.parse(texto); } catch { cuerpoRespuesta = texto; }
        // El stack apunta a rutas y números de línea que cambian con cualquier
        // edición: no forma parte del contrato.
        if (cuerpoRespuesta && typeof cuerpoRespuesta === 'object' && 'stack' in cuerpoRespuesta) {
          delete cuerpoRespuesta.stack;
        }
        resolve({ status: res.statusCode, body: cuerpoRespuesta });
      });
    });
    req.on('error', reject);
    if (cuerpo) req.write(cuerpo);
    req.end();
  });
}

const { peticiones, token } = dirComo
  ? JSON.parse(fs.readFileSync(path.join(dirComo, '_peticiones.json'), 'utf8'))
  : await construirPeticiones();
fs.writeFileSync(path.join(dirSalida, '_peticiones.json'), JSON.stringify({ peticiones, token }, null, 2));

const porStatus = {};
for (const peticion of peticiones) {
  const respuesta = await pedir(peticion, token);
  fs.writeFileSync(path.join(dirSalida, `${peticion.nombre}.json`), JSON.stringify(respuesta, null, 2));
  porStatus[respuesta.status] = (porStatus[respuesta.status] || 0) + 1;
}
console.log(`Capturadas ${peticiones.length} rutas en ${dirSalida}`);
console.log('Por status:', Object.entries(porStatus).map(([s, n]) => `${s}×${n}`).join('  '));
