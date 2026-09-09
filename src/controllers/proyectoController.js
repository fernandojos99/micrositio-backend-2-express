// src/controllers/proyectoController.js
import ProyectoService from '../services/proyectoService.js';
import { proyectoCreateSchema, proyectoUpdateSchema, proyectoPorUsuarioSchema } from '../middlewares/validation/proyectoSchema.js';
import ApiError from '../utils/ApiError.js';
import { leerId } from '../utils/leerId.js';

class ProyectoController {
  constructor() {
    this.proyectoService = new ProyectoService();
  }

  /**
   * Obtiene un proyecto por su ID
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerProyecto(req, res, next) {
    console.log('[obtenerProyecto] Inicio - body:', req.body);
    try {
      const id_proyecto = Number(leerId(req, 'id_proyecto', 'id'));
      if (!id_proyecto) {
        throw new ApiError('Se requiere el identificador del proyecto', 400);
      }
      console.log(`[obtenerProyecto] Buscando proyecto con id: ${id_proyecto}`);
      const proyecto = await this.proyectoService.obtenerProyecto(id_proyecto);
      console.log('[obtenerProyecto] Proyecto encontrado:', proyecto);
      res.json(proyecto);
    } catch (error) {
      console.error('[obtenerProyecto] Error:', error.message);
      next(error);
    }
  }

  /**
   * Crea un nuevo proyecto
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async crearProyecto(req, res, next) {
    console.log('[crearProyecto] Inicio - body:', req.body);
    try {
      const validatedData = proyectoCreateSchema.parse(req.body);
      console.log('[crearProyecto] Datos validados:', validatedData);
      const proyecto = await this.proyectoService.crearProyecto(validatedData);
      console.log('[crearProyecto] Proyecto creado:', proyecto);
      res.status(201).json(proyecto);
    } catch (error) {
      console.error('[crearProyecto] Error:', error.message);
      next(error);
    }
  }

  /**
   * Actualiza un proyecto existente
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async actualizarProyecto(req, res, next) {
    console.log('[actualizarProyecto] Inicio - body:', req.body);
    try {
      const id_proyecto = leerId(req, 'id_proyecto', 'id');
      if (!id_proyecto) {
        throw new ApiError('Se requiere el identificador del proyecto', 400);
      }

      const { id_proyecto: _ignorado, ...updateData } = req.body;
      console.log(`[actualizarProyecto] ID proyecto: ${id_proyecto} - Datos a actualizar:`, updateData);
      const validatedData = proyectoUpdateSchema.parse(updateData);
      console.log('[actualizarProyecto] Datos validados:', validatedData);
      const proyecto = await this.proyectoService.actualizarProyecto(id_proyecto, validatedData);
      console.log('[actualizarProyecto] Proyecto actualizado:', proyecto);
      res.json(proyecto);
    } catch (error) {
      console.error('[actualizarProyecto] Error:', error.message);
      next(error);
    }
  }

  /**
   * Elimina un proyecto
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async eliminarProyecto(req, res, next) {
    console.log('[eliminarProyecto] Inicio - body:', req.body);
    try {
      const id_proyecto = leerId(req, 'id_proyecto', 'id');
      if (!id_proyecto) {
        throw new ApiError('Se requiere el identificador del proyecto', 400);
      }
      await this.proyectoService.eliminarProyecto(id_proyecto);
      console.log('[eliminarProyecto] Eliminación exitosa - 204 No Content');
      res.status(204).end();
    } catch (error) {
      console.error('[eliminarProyecto] Error:', error.message);
      next(error);
    }
  }

  /**
   * Lista todos los proyectos
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async listarProyectos(req, res, next) {
    console.log('[listarProyectos] Inicio - filtroProyectos:', req.filtroProyectos);
    try {
      const proyectos = await this.proyectoService.listarProyectos(req.filtroProyectos);
      console.log(`[listarProyectos] Encontrados ${proyectos.length} proyectos`);
      res.json(proyectos);
    } catch (error) {
      console.error('[listarProyectos] Error:', error.message);
      next(error);
    }
  }

  /**
   * Obtiene proyectos por ID de usuario
   * @param {Object} req - Request de Express
   * @param {Object} res - Response de Express
   * @param {Function} next - Next middleware
   */
  async obtenerProyectosPorIdUsuario(req, res, next) {
    console.log('[obtenerProyectosPorIdUsuario] Inicio - params:', req.params);
    try {
      const validatedData = proyectoPorUsuarioSchema.parse({ id_usuario: req.params.id_usuario });
      console.log(`[obtenerProyectosPorIdUsuario] ID usuario validado: ${validatedData.id_usuario}`);
      const proyectos = await this.proyectoService.obtenerProyectosPorIdUsuario(validatedData.id_usuario);
      console.log(`[obtenerProyectosPorIdUsuario] Encontrados ${proyectos.length} proyectos para usuario`);
      res.json({
        success: true,
        data: proyectos,
        total: proyectos.length
      });
    } catch (error) {
      console.error('[obtenerProyectosPorIdUsuario] Error:', error.message);
      next(error);
    }
  }
}

export default ProyectoController;