// src/controllers/usuarioController.js
/**
 * Controlador para manejar las operaciones CRUD de usuarios.
 * @class
 */
import UsuarioService from '../services/usuarioService.js';
import { usuarioCreateSchema, usuarioUpdateSchema, usuarioIdSchema, usuarioVisitanteCreateSchema } from '../middlewares/validation/usuarioSchema.js';
import ApiError from '../utils/ApiError.js';

class UsuarioController {
  constructor() {
    this.usuarioService = new UsuarioService();
  }

  /**
   * Obtiene todos los usuarios con filtros opcionales.
   * GET /usuarios
   * Query params: activo, tipo
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerTodos(req, res, next) {
    try {
      const filtros = {};
      
      // Aplicar filtros desde query params
      if (req.query.activo !== undefined) {
        filtros.activo = req.query.activo === 'true';
      }
      
      if (req.query.tipo && ['EDITOR', 'VISITANTE'].includes(req.query.tipo)) {
        filtros.tipo = req.query.tipo;
      }

      const usuarios = await this.usuarioService.obtenerTodos(filtros);
      
      res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene un usuario por su UUID.
   * GET /usuarios/:id
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerPorId(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validar UUID
      usuarioIdSchema.parse({ id_usuario: id });
      
      const usuario = await this.usuarioService.obtenerPorId(id);
      
      res.json({
        success: true,
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene usuarios por ID de empleado.
   * GET /usuarios/empleado/:id_empleado
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerPorIdEmpleado(req, res, next) {
    try {
      const id_empleado = parseInt(req.params.id_empleado);
      
      if (!id_empleado || id_empleado <= 0) {
        throw new ApiError('ID de empleado inválido', 400);
      }

      const usuarios = await this.usuarioService.obtenerPorIdEmpleado(id_empleado);
      
      res.json({
        success: true,
        data: usuarios,
        total: usuarios.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuevo usuario.
   * POST /usuarios
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async crear(req, res, next) {
    try {
      const validatedData = usuarioCreateSchema.parse(req.body);
      const usuario = await this.usuarioService.crear(validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crea un nuevo usuario visitante (solo alias y password).
   * POST /usuarios/visitante
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async crearVisitante(req, res, next) {
    try {
      const validatedData = usuarioVisitanteCreateSchema.parse(req.body);
      
      // Agregar tipo VISITANTE automáticamente
      const usuarioData = {
        ...validatedData,
        tipo: 'VISITANTE',
        id_empleado: null,
        activo: true
      };
      
      const usuario = await this.usuarioService.crear(usuarioData);
      
      res.status(201).json({
        success: true,
        message: 'Usuario visitante creado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualiza un usuario existente.
   * PATCH /usuarios/:id
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async actualizar(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validar UUID
      usuarioIdSchema.parse({ id_usuario: id });
      
      const validatedData = usuarioUpdateSchema.parse(req.body);
      const usuario = await this.usuarioService.actualizar(id, validatedData);
      
      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Da de baja a un usuario (activo = false).
   * PATCH /usuarios/:id/baja
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async darBaja(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validar UUID
      usuarioIdSchema.parse({ id_usuario: id });
      
      const usuario = await this.usuarioService.darBaja(id);
      
      res.json({
        success: true,
        message: 'Usuario dado de baja exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Da de alta a un usuario (activo = true).
   * PATCH /usuarios/:id/alta
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async darAlta(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validar UUID
      usuarioIdSchema.parse({ id_usuario: id });
      
      const usuario = await this.usuarioService.darAlta(id);
      
      res.json({
        success: true,
        message: 'Usuario dado de alta exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Asigna un empleado a un usuario. 
   * PATCH /usuarios/:id_usuario/asignarEmpleado/:id_empleado
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async asignarEmpleado(req, res, next) {
    try {
      const { id_usuario } = req.params;
      const { id_empleado } = req.body;

      const resultado = await this.usuarioService.asignarEmpleado(id_usuario, id_empleado);

      res.json({
        success: true,
        message: 'Empleado asignado exitosamente',
        data: resultado
      });
    } catch (error) {
      next(error);
    }
   }

  /**
   * Volver VISITANTE  en EDITOR
   * PATCH /usuarios/:id_usuario/asignarEmpleado/:id_empleado
   * @param {*} req 
   * @param {*} res 
   * @param {*} next 
   */
  async actualizarTipo(req, res, next) {
    try {
      const { id } = req.params;
      const { tipo } = req.body;

      if (tipo !== 'EDITOR' && tipo !== 'VISITANTE') {
        throw new ApiError('El tipo debe ser EDITOR o VISITANTE para esta operación', 400);
      }


      const resultado = await this.usuarioService.actualizarTipo(id, tipo);

      res.json({
        success: true,
        message: `El usuario ahora es ${tipo}`,
        data: resultado
      });
    } catch (error) {
      next(error);
    }
   }



  /**
   * Elimina un usuario de forma física.
   * DELETE /usuarios/:id
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async eliminar(req, res, next) {
    try {
      const { id } = req.params;
      
      // Validar UUID
      usuarioIdSchema.parse({ id_usuario: id });
      
      const usuario = await this.usuarioService.eliminar(id);
      
      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtiene estadísticas de usuarios.
   * GET /usuarios/estadisticas
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async obtenerEstadisticas(req, res, next) {
    try {
      const estadisticas = await this.usuarioService.obtenerEstadisticas();
      
      res.json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cambia la contraseña de un usuario.
   * PATCH /usuarios/:id/password
   * @param {Object} req - Request de Express.
   * @param {Object} res - Response de Express.
   * @param {Function} next - Función para pasar al siguiente middleware.
   */
  async cambiarPassword(req, res, next) {
    try {
      const { id } = req.params;
      const { password_actual, password_nueva } = req.body;
      
      // Validar UUID
      usuarioIdSchema.parse({ id_usuario: id });
      
      if (!password_actual || !password_nueva) {
        throw new ApiError('Se requieren password_actual y password_nueva', 400);
      }
      
      const usuario = await this.usuarioService.cambiarPassword(id, password_nueva, password_actual);
      
      res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente',
        data: usuario
      });
    } catch (error) {
      next(error);
    }
  }



/**
 * Para actualizar la imagen del usuario
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
async  uploadImage(req, res, next) {
  try {

    const userId = req.user.user_id;

    const result = await this.usuarioService.uploadUserImage(
      req.file,
      userId
    );

    res.json({
      message: "Imagen subida a Supabase",
      ...result
    });

  } catch (error) {
    next(error);
  }
}

}

export default UsuarioController;
