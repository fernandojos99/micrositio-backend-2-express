/**
 * Repositorio de proyecto_etapa: una fila por proyecto.
 * @class
 */
import { consulta, uno, ejecutar, upsertFilas, exigirFila, transaccion } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ProyectoEtapa from '../models/ProyectoEtapa.js';

class ProyectoEtapaRepository {
  /**
   * Etapa guardada de un proyecto, o null si nunca se ha guardado nada.
   * @param {number} id_proyecto
   * @returns {Promise<ProyectoEtapa|null>}
   */
  async obtenerPorProyecto(id_proyecto) {
    const data = await conMensaje('Error al obtener la etapa del proyecto',
      uno('SELECT * FROM proyecto_etapa WHERE id_proyecto = $1', [id_proyecto]));

    return data ? new ProyectoEtapa(data) : null;
  }

  /**
   * Crea o reemplaza la etapa del proyecto. No toca la aprobación: de eso se
   * encarga aprobar(), para que un guardado normal no pueda aprobar por error.
   * @param {number} id_proyecto
   * @param {{etapa_actual?: string, datos?: Object, es_maqueta?: boolean}} cambios
   * @returns {Promise<ProyectoEtapa>}
   */
  async guardar(id_proyecto, cambios) {
    const actual = await this.obtenerPorProyecto(id_proyecto);

    const fila = {
      id_proyecto,
      etapa_actual: cambios.etapa_actual ?? actual?.etapa_actual ?? 'BRIEF',
      datos: cambios.datos ?? actual?.datos ?? {},
      es_maqueta: cambios.es_maqueta ?? actual?.es_maqueta ?? true,
      aprobado_por: actual?.aprobado_por ?? null,
      aprobado_en: actual?.aprobado_en ?? null,
      updated_at: new Date().toISOString()
    };

    const data = await conMensaje('Error al guardar la etapa del proyecto',
      exigirFila(upsertFilas('proyecto_etapa', fila, ['id_proyecto'])));

    return new ProyectoEtapa(data);
  }

  /**
   * Todo lo que necesita el tablero de un proyecto, en 5 consultas agregadas.
   *
   * Antes esto obligaba al front a encadenar una petición por secuencia, por
   * testing card y por learning card: en el proyecto más activo, unas sesenta.
   * Las cards en borrador quedan fuera: todavía no son parte del proyecto.
   * @param {number} id_proyecto
   */
  async avance(id_proyecto) {
    const secuencias = await conMensaje('Error al obtener el avance de las secuencias',
      consulta(`
        SELECT s.id_secuencia, s.nombre, s.estado, s.dia_inicio, s.dia_fin,
               count(DISTINCT tc.id_testing_card) AS testing_cards,
               count(DISTINCT tc.id_testing_card) FILTER (WHERE tc.status = 'TERMINADO') AS testing_cards_terminadas,
               count(DISTINCT tc.id_testing_card) FILTER (WHERE tc.status = 'CANCELADO') AS testing_cards_canceladas,
               count(DISTINCT lc.id) AS learning_cards
        FROM secuencia s
        LEFT JOIN testing_card tc ON tc.id_secuencia = s.id_secuencia AND tc.es_borrador = false
        LEFT JOIN learning_card lc ON lc.id_testing_card = tc.id_testing_card AND lc.es_borrador = false
        WHERE s.id_proyecto = $1
        GROUP BY s.id_secuencia, s.nombre, s.estado, s.dia_inicio, s.dia_fin
        ORDER BY s.id_secuencia`, [id_proyecto]));

    const learningCardsPorEstado = await conMensaje('Error al obtener las learning cards del proyecto',
      consulta(`
        SELECT lc.estado, count(*) AS total
        FROM learning_card lc
        JOIN testing_card tc ON tc.id_testing_card = lc.id_testing_card AND tc.es_borrador = false
        JOIN secuencia s ON s.id_secuencia = tc.id_secuencia
        WHERE s.id_proyecto = $1 AND lc.es_borrador = false
        GROUP BY lc.estado`, [id_proyecto]));

    // Con su hallazgo: es de donde Ideación propone los accionables.
    const learningCards = await conMensaje('Error al obtener el detalle de learning cards',
      consulta(`
        SELECT lc.id AS id_learning_card, lc.estado, lc.hallazgo, lc.resultado,
               tc.id_testing_card, tc.titulo AS testing_card,
               s.id_secuencia, s.nombre AS secuencia,
               count(a.id_accionable) AS accionables
        FROM learning_card lc
        JOIN testing_card tc ON tc.id_testing_card = lc.id_testing_card AND tc.es_borrador = false
        JOIN secuencia s ON s.id_secuencia = tc.id_secuencia
        LEFT JOIN accionable a ON a.id_learning_card = lc.id
        WHERE s.id_proyecto = $1 AND lc.es_borrador = false
        GROUP BY lc.id, lc.estado, lc.hallazgo, lc.resultado, tc.id_testing_card, tc.titulo, s.id_secuencia, s.nombre
        ORDER BY s.id_secuencia, tc.id_testing_card, lc.id`, [id_proyecto]));

    const metricas = await conMensaje('Error al obtener las métricas del proyecto',
      consulta(`
        SELECT m.id_metrica, m.nombre, m.operador, m.criterio, m.resultado,
               tc.id_testing_card, tc.titulo AS testing_card,
               s.id_secuencia, s.nombre AS secuencia
        FROM metrica_testing_card m
        JOIN testing_card tc ON tc.id_testing_card = m.id_testing_card AND tc.es_borrador = false
        JOIN secuencia s ON s.id_secuencia = tc.id_secuencia
        WHERE s.id_proyecto = $1
        ORDER BY s.id_secuencia, tc.id_testing_card, m.id_metrica`, [id_proyecto]));

    const accionables = await conMensaje('Error al obtener los accionables del proyecto',
      consulta(`
        SELECT a.id_accionable, a.id_learning_card, a.contenido, a.impacto, a.esfuerzo, a.realizado,
               tc.id_testing_card, s.id_secuencia, s.nombre AS secuencia
        FROM accionable a
        JOIN learning_card lc ON lc.id = a.id_learning_card AND lc.es_borrador = false
        JOIN testing_card tc ON tc.id_testing_card = lc.id_testing_card AND tc.es_borrador = false
        JOIN secuencia s ON s.id_secuencia = tc.id_secuencia
        WHERE s.id_proyecto = $1
        ORDER BY a.id_accionable`, [id_proyecto]));

    const equipo = await conMensaje('Error al obtener el equipo del proyecto',
      consulta(`
        SELECT e.id_empleado, e.nombre_pila, e.apellido_paterno, e.cargo, e.image, cp.activo,
               (p.id_lider = e.id_empleado) AS es_lider
        FROM celula_proyecto cp
        JOIN empleado e ON e.id_empleado = cp.id_empleado
        JOIN proyecto p ON p.id_proyecto = cp.id_proyecto
        WHERE cp.id_proyecto = $1
        ORDER BY es_lider DESC, e.nombre_pila`, [id_proyecto]));

    return { secuencias, learningCardsPorEstado, learningCards, metricas, accionables, equipo };
  }

  /**
   * Aprueba el proyecto y publica sus cards en borrador, todo o nada.
   * @param {number} id_proyecto
   * @param {string} id_usuario - UUID del ADMIN que aprueba
   * @returns {Promise<{etapa: ProyectoEtapa, testing_cards_publicadas: number, learning_cards_publicadas: number}>}
   */
  async aprobar(id_proyecto, id_usuario) {
    return transaccion(async () => {
      const etapa = await this.guardar(id_proyecto, {});

      const data = await conMensaje('Error al aprobar el proyecto',
        exigirFila(upsertFilas('proyecto_etapa', {
          ...etapa,
          aprobado_por: id_usuario,
          aprobado_en: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, ['id_proyecto'])));

      // Las cards propuestas por el plan de trabajo dejan de ser borrador y
      // aparecen en el resto de la aplicación.
      const testing = await conMensaje('Error al publicar las testing cards',
        ejecutar(`UPDATE testing_card SET es_borrador = false, updated_at = now()
                  WHERE es_borrador = true
                    AND id_secuencia IN (SELECT id_secuencia FROM secuencia WHERE id_proyecto = $1)`,
          [id_proyecto]));

      const learning = await conMensaje('Error al publicar las learning cards',
        ejecutar(`UPDATE learning_card SET es_borrador = false, updated_at = now()
                  WHERE es_borrador = true
                    AND id_testing_card IN (
                      SELECT tc.id_testing_card FROM testing_card tc
                      JOIN secuencia s ON s.id_secuencia = tc.id_secuencia
                      WHERE s.id_proyecto = $1)`,
          [id_proyecto]));

      return {
        etapa: new ProyectoEtapa(data),
        testing_cards_publicadas: testing,
        learning_cards_publicadas: learning
      };
    });
  }
}

export default ProyectoEtapaRepository;
