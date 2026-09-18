/**
 * Brief de un proyecto: lo que devuelve el procesador de transcripts al
 * pulsar Ejecutar, más los archivos que lo acompañan.
 *
 * Una fila por proyecto. De los archivos solo se guarda la referencia (nombre,
 * URL pública y tamaño); el binario vive en disco, en el bucket `brief-docs`.
 * @class
 */
class ProyectoBrief {
  constructor(data) {
    this.id_proyecto = data.id_proyecto;
    this.nombre_proyecto = data.nombre_proyecto ?? null;
    this.transcript_id = data.transcript_id ?? null;
    this.url = data.url ?? null;
    this.resumen = data.resumen ?? null;
    this.resumen_estructurado = data.resumen_estructurado ?? null;
    this.origen = data.origen ?? null;
    this.archivo_nombre = data.archivo_nombre ?? null;
    this.archivo_url = data.archivo_url ?? null;
    this.archivo_tipo = data.archivo_tipo ?? null;
    this.archivo_tamano = data.archivo_tamano ?? null;
    this.pptx_nombre = data.pptx_nombre ?? null;
    this.pptx_url = data.pptx_url ?? null;
    this.pptx_tamano = data.pptx_tamano ?? null;
    this.ejecutado_en = data.ejecutado_en ?? null;
    this.created_at = data.created_at ?? null;
    this.updated_at = data.updated_at ?? null;
  }

  /** Brief de un proyecto del que todavía no se ha guardado nada. */
  static vacio(id_proyecto) {
    return new ProyectoBrief({ id_proyecto });
  }

  /** ¿Se ha ejecutado alguna vez el procesador? */
  get ejecutado() {
    return this.transcript_id !== null || this.url !== null;
  }

  toAPI() {
    return {
      id_proyecto: this.id_proyecto,
      nombre_proyecto: this.nombre_proyecto,
      transcript_id: this.transcript_id,
      url: this.url,
      resumen: this.resumen,
      resumen_estructurado: this.resumen_estructurado,
      origen: this.origen,
      ejecutado: this.ejecutado,
      archivo: this.archivo_url
        ? {
          nombre: this.archivo_nombre,
          url: this.archivo_url,
          tipo: this.archivo_tipo,
          tamano: this.archivo_tamano
        }
        : null,
      pptx: this.pptx_url
        ? {
          nombre: this.pptx_nombre,
          url: this.pptx_url,
          tamano: this.pptx_tamano
        }
        : null,
      ejecutado_en: this.ejecutado_en,
      creado: this.created_at,
      actualizado: this.updated_at
    };
  }
}

export default ProyectoBrief;
