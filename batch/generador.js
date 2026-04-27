import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

// Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const archivo = path.join(__dirname, 'passwords.txt');

function randomChar(str) {
  const index = crypto.randomInt(0, str.length);
  return str[index];
}

function generarPassword() {
  const mayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const minusculas = 'abcdefghijklmnopqrstuvwxyz';
  const numeros = '0123456789';
  const especiales = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const todos = mayusculas + minusculas + numeros + especiales;

  let password = [];

  password.push(randomChar(mayusculas));
password.push(randomChar(minusculas)); 
password.push(randomChar(numeros));
password.push(randomChar(especiales));

  while (password.length < 8) {
    password.push(randomChar(todos));
  }

  // Shuffle seguro
  for (let i = password.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join('');
}

// 🔥 Ahora recibe una key (alias, id, etc.)
function guardarPassword(key,nuevaPassword) {
  //const nuevaPassword = generarPassword();

  const linea = `${key}:${nuevaPassword}`;

  fs.appendFileSync(archivo, linea + '\n', 'utf8');

  console.log(`🔐 ${key} -> ${nuevaPassword}`);
  console.log(`🔐 ${key} -> ${nuevaPassword}`);
console.log("Archivo en:", archivo);

  return nuevaPassword; // importante para reutilizar
}

export { generarPassword, guardarPassword };