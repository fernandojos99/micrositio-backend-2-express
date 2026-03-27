//import bcrypt from 'bcryptjs';

import bcrypt from 'bcryptjs';
import supabase from '../config/supabaseClient.js';
import JWTUtils from '../utils/jwtUtils.js';
import ApiError from '../utils/ApiError.js';

class AuthService {
  /**
   * Procesa el login del usuario
   */
  async login(alias, password) {
    try {
      // 1. Buscar usuario por alias
      console.log(`Intentando login para alias: ${alias}`);
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('alias', alias)
        .eq('activo', true)
        .single();

      if (userError || !usuario) {
        throw new ApiError('Credenciales inválidas', 401);
      }
      console.log(`Usuario encontradoOOOOOOOO: ${usuario.id_usuario}, tipo: ${usuario.tipo}`);
      // 2. Verificar password


      // 🔥 TEST BCRYPT (ponlo AQUÍ)
      console.log("TEST BCRYPT LOCAL");

      const testHash = await bcrypt.hash("123456", 10);
      const testCompare = await bcrypt.compare("123456", testHash);

      console.log("BCRYPT TEST RESULT:", testCompare);



      console.log("HASH DEBUG", {
        hash: usuario.password_hash,
        length: usuario.password_hash?.length,
        startsWith: usuario.password_hash?.slice(0, 4)
      });

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






      console.log(`Comparando password para usuario ${usuario.id_usuario}: ${passwordValido ? 'válido' : 'inválido'}`);
      if (!passwordValido) {
        console.log(`Password inválido para usuario ${usuario.id_usuario}`);
        throw new ApiError('Credenciales inválidas', 401);
      }
      console.log('Password válido, generando token...');
      // 3. Obtener proyectos si es visitante
      let proyectos = null;
      if (usuario.tipo === 'VISITANTE') {
        const { data: proyectosData, error: proyectosError } = await supabase
          .from('usuario_proyecto')
          .select('id_proyecto')
          .eq('id_usuario', usuario.id_usuario);

        if (proyectosError) {
          throw new ApiError('Error al obtener proyectos del usuario', 500);
        }

        proyectos = proyectosData.map(p => p.id_proyecto);
      }

      // 4. Generar JWT
      const token = JWTUtils.generarToken(usuario, proyectos);

      // 5. Preparar respuesta (sin password)
      const { password_hash, ...usuarioSinPassword } = usuario;
      console.log(`Login exitoso para usuario ${usuario.id_usuario}, token generado`);
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

      // 1. Verificar si alias ya existe
      const { data: usuarioExistente } = await supabase
        .from('usuarios')
        .select('id_usuario')
        .eq('alias', alias)
        .single();

      if (usuarioExistente) {
        throw new ApiError('El alias ya está registrado', 400);
      }

      // 2. Hash del password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // 3. Crear usuario
      const { data: nuevoUsuario, error } = await supabase
        .from('usuarios')
        .insert({
          alias,
          password_hash,
          tipo,
          id_empleado: tipo === 'EDITOR' ? id_empleado : null
        })
        .select()
        .single();

      if (error) {
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
}

export default AuthService;