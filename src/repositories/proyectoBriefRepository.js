/**
 * Repositorio de proyecto_brief: una fila por proyecto.
 * @class
 */
import { uno, upsertFilas, exigirFila } from '../config/db.js';
import { conMensaje } from '../utils/errorBd.js';
import ProyectoBrief from '../models/ProyectoBrief.js';

/** Columnas que se pueden guardar, para no colar nada que no sea de la tabla. */
const CAMPOS = [
  'nombre_proyecto', 'transcript_id', 'url', 'resumen', 'resumen_estructurado',
  'origen', 'archivo_nombre', 'archivo_url', 'archivo_tipo', 'archivo_tamano',
  'pptx_nombre', 'pptx_url', 'pptx_tamano', 'ejecutado_en'
];

class ProyectoBriefRepository {
  /**
   * Brief guardado de un proyecto, o null si nunca se ha guardado nada.
   * @param {number} id_proyecto
   * @returns {Promise<ProyectoBrief|null>}
   */
  async obtenerPorProyecto(id_proyecto) {
    const data = await conMensaje('Error al obtener el brief del proyecto',
      uno('SELECT * FROM proyecto_brief WHERE id_proyecto = $1', [id_proyecto]));

    return data ? new ProyectoBrief(data) : null;
  }

  /**
   * Crea o actualiza el brief. Solo pisa los campos que llegan: así subir el
   * .pptx no borra el resultado de Ejecutar, ni al revés.
   * @param {number} id_proyecto
   * @param {Object} cambios
   * @returns {Promise<ProyectoBrief>}
   */
  async guardar(id_proyecto, cambios) {
    const actual = await this.obtenerPorProyecto(id_proyecto);

    const fila = { id_proyecto, updated_at: new Date().toISOString() };
    for (const campo of CAMPOS) {
      fila[campo] = cambios[campo] !== undefined ? cambios[campo] : (actual?.[campo] ?? null);
    }

    const data = await conMensaje('Error al guardar el brief del proyecto',
      exigirFila(upsertFilas('proyecto_brief', fila, ['id_proyecto'])));

    return new ProyectoBrief(data);
  }
}

export default ProyectoBriefRepository;
