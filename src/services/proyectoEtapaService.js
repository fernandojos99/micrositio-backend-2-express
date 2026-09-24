import ProyectoEtapaRepository from '../repositories/proyectoEtapaRepository.js';
import ProyectoRepository from '../repositories/proyectoRepository.js';
import ProyectoEtapa from '../models/ProyectoEtapa.js';
import ApiError from '../utils/ApiError.js';
import { evaluarMetrica, resumirMetricas } from '../utils/metricas.js';

/** Un número entero, vengan como vengan los conteos de Postgres. */
const entero = (valor) => Number(valor ?? 0);

/** Fecha pasada y sin terminar. */
const vencida = (secuencia) =>
  Boolean(secuencia.dia_fin) && secuencia.estado !== 'TERMINADO' &&
  secuencia.dia_fin < new Date().toISOString().slice(0, 10);

class ProyectoEtapaService {
  constructor() {
    this.etapaRepo = new ProyectoEtapaRepository();
    this.proyectoRepo = new ProyectoRepository();
  }

  /** Falla con 404 si el proyecto no existe, para no guardar etapas huérfanas. */
  async exigirProyecto(id_proyecto) {
    const proyecto = await this.proyectoRepo.obtenerPorId(id_proyecto);
    if (!proyecto) {
      throw new ApiError('Proyecto no encontrado', 404);
    }
    return proyecto;
  }

  /**
   * Etapa de un proyecto. Si nunca se ha guardado, devuelve la inicial sin
   * crear la fila: así un GET no escribe en la base.
   */
  async obtener(id_proyecto) {
    await this.exigirProyecto(id_proyecto);

    const etapa = await this.etapaRepo.obtenerPorProyecto(id_proyecto);
    return (etapa ?? ProyectoEtapa.vacia(id_proyecto)).toAPI();
  }

  /**
   * Avance del proyecto para el tablero: totales, métricas evaluadas,
   * accionables, equipo y secuencias vencidas.
   */
  async avance(id_proyecto) {
    await this.exigirProyecto(id_proyecto);

    const datos = await this.etapaRepo.avance(id_proyecto);

    const secuencias = datos.secuencias.map((s) => ({
      ...s,
      testing_cards: entero(s.testing_cards),
      testing_cards_terminadas: entero(s.testing_cards_terminadas),
      testing_cards_canceladas: entero(s.testing_cards_canceladas),
      learning_cards: entero(s.learning_cards),
      terminada: s.estado === 'TERMINADO',
      vencida: vencida(s),
    }));

    const suma = (campo) => secuencias.reduce((total, s) => total + s[campo], 0);

    const metricas = datos.metricas.map((m) => ({ ...m, cumplimiento: evaluarMetrica(m) }));
    const accionables = datos.accionables.map((a) => ({ ...a, realizado: Boolean(a.realizado) }));

    return {
      id_proyecto,
      totales: {
        secuencias: secuencias.length,
        secuencias_terminadas: secuencias.filter((s) => s.terminada).length,
        secuencias_vencidas: secuencias.filter((s) => s.vencida).length,
        testing_cards: suma('testing_cards'),
        testing_cards_terminadas: suma('testing_cards_terminadas'),
        testing_cards_canceladas: suma('testing_cards_canceladas'),
        learning_cards: suma('learning_cards'),
        learning_cards_por_estado: Object.fromEntries(
          datos.learningCardsPorEstado.map((fila) => [fila.estado, entero(fila.total)])
        ),
        accionables: accionables.length,
        accionables_realizados: accionables.filter((a) => a.realizado).length,
      },
      secuencias,
      learning_cards: datos.learningCards.map((lc) => ({ ...lc, accionables: entero(lc.accionables) })),
      metricas: { resumen: resumirMetricas(metricas), detalle: metricas },
      accionables,
      equipo: datos.equipo,
    };
  }

  async guardar(id_proyecto, cambios) {
    await this.exigirProyecto(id_proyecto);

    const etapa = await this.etapaRepo.guardar(id_proyecto, cambios);
    return etapa.toAPI();
  }

  /**
   * Aprueba el proyecto: publica las cards en borrador y desbloquea las etapas
   * siguientes. Aprobar dos veces no cambia nada más.
   */
  async aprobar(id_proyecto, id_usuario) {
    await this.exigirProyecto(id_proyecto);

    const resultado = await this.etapaRepo.aprobar(id_proyecto, id_usuario);
    return {
      ...resultado.etapa.toAPI(),
      testing_cards_publicadas: resultado.testing_cards_publicadas,
      learning_cards_publicadas: resultado.learning_cards_publicadas
    };
  }
}

export default ProyectoEtapaService;
