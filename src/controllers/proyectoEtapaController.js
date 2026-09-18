import ProyectoEtapaService from '../services/proyectoEtapaService.js';
import { proyectoEtapaUpdateSchema } from '../middlewares/validation/proyectoEtapaSchema.js';
import ApiError from '../utils/ApiError.js';

class ProyectoEtapaController {
  constructor() {
    this.proyectoEtapaService = new ProyectoEtapaService();
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
      const etapa = await this.proyectoEtapaService.obtener(this.leerIdProyecto(req));
      res.json(etapa);
    } catch (error) {
      next(error);
    }
  }

  async avance(req, res, next) {
    try {
      const avance = await this.proyectoEtapaService.avance(this.leerIdProyecto(req));
      res.json(avance);
    } catch (error) {
      next(error);
    }
  }

  async guardar(req, res, next) {
    try {
      const validatedData = proyectoEtapaUpdateSchema.parse(req.body);

      const etapa = await this.proyectoEtapaService.guardar(
        this.leerIdProyecto(req),
        validatedData
      );

      res.json(etapa);
    } catch (error) {
      next(error);
    }
  }

  async aprobar(req, res, next) {
    try {
      const etapa = await this.proyectoEtapaService.aprobar(
        this.leerIdProyecto(req),
        req.user.user_id
      );

      res.json(etapa);
    } catch (error) {
      next(error);
    }
  }
}

export default ProyectoEtapaController;
