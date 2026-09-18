/**
 * Etapa en la que va un proyecto y lo capturado en cada pestaña.
 *
 * `datos` es un JSON libre a propósito: la maqueta todavía está cambiando de
 * forma, y así se puede guardar el brief, la propuesta editable y el avance sin
 * una tabla por cada uno. `es_maqueta` recuerda que eso se llenó con la maqueta
 * y falta implementarlo de verdad.
 * @class
 */
class ProyectoEtapa {
  constructor(data) {
    this.id_proyecto = data.id_proyecto;
    this.etapa_actual = data.etapa_actual;
    this.datos = data.datos ?? {};
    this.aprobado_por = data.aprobado_por ?? null;
    this.aprobado_en = data.aprobado_en ?? null;
    this.es_maqueta = data.es_maqueta ?? true;
    this.created_at = data.created_at ?? null;
    this.updated_at = data.updated_at ?? null;
  }

  /** Etapa por defecto de un proyecto del que todavía no se ha guardado nada. */
  static vacia(id_proyecto) {
    return new ProyectoEtapa({ id_proyecto, etapa_actual: 'BRIEF', datos: {} });
  }

  get aprobado() {
    return this.aprobado_en !== null;
  }

  toAPI() {
    return {
      id_proyecto: this.id_proyecto,
      etapa_actual: this.etapa_actual,
      datos: this.datos,
      aprobado: this.aprobado,
      aprobado_por: this.aprobado_por,
      aprobado_en: this.aprobado_en,
      es_maqueta: this.es_maqueta,
      creado: this.created_at,
      actualizado: this.updated_at
    };
  }
}

export default ProyectoEtapa;
