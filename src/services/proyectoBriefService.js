import { v4 as uuidv4 } from 'uuid';
import ProyectoBriefRepository from '../repositories/proyectoBriefRepository.js';
import ProyectoRepository from '../repositories/proyectoRepository.js';
import ProyectoBrief from '../models/ProyectoBrief.js';
import archivos from '../config/archivos.js';
import ApiError from '../utils/ApiError.js';

/** Bucket propio, como testing-card-docs o formato-docs. */
const BUCKET = 'brief-docs';

/** Qué se admite en cada ranura. El .pptx solo acepta presentaciones. */
const ADMITIDOS = {
  archivo: {
    carpeta: 'transcripts',
    extensiones: ['docx', 'doc', 'txt', 'pdf'],
    error: 'El brief admite .docx, .doc, .txt o .pdf'
  },
  pptx: {
    carpeta: 'presentaciones',
    extensiones: ['pptx', 'ppt'],
    error: 'La presentación tiene que ser un .pptx o .ppt'
  }
};

/**
 * Recupera el nombre original del archivo.
 *
 * Busboy, que es quien parsea el multipart por debajo de multer, decodifica el
 * nombre como latin-1. Un "reunión con Andrés.docx" llega entonces como
 * "reuniÃ³n con AndrÃ©s.docx". Se vuelve a leer como UTF-8, y si el resultado
 * no es válido se deja el original.
 */
function nombreEnUtf8(original = '') {
  const reinterpretado = Buffer.from(original, 'latin1').toString('utf8');
  return reinterpretado.includes('�') ? original : reinterpretado;
}

/**
 * Ruta del archivo dentro de su bucket, a partir de la URL pública guardada.
 *
 * La URL es `<base>/archivos/<bucket>/<carpeta>/<archivo>`, y el resto de
 * servicios de documentos recuperan la ruta tomando sus dos últimos
 * segmentos. Se sigue la misma convención para no inventar otra.
 */
function rutaDesdeUrl(url) {
  const segmentos = String(url).split('/').filter(Boolean);
  if (segmentos.length < 2) return null;

  return segmentos
    .slice(-2)
    .map((s) => decodeURIComponent(s))
    .join('/');
}

class ProyectoBriefService {
  constructor() {
    this.briefRepo = new ProyectoBriefRepository();
    this.proyectoRepo = new ProyectoRepository();
  }

  /** Falla con 404 si el proyecto no existe, para no guardar briefs huérfanos. */
  async exigirProyecto(id_proyecto) {
    const proyecto = await this.proyectoRepo.obtenerPorId(id_proyecto);
    if (!proyecto) {
      throw new ApiError('Proyecto no encontrado', 404);
    }
    return proyecto;
  }

  /**
   * Brief de un proyecto. Si nunca se ha guardado devuelve el vacío sin crear
   * la fila: así un GET no escribe en la base.
   */
  async obtener(id_proyecto) {
    await this.exigirProyecto(id_proyecto);

    const brief = await this.briefRepo.obtenerPorProyecto(id_proyecto);
    return (brief ?? ProyectoBrief.vacio(id_proyecto)).toAPI();
  }

  /** Guarda lo que devolvió el procesador. */
  async guardar(id_proyecto, cambios) {
    await this.exigirProyecto(id_proyecto);

    const brief = await this.briefRepo.guardar(id_proyecto, {
      ...cambios,
      ejecutado_en: cambios.ejecutado_en ?? new Date().toISOString()
    });

    return brief.toAPI();
  }

  /**
   * Guarda un archivo en disco y anota su referencia.
   *
   * Sigue la convención del resto del backend: nombre único con uuid
   * conservando la extensión, y en la base la URL pública completa.
   * @param {number} id_proyecto
   * @param {Object} file - el `req.file` de multer (memoryStorage)
   * @param {'archivo'|'pptx'} ranura
   */
  async subirArchivo(id_proyecto, file, ranura) {
    await this.exigirProyecto(id_proyecto);

    if (!file) {
      throw new ApiError('No se recibió ningún archivo', 400);
    }

    const nombre = nombreEnUtf8(file.originalname);

    const admitido = ADMITIDOS[ranura];
    const extension = (nombre.split('.').pop() || '').toLowerCase();
    if (!admitido.extensiones.includes(extension)) {
      throw new ApiError(admitido.error, 400);
    }

    const ruta = `${admitido.carpeta}/${id_proyecto}_${uuidv4()}.${extension}`;

    try {
      await archivos.subir(BUCKET, ruta, file.buffer, { contentType: file.mimetype });
    } catch (error) {
      throw new ApiError(`Error al guardar el archivo: ${error.message}`, 500);
    }

    const url = archivos.urlPublica(BUCKET, ruta);

    const cambios = ranura === 'pptx'
      ? { pptx_nombre: nombre, pptx_url: url, pptx_tamano: file.size }
      : {
        archivo_nombre: nombre,
        archivo_url: url,
        archivo_tipo: extension,
        archivo_tamano: file.size
      };

    const brief = await this.briefRepo.guardar(id_proyecto, cambios);
    return brief.toAPI();
  }

  /**
   * Deja el brief como si nunca se hubiera ejecutado: vacía la fila y borra
   * de disco el .docx y el .pptx.
   *
   * Hace falta un método aparte porque `guardar` no puede limpiar: resuelve
   * `ejecutado_en` con `??`, que también captura el null, así que enviar null
   * volvería a poner la fecha de ahora.
   * @param {number} id_proyecto
   */
  async limpiar(id_proyecto) {
    await this.exigirProyecto(id_proyecto);

    const brief = await this.briefRepo.obtenerPorProyecto(id_proyecto);

    // Los archivos se borran antes que la fila: si algo falla aquí, la
    // referencia sigue en la base y no quedan huérfanos invisibles.
    const rutas = [brief?.archivo_url, brief?.pptx_url]
      .filter(Boolean)
      .map(rutaDesdeUrl)
      .filter(Boolean);

    if (rutas.length > 0) {
      await archivos.borrar(BUCKET, rutas);
    }

    const limpio = await this.briefRepo.limpiar(id_proyecto);
    return limpio.toAPI();
  }
}

export default ProyectoBriefService;
