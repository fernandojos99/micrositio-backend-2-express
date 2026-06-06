import SesionService from '../services/sesionService.js';

class SesionController {
  constructor() {
    this.sesionService = new SesionService();
  }

  async obtenerSesiones(req, res, next) {
    try {
      const data = await this.sesionService.obtenerSesiones(req.user.id_empleado);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async obtenerMensajes(req, res, next) {
    try {
      const { thread_id } = req.params;
      const data = await this.sesionService.obtenerMensajes(thread_id);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async generarTitulo(req, res, next) {
    try {
      const { thread_id } = req.params;
      const data = await this.sesionService.generarTitulo(thread_id, req.user.id_empleado);
      res.json(data);
    } catch (error) {
      next(error);
    }
  }

  async eliminarSesion(req, res, next) {
    try {
      const { thread_id } = req.params;
      const data = await this.sesionService.eliminarSesion(thread_id, req.user.id_empleado);
      res.json({ message: 'Sesión eliminada', sesion: data });
    } catch (error) {
      next(error);
    }
  }
}

export default SesionController;
