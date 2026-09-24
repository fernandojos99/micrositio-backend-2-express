import ProyectoBriefService from '../services/proyectoBriefService.js';
import { proyectoBriefUpdateSchema } from '../middlewares/validation/proyectoBriefSchema.js';
import ApiError from '../utils/ApiError.js';

class ProyectoBriefController {
  constructor() {
    this.proyectoBriefService = new ProyectoBriefService();
  }

  leerIdProyecto(req) {
    const id = Number(req.params?.id_proyecto);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError('Se requiere un id_proyecto válido', 400);
    }
    return id;
  }

  async obtener(req, res, next) {
    try {
      const brief = await this.proyectoBriefService.obtener(this.leerIdProyecto(req));
      res.json(brief);
    } catch (error) {
      next(error);
    }
  }

  async guardar(req, res, next) {
    try {
      const validatedData = proyectoBriefUpdateSchema.parse(req.body);

      const brief = await this.proyectoBriefService.guardar(
        this.leerIdProyecto(req),
        validatedData
      );

      res.json(brief);
    } catch (error) {
      next(error);
    }
  }

  async subirArchivo(req, res, next) {
    try {
      const brief = await this.proyectoBriefService.subirArchivo(
        this.leerIdProyecto(req), req.file, 'archivo'
      );
      res.status(201).json(brief);
    } catch (error) {
      next(error);
    }
  }

  async subirPptx(req, res, next) {
    try {
      const brief = await this.proyectoBriefService.subirArchivo(
        this.leerIdProyecto(req), req.file, 'pptx'
      );
      res.status(201).json(brief);
    } catch (error) {
      next(error);
    }
  }

  async limpiar(req, res, next) {
    try {
      const brief = await this.proyectoBriefService.limpiar(this.leerIdProyecto(req));
      res.json(brief);
    } catch (error) {
      next(error);
    }
  }
}

export default ProyectoBriefController;
