import { generarPassword, guardarPassword } from './generador.js';

// Nota: Esto dice que tengo que prender el backend en localhost:3000 para que funcione
const BASE_URL = 'http://localhost:3000';
//Nota: Recuerda actualizar el TOKEN si es necesario, ya que puede expirar o cambiar según la configuración del backend.
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODUzMDk4ZDktNjZkOC00Y2NhLWEwNDktMGRiYTE0ODBmNmZjIiwiYWxpYXMiOiJhZG1pbiIsInRpcG8iOiJFRElUT1IiLCJpZF9lbXBsZWFkbyI6MjksInByb3llY3RvcyI6bnVsbCwiaWF0IjoxNzc3OTE0MTk1LCJleHAiOjE3NzgwMDA1OTV9.ISRBKa_A0mnUkBebJ9Kc126LmY5_0Fu1BP5jrUotiOo';

// 🔹 Helper request
async function request(url, method, body = null) {
  console.log(`\n📡 [REQUEST] ${method} ${url}`);
  if (body) {
    console.log('📦 [REQUEST BODY]:', JSON.stringify(body, null, 2));
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`,
      },
      body: body ? JSON.stringify(body) : null,
    });
  } catch (fetchErr) {
    console.error('🔴 [FETCH ERROR] No se pudo conectar al servidor:', fetchErr.message);
    throw fetchErr;
  }

  console.log(`📶 [RESPONSE STATUS]: ${res.status} ${res.statusText}`);

  let data;
  try {
    data = await res.json();
    console.log('📬 [RESPONSE BODY]:', JSON.stringify(data, null, 2));
  } catch (jsonErr) {
    console.warn('⚠️ [RESPONSE] No se pudo parsear el JSON:', jsonErr.message);
    data = {};
  }

  return {
    ok: res.ok,
    status: res.status,
    result: data,
  };
}

// 🔹 Obtener usuario(s) por id_empleado
async function obtenerUsuarioPorEmpleado(id_empleado) {
  console.log(`\n🔍 [obtenerUsuarioPorEmpleado] Buscando usuarios del empleado ID: ${id_empleado}`);

  const res = await request(`${BASE_URL}/usuarios/empleado/${id_empleado}`, 'GET');

  console.log(`📊 [obtenerUsuarioPorEmpleado] Response ok: ${res.ok}`);

  if (!res.ok) {
    console.error(`❌ [obtenerUsuarioPorEmpleado] Falló la petición. Status: ${res.status}`);
    console.error('❌ [obtenerUsuarioPorEmpleado] Detalle:', JSON.stringify(res.result, null, 2));
    throw new Error(`Error al obtener usuario del empleado ${id_empleado}: ${res.status}`);
  }

  console.log('📋 [obtenerUsuarioPorEmpleado] res.result completo:', JSON.stringify(res.result, null, 2));

  const usuarios = res.result.data || [];
  console.log(`👥 [obtenerUsuarioPorEmpleado] Usuarios encontrados: ${usuarios.length}`);

  if (usuarios.length === 0) {
    console.error(`❌ [obtenerUsuarioPorEmpleado] El array de usuarios está vacío para empleado ${id_empleado}`);
    throw new Error(`No se encontró ningún usuario para el empleado ${id_empleado}`);
  }

  usuarios.forEach((u, i) => {
    console.log(`   👤 Usuario[${i}]: id_usuario=${u.id_usuario}, alias=${u.alias}, activo=${u.activo}, tipo=${u.tipo}`);
  });

  const usuario = usuarios.find(u => u.activo) ?? usuarios[0];
  console.log(`✅ [obtenerUsuarioPorEmpleado] Usuario seleccionado: alias=${usuario.alias}, id_usuario=${usuario.id_usuario}, activo=${usuario.activo}`);

  return usuario;
}

// 🔹 Cambiar contraseña por id_usuario
async function cambiarPassword(id_usuario, password_nueva) {
  console.log(`\n🔑 [cambiarPassword] Iniciando cambio de contraseña para id_usuario: ${id_usuario}`);
  console.log(`🔑 [cambiarPassword] Password nueva generada (longitud): ${password_nueva.length} caracteres`);

  const res = await request(`${BASE_URL}/usuarios/${id_usuario}`, 'PATCH', {
    password: password_nueva,
  });

  console.log(`📊 [cambiarPassword] Response ok: ${res.ok}`);

  if (!res.ok) {
    console.error(`❌ [cambiarPassword] Falló el cambio de contraseña. Status: ${res.status}`);
    console.error('❌ [cambiarPassword] Detalle:', JSON.stringify(res.result, null, 2));
    throw new Error(`Error al cambiar contraseña: ${res.status} - ${JSON.stringify(res.result)}`);
  }

  console.log('✅ [cambiarPassword] Contraseña cambiada exitosamente en el servidor');
  console.log('📬 [cambiarPassword] Datos del usuario actualizado:', JSON.stringify(res.result.data, null, 2));

  return res.result.data;
}

// 🔹 Main
async function main() {
  const id_empleado = 23; // <-- Cambia este valor

  console.log('🚀 ============ INICIO DEL SCRIPT ============');
  console.log(`🎯 ID de empleado objetivo: ${id_empleado}`);
  console.log(`🌐 BASE_URL: ${BASE_URL}`);
  console.log(`🔐 Token (primeros 20 chars): ${TOKEN.substring(0, 20)}...`);

  try {
    // Paso 1: Obtener usuario
    console.log('\n--- PASO 1: Obtener usuario por id_empleado ---');
    const usuario = await obtenerUsuarioPorEmpleado(id_empleado);
    console.log(`✅ Paso 1 completado. Usuario: ${usuario.alias} (${usuario.id_usuario})`);

    // Paso 2: Generar password
    console.log('\n--- PASO 2: Generar nueva contraseña ---');
    const password_nueva = generarPassword();
    console.log(`✅ Paso 2 completado. Password generada (longitud ${password_nueva.length})`);

    // Paso 3: Cambiar contraseña
    console.log('\n--- PASO 3: Cambiar contraseña en el servidor ---');
    const usuarioActualizado = await cambiarPassword(usuario.id_usuario, password_nueva);
    console.log(`✅ Paso 3 completado. Usuario actualizado:`, JSON.stringify(usuarioActualizado, null, 2));

    // Paso 4: Guardar password
    console.log('\n--- PASO 4: Guardar contraseña en archivo ---');
    guardarPassword(usuario.alias, password_nueva);
    console.log(`✅ Paso 4 completado. Contraseña guardada para: ${usuario.alias}`);

    console.log('\n🏁 ============ PROCESO TERMINADO CON ÉXITO ============');

  } catch (err) {
    console.error('\n💥 ============ ERROR GENERAL ============');
    console.error('💥 Mensaje:', err.message);
    console.error('💥 Stack:', err.stack);
  }
}

main();