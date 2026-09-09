import AuthService from '../services/authService.js';
import ApiError from '../utils/ApiError.js';
import { loginSchema, registroSchema } from '../middlewares/validation/authSchema.js';

class AuthController {
  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Maneja el login de usuarios
   */
  async login(req, res, next) {
    try {
      const { alias, password } = loginSchema.parse(req.body);

      const resultado = await this.authService.login(alias, password);

      res.json({
        success: true,
        message: 'Login exitoso',
        data: resultado
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja el registro de nuevos usuarios
   */
  async registro(req, res, next) {
    try {
      const datos = registroSchema.parse(req.body);

      // El tipo se fija aqui, no se lee del body: esta ruta es publica y
      // aceptarlo permitia darse de alta como EDITOR sin credenciales.
      const resultado = await this.authService.registro({ ...datos, tipo: 'VISITANTE' });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: resultado
      });

    } catch (error) {
      next(error);
    }
  }

  /**
   * Verifica si el token es válido
   */
  // async verificarToken(req, res, next) {
  //   try {

  //     const usuarioCompleto = await this.authService.obtenerUsuarioPorId(req.user.user_id);
  //     // El middleware ya verificó el token y agregó req.user
  //     res.json({
  //       success: true,
  //       message: 'Token válido',
  //       data: {
  //         usuario: req.user
  //       }
  //     });

  //   } catch (error) {
  //     next(error);
  //   }
  // }


  async verificarToken(req, res, next) {
    try {
      // El middleware ya verificó el token y agregó req.user
      // Consultamos la BD para obtener el usuario completo (incluye image)
      const usuarioCompleto = await this.authService.obtenerUsuarioPorId(req.user.user_id);
  
      res.json({
        success: true,
        message: 'Token válido',
        data: {
          usuario: usuarioCompleto
        }
      });
  
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;