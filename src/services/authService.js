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
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('alias', alias)
        .eq('activo', true)
        .single();

      if (userError || !usuario) {
        throw new ApiError('Credenciales inválidas', 401);
      }

      // 2. Verificar password
      const passwordValido = await bcrypt.compare(password, usuario.password_hash);
      if (!passwordValido) {
        throw new ApiError('Credenciales inválidas', 401);
      }

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



  /**
 * Obtiene un usuario completo desde la BD por su ID
 */
async obtenerUsuarioPorId(id_usuario) {
  try {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id_usuario', id_usuario)
      .single();

    if (error || !usuario) {
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