//import crypto from 'crypto';

import { generarPassword, guardarPassword } from './generador.js';

// ⚠️ Ajusta esto
const BASE_URL = 'http://localhost:3000';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODUzMDk4ZDktNjZkOC00Y2NhLWEwNDktMGRiYTE0ODBmNmZjIiwiYWxpYXMiOiJhZG1pbiIsInRpcG8iOiJFRElUT1IiLCJpZF9lbXBsZWFkbyI6MjksInByb3llY3RvcyI6bnVsbCwiaWF0IjoxNzc0MjExODAzLCJleHAiOjE3NzQyOTgyMDN9.u0r-W_LtOxy4nuCrh9a8b_k4u6syPuuCPuyhnQlQF-Q';

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


// 🔹 Crear usuario
async function crearUsuario(empleado) {
  const correo = empleado?.correo;

  // 🔴 Validación: null, undefined, vacío, espacios
  if (!correo || typeof correo !== 'string' || correo.trim() === '') {
    console.log('⚠️ Empleado sin correo válido, se omite:', empleado?.id_empleado);
    return null;
  }

  const password = generarPassword();

  const body = {
    alias: correo.trim(),
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

  console.log('✅ Usuario creado:', body.alias, '| password:', password);

  guardarPassword(body.alias, password);

  return { ...body };
}




// 🔹 Main
async function main() {
  try {
    const empleados = await obtenerEmpleados();

    // const limite = 5;
    // const subset = empleados.slice(0, limite);


    // for (const emp of subset) {
    for (const emp of empleados) {
      await crearUsuario(emp);
    }

    console.log('🚀 Proceso terminado');
  } catch (err) {
    console.error('💥 Error general:', err.message);
  }
}

main();