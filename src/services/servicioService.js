import ServicioRepository from '../repositories/servicioRepository.js';
import ApiError from '../utils/ApiError.js';

class ServicioService {

  constructor() {
    this.servicioRepo = new ServicioRepository();
  }

  async obtenerPorId(id) {

    const servicio = await this.servicioRepo.obtenerPorId(id);

    if (!servicio) {
      throw new ApiError(
        'Servicio no encontrado',
        404
      );
    }

    return servicio.toAPI();
  }

  async obtenerTodos() {
    const servicios = await this.servicioRepo.obtenerTodos();
    return servicios.map(s => s.toAPI());
  }

  async crear(servicioData) {
    const servicio =
      await this.servicioRepo.crear(servicioData);

    return servicio.toAPI();
  }

  async actualizar(id, updateData) {

    const servicio =
      await this.servicioRepo.actualizar(id, updateData);

    return servicio.toAPI();
  }

  async eliminar(id) {

    const servicio =
      await this.servicioRepo.eliminar(id);

    return servicio.toAPI();
  }
}

export default ServicioService;