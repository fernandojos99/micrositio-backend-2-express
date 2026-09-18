//import bcrypt from 'bcryptjs';

import bcrypt from 'bcryptjs';
import { consulta, exigirFila, insertarFilas } from '../config/db.js';
import JWTUtils from '../utils/jwtUtils.js';
import ApiError from '../utils/ApiError.js';

// Este servicio consultaba la base directamente con `.single()`, que falla
// tanto sin filas como con más de una. Aquí se reproduce igual: solo cuenta
// si hay exactamente una fila.
const exactamenteUna = (filas) => (filas.length === 1 ? filas[0] : null);

class AuthService {
  /**
   * Procesa el login del usuario
   */
  async login(alias, password) {
    try {
      // 1. Buscar usuario por alias. Cualquier fallo (sin fila, más de una o
      // un error de la base) cuenta como credenciales inválidas, como antes.
      let usuario = null;
      try {
        usuario = exactamenteUna(await consulta(
          'SELECT * FROM usuarios WHERE alias = $1 AND activo = true', [alias]));
      } catch {
        usuario = null;
      }

      if (!usuario) {
        throw new ApiError('Credenciales inválidas', 401);
      }
      // 2. Verificar password


      // 🔥 TEST BCRYPT (ponlo AQUÍ)

      const testHash = await bcrypt.hash("123456", 10);
      const testCompare = await bcrypt.compare("123456", testHash);

     // const passwordValido = true;
    //  2. Verificar password
        let passwordValido = false;
      try {
        passwordValido = await bcrypt.compare(password, usuario.password_hash);
      } catch (bcryptError) {
        throw new ApiError(
          'Error al validar contraseña',
          500,
          {
            originalError: bcryptError,
            details: {
              passwordLength: password?.length,
              hash: usuario.password_hash
            }
          }
        );
      }






      if (!passwordValido) {
        throw new ApiError('Credenciales inválidas', 401);
      }
      // 3. Obtener proyectos si es visitante
      let proyectos = null;
      if (usuario.tipo === 'VISITANTE') {
        let proyectosData;
        try {
          proyectosData = await consulta(
            'SELECT id_proyecto FROM usuario_proyecto WHERE id_usuario = $1', [usuario.id_usuario]);
        } catch {
          throw new ApiError('Error al obtener proyectos del usuario', 500);
        }

        proyectos = proyectosData.map(p => p.id_proyecto);
      }

      // 4. Generar JWT
      const token = JWTUtils.generarToken(usuario, proyectos);

      // 5. Preparar respuesta (sin password)
      const { password_hash, ...usuarioSinPassword } = usuario;
      return {
        token,
        usuario: {
          ...usuarioSinPassword,
          proyectos
        }
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Error interno del servidor', 500);
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async registro(datosUsuario) {
    try {
      const { alias, password, tipo, id_empleado } = datosUsuario;

      // 1. Verificar si alias ya existe. Antes el error de esta consulta se
      // ignoraba (solo se miraba data): se mantiene.
      const usuarioExistente = exactamenteUna(await consulta(
        'SELECT id_usuario FROM usuarios WHERE alias = $1', [alias]).catch(() => []));

      if (usuarioExistente) {
        throw new ApiError('El alias ya está registrado', 400);
      }

      // 2. Hash del password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // 3. Crear usuario
      let nuevoUsuario;
      try {
        nuevoUsuario = await exigirFila(insertarFilas('usuarios', {
          alias,
          password_hash,
          tipo,
          id_empleado: tipo === 'VISITANTE' ? null : id_empleado
        }));
      } catch {
        throw new ApiError('Error al crear usuario', 500);
      }

      // 4. Generar token para el nuevo usuario
      const token = JWTUtils.generarToken(nuevoUsuario, []);

      const { password_hash: _, ...usuarioSinPassword } = nuevoUsuario;

      return {
        token,
        usuario: usuarioSinPassword
      };

    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Error interno del servidor', 500);
    }
  }



  /**
 * Obtiene un usuario completo desde la BD por su ID
 */
async obtenerUsuarioPorId(id_usuario) {
  try {
    // Sin fila, con más de una o con un error de la base (p. ej. un UUID mal
    // formado): 404, como antes.
    let usuario = null;
    try {
      usuario = exactamenteUna(await consulta('SELECT * FROM usuarios WHERE id_usuario = $1', [id_usuario]));
    } catch {
      usuario = null;
    }

    if (!usuario) {
      throw new ApiError('Usuario no encontrado', 404);
    }

    // Quitar password de la respuesta
    const { password_hash, ...usuarioSinPassword } = usuario;
    return usuarioSinPassword;

  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError('Error interno del servidor', 500);
  }
}
}

export default AuthService;
