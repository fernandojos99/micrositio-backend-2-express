import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/empleados';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODUzMDk4ZDktNjZkOC00Y2NhLWEwNDktMGRiYTE0ODBmNmZjIiwiYWxpYXMiOiJhZG1pbiIsInRpcG8iOiJFRElUT1IiLCJpZF9lbXBsZWFkbyI6MjksInByb3llY3RvcyI6bnVsbCwiaWF0IjoxNzc0MjExODAzLCJleHAiOjE3NzQyOTgyMDN9.u0r-W_LtOxy4nuCrh9a8b_k4u6syPuuCPuyhnQlQF-Q';




// Genera numero de empleado con formato "0XXXXX"
function generarNumeroEmpleado() {
  let numero = '0';

  for (let i = 0; i < 5; i++) {
    numero += Math.floor(Math.random() * 10);
  }

  return numero;
}

// Genera número de celular con formato "0XXXXXXXXX"
function generarCelular() {
  let numero = '0';

  for (let i = 0; i < 9; i++) {
    numero += Math.floor(Math.random() * 10);
  }

  return numero;
}


// Datos a agregar 
const rawData =`
Alejandro Gonzalez Rabadan <alejandro.gonzalezr@tecnologiaaccionable.mx>;
Alejandro Javier Franco <alejandro.javierf@tecnologiaaccionable.mx>;
Andrea Cecilia Sanchez Nanez <andrea.sanchez@creacionestecnologicas.mx>;
Diana Berumen Estrada <diana.berumen@tecnologiaaccionable.mx>;
Diego De Leon Sarracino <diego.leons@tecnologiaaccionable.mx>;
Edith Aguilar Urban <eaguilaru@tecnologiaaccionable.mx>;
Eduardo Lopez Santana <eduardo.lopezsa@elektra.com.mx>;
Ewelina Rodriguez Leal <ewelina.rodriguez@elektra.com.mx>;
Felipe De Jesus Sauceda Lopez <felipe.sauceda@elektra.com.mx>;
Fernando Dorantes Nieto <fernando.dorantes@elektra.com.mx>;
Jonathan Alexis Chavero Martinez <jonathan.chaverom@tecnologiaaccionable.mx>;
Jorge Angel Manzanares Cortes <jorge.manzanares@dialogus.com.mx>;
Jorge Gomez Espinosa <jorge.gomezes@dialogus.com.mx>;
Laura Angelica Campos Adrian <lcamposa@tecnologiaaccionable.mx>;
Noemi Estela Cerda Molina <noemi.cerda@tecnologiaaccionable.mx>;
Patricio Escamilla Reynoso <patricio.escamilla@dialogus.com.mx>;
Eduardo Lopez Santana <eduardo.lopezsa@elektra.com.mx>;
jose.cervantesd@dialogus.com.mx Jose Fernando Cervantes Duarte;
azeneth.garcia@dialogus.com.mx - Azeneth Guadalupe Garcia Mendez
`;// tu lista igual

// Función para parsear cada línea del archivo

function parseLine(line) {
    line = line.trim();
    if (!line) return null;
  
    let nombreCompleto = '';
    let correo = '';
  
    // 🔹 Caso 1: Nombre <correo>
    if (line.includes('<')) {
      const match = line.match(/(.*)<(.*)>/);
      if (match) {
        nombreCompleto = match[1].trim();
        correo = match[2].trim();
      }
    } 
    // 🔹 Caso 2: correo nombre
    else if (line.includes('@')) {
      const correoMatch = line.match(/\S+@\S+/);
      if (correoMatch) {
        correo = correoMatch[0];
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
    } else if (partes.length >= 3) {
      apellido_materno = partes.pop();     // último
      apellido_paterno = partes.pop();     // penúltimo
      nombre_pila = partes.join(' ');      // resto
    }
  
    return {
      nombre_pila,
      apellido_paterno,
      apellido_materno,
      correo
    };
  }


// 🔹 Request helper
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

// 🔹 Obtener empleados existentes
async function obtenerEmpleados() {
  const res = await request(`${BASE_URL}/todos`, 'GET');

  if (!res.ok) {
    throw new Error('Error al obtener empleados');
  }

  return res.result;
}

// 🔹 Crear mapa para búsqueda rápida
function crearIndice(empleados) {
    const mapa = new Map();
    console.log('Creando índice de empleados existentes apartir de los empleados de backend...');
    for (const emp of empleados) {
        // printf('Procesando empleado: %s %s', emp.nombre_pila, emp.apellido_paterno);
      const key = `${emp.nombre_pila} ${emp.apellido_paterno}`
        .toLowerCase()
        .trim();
        console.log('Creando índice para:', key);
      if (!mapa.has(key)) {
        console.log('si la creo la key:', key);
        mapa.set(key, []);
      }
      console.log('Agregando empleado al índice:', emp);
      mapa.get(key).push(emp);
    }
  
    return mapa;
  }

// 🔹 Crear o actualizar

async function crearOActualizar(data, indice) {
    const key = `${data.nombre_pila} ${data.apellido_paterno}`
      .toLowerCase()
      .trim();
      const lista = indice.get(key);
      console.log("Es la key de los datos en archivo",key);
      console.log("Es el resultado del indice con key",lista);

  
    const body = {
      ...data,
      celular: generarCelular(),
      numero_empleado: generarNumeroEmpleado(),
      activo: true
    };
  
    // 🔹 Caso 1: existe uno → PATCH (Actualizar)
    if (lista && lista.length === 1) {
      const existente = lista[0];
  
      const updateBody = {
        id_empleado: existente.id_empleado,
        ...body
      };
  
      const res = await request(BASE_URL, 'PATCH', updateBody);
  
      if (res.ok) {
        console.log(`🔄 Actualizado: ${data.correo}`);
      } else {
        console.error(`❌ Error al actualizar: ${data.correo}`, res.result?.message);
      }
  
      return;
    }
  
    // 🔹 Caso 2: duplicados → NO hacer nada
    if (lista && lista.length > 1) {

      console.warn(`⚠️ Duplicados para: ${key}`, lista);
      return;
    }
  
    // 🔹 Caso 3: no existe → POST
    const res = await request(`${BASE_URL}/create`, 'POST', body);
  
    if (res.ok) {
      console.log(`✅ Creado: ${data.correo}`);
    } else {
      console.error(`❌ Error al crear: ${data.correo}`, res.result?.message);
    }
  }





// 🔹 Main
async function main() {
  try {
    const empleados = await obtenerEmpleados();
    const indice = crearIndice(empleados);

    const lines = rawData.split('\n');

    for (const line of lines) {
      const parsed = parseLine(line);
      if (parsed) {
        await crearOActualizar(parsed, indice);
      }
    }

  } catch (err) {
    console.error('🔥 Error general:', err.message);
  }
}

main();