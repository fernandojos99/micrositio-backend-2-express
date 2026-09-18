import MetricaAccionableRepository from '../repositories/metricaAccionableRepository.js';
import ApiError from '../utils/ApiError.js';
import { evaluarMetrica } from '../utils/metricas.js';

class MetricaAccionableService {
  constructor() {
    this.metricaRepo = new MetricaAccionableRepository();
  }

  /** Añade el veredicto para que el front no tenga que recalcularlo. */
  conVeredicto(metrica) {
    return { ...metrica.toAPI(), cumplimiento: evaluarMetrica(metrica) };
  }

  async obtenerPorAccionable(id_accionable) {
    const metricas = await this.metricaRepo.obtenerPorAccionable(id_accionable);
    return metricas.map((m) => this.conVeredicto(m));
  }

  async crear(datos) {
    const metrica = await this.metricaRepo.crear(datos);
    return this.conVeredicto(metrica);
  }

  async actualizar(id, cambios) {
    const metrica = await this.metricaRepo.actualizar(id, cambios);

    if (!metrica) {
      throw new ApiError('Métrica de accionable no encontrada', 404);
    }

    return this.conVeredicto(metrica);
  }

  async eliminar(id) {
    const metrica = await this.metricaRepo.eliminar(id);

    if (!metrica) {
      throw new ApiError('Métrica de accionable no encontrada', 404);
    }

    return this.conVeredicto(metrica);
  }
}

export default MetricaAccionableService;
