import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/empleados';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODUzMDk4ZDktNjZkOC00Y2NhLWEwNDktMGRiYTE0ODBmNmZjIiwiYWxpYXMiOiJhZG1pbiIsInRpcG8iOiJFRElUT1IiLCJpZF9lbXBsZWFkbyI6MjksInByb3llY3RvcyI6bnVsbCwiaWF0IjoxNzc3MzA3MTI3LCJleHAiOjE3NzczOTM1Mjd9.FleThyL7GfEhI4YUM7QM1xzYlvGj0fnZCy_hitfBgpc';

// 🔢 Generadores
function generarNumeroEmpleado() {
  let numero = '0';
  for (let i = 0; i < 5; i++) {
    numero += Math.floor(Math.random() * 10);
  }
  return numero;
}

function generarCelular() {
  let numero = '0';
  for (let i = 0; i < 9; i++) {
    numero += Math.floor(Math.random() * 10);
  }
  return numero;
}

// 📄 Datos
const rawData = `
Javier Flores Martinez <javier.flores@dialogus.com.mx>
`;

// 🧠 Parser
function parseLine(line) {
  line = line.trim();
  if (!line) return null;

  let nombreCompleto = '';
  let correo = '';

  if (line.includes('<')) {
    const match = line.match(/(.*)<(.*)>/);
    if (match) {
      nombreCompleto = match[1].trim();
      correo = match[2].replace(/[;,\s]+$/, '').trim(); // 🔥 limpieza
    }
  } else if (line.includes('@')) {
    const correoMatch = line.match(/\S+@\S+/);
    if (correoMatch) {
      correo = correoMatch[0].replace(/[;,\s]+$/, '').trim();
      nombreCompleto = line.replace(correo, '').replace('-', '').trim();
    }
  }

  if (!nombreCompleto || !correo) return null;

  const partes = nombreCompleto.split(/\s+/).filter(Boolean);

  let nombre_pila = '';
  let apellido_paterno = '';
  let apellido_materno = '';

  if (partes.length === 1) {
    nombre_pila = partes[0];
  } else if (partes.length === 2) {
    nombre_pila = partes[0];
    apellido_paterno = partes[1];
  } else {
    apellido_materno = partes.pop();
    apellido_paterno = partes.pop();
    nombre_pila = partes.join(' ');
  }

  return { nombre_pila, apellido_paterno, apellido_materno, correo };
}

// 🌐 Request helper
async function request(url, method, body = null) {
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`
    },
    body: body ? JSON.stringify(body) : null
  });

  const result = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, result };
}

// 📥 Obtener empleados
async function obtenerEmpleados() {
  const res = await request(`${BASE_URL}/todos`, 'GET');
  console.log('Empleados obtenidos:', res.result?.length || 0);
  console.log('Detalles:', res);
  if (!res.ok) {
    throw new Error('Error al obtener empleados');
  }

  return res.result;
}

// 🧠 Crear índices (nombre y correo)
function crearIndices(empleados) {
  const porNombre = new Map();
  const porCorreo = new Map();

  for (const emp of empleados) {
    const keyNombre = `${emp.nombre_pila} ${emp.apellido_paterno}`
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();

    const keyCorreo = emp.correo?.toLowerCase().trim();

    if (!porNombre.has(keyNombre)) porNombre.set(keyNombre, []);
    porNombre.get(keyNombre).push(emp);

    if (keyCorreo) {
      porCorreo.set(keyCorreo, emp);
    }
  }

  return { porNombre, porCorreo };
}

// 🚀 SOLO CREAR (sin actualizar)
async function crearSiNoExiste(data, indices) {
  const keyNombre = `${data.nombre_pila} ${data.apellido_paterno}`
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

  const keyCorreo = data.correo.toLowerCase().trim();

  const existePorNombre = indices.porNombre.get(keyNombre);
  const existePorCorreo = indices.porCorreo.get(keyCorreo);

  // ❌ Ya existe → NO hacer nada
  if (existePorNombre || existePorCorreo) {
    console.warn(`⏭️ Ya existe, se omite: ${data.correo}`);
    return;
  }

  // ✅ Crear nuevo
  const body = {
    ...data,
    celular: generarCelular(),
    numero_empleado: generarNumeroEmpleado(),
    activo: true
  };

  const res = await request(`${BASE_URL}/create`, 'POST', body);

  if (res.ok) {
    console.log(`✅ Creado: ${data.correo}`);

    // 🔄 actualizar índices para evitar duplicados en la misma corrida
    if (!indices.porNombre.has(keyNombre)) {
      indices.porNombre.set(keyNombre, []);
    }
    indices.porNombre.get(keyNombre).push(body);
    indices.porCorreo.set(keyCorreo, body);

  } else {
    console.error(`❌ Error al crear: ${data.correo}`, res.result?.message);
  }
}

// 🔹 Main
async function main() {
  try {
    const empleados = await obtenerEmpleados();
    const indices = crearIndices(empleados);

    const lines = rawData.split('\n');

    for (const line of lines) {
      const parsed = parseLine(line);
      if (parsed) {
        await crearSiNoExiste(parsed, indices);
      }
    }

  } catch (err) {
    console.error('🔥 Error general:', err.message);
  }
}

main();