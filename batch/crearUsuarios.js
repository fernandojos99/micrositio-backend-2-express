import { generarPassword, guardarPassword } from './generador.js';

const BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODUzMDk4ZDktNjZkOC00Y2NhLWEwNDktMGRiYTE0ODBmNmZjIiwiYWxpYXMiOiJhZG1pbiIsInRpcG8iOiJFRElUT1IiLCJpZF9lbXBsZWFkbyI6MjksInByb3llY3RvcyI6bnVsbCwiaWF0IjoxNzc3MzA3MTI3LCJleHAiOjE3NzczOTM1Mjd9.FleThyL7GfEhI4YUM7QM1xzYlvGj0fnZCy_hitfBgpc';

// 🔹 Helper request
async function request(url, method, body = null) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => ({}));

  return {
    ok: res.ok,
    status: res.status,
    result: data,
  };
}

// 🔹 Obtener empleados
async function obtenerEmpleados() {
  const res = await request(`${BASE_URL}/empleados/todos`, 'GET');

  if (!res.ok) {
    throw new Error('Error al obtener empleados');
  }

  return res.result;
}

// 🔹 Obtener usuarios existentes (IMPORTANTE)
async function obtenerUsuarios() {
  const res = await request(`${BASE_URL}/usuarios`, 'GET');

  if (!res.ok) {
    throw new Error('Error al obtener usuarios');
  }

  // 🔥 FIX AQUÍ
  return res.result.data || [];
}

// 🔹 Crear índice por alias (correo)
function crearIndiceUsuarios(usuarios) {
  const mapa = new Map();

  for (const u of usuarios) {
    const key = u.alias?.toLowerCase().trim();
    if (key) {
      mapa.set(key, u);
    }
  }

  return mapa;
}

// 🔹 Crear usuario SOLO si no existe
async function crearUsuario(empleado, indiceUsuarios) {
  //console.log('Procesando empleado:', empleado?.id_empleado, empleado?.nombre_pila, empleado?.apellido_paterno);
  const correo = empleado?.correo;

  if (!correo || typeof correo !== 'string' || correo.trim() === '') {
    console.log('⚠️ Empleado sin correo válido, se omite:', empleado?.id_empleado);
    return null;
  }

  const alias = correo.trim().toLowerCase();

  // 🔒 VALIDACIÓN CLAVE
  if (indiceUsuarios.has(alias)) {
    console.log(`⏭️ Usuario ya existe, se omite: ${alias}`);
    return null;
  }

  const password = generarPassword();

  const body = {
    alias,
    password,
    tipo: 'EDITOR',
    id_empleado: empleado.id_empleado,
    activo: true,
  };

  const res = await request(`${BASE_URL}/usuarios`, 'POST', body);

  if (!res.ok) {
    console.error(
      '❌ Error creando usuario:',
      empleado.id_empleado,
      res.status,
      res.result
    );
    return null;
  }

  console.log('✅ Usuario creado:', alias);

  guardarPassword(alias, password);

  // 🔄 actualizar índice para evitar duplicados en la misma corrida
  indiceUsuarios.set(alias, body);

  return { ...body };
}

// 🔹 Main
async function main() {
  try {
    const empleados = await obtenerEmpleados();
    console.log('Empleados obtenidos:', empleados.length);
    const usuarios = await obtenerUsuarios();
    console.log('Usuarios obtenidos todo:', usuarios);

    console.log('Usuarios obtenidos:', usuarios.length);
    const indiceUsuarios = crearIndiceUsuarios(usuarios);

    for (const emp of empleados) {
      await crearUsuario(emp, indiceUsuarios);
    }

    console.log('🚀 Proceso terminado');
  } catch (err) {
    console.error('💥 Error general:', err.message);
  }
}

main();