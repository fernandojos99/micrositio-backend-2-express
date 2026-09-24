/**
 * Métrica de validación de un accionable.
 *
 * Misma forma que las métricas de testing card (nombre + operador + criterio,
 * y un resultado que se llena después), pero colgando de un accionable: son
 * las que dicen si la acción propuesta en Ideación sirvió.
 * @class
 */
class MetricaAccionable {
  constructor(data) {
    this.id_metrica_accionable = data.id_metrica_accionable;
    this.id_accionable = data.id_accionable;
    this.nombre = data.nombre;
    this.operador = data.operador ?? null;
    this.criterio = data.criterio ?? null;
    this.resultado = data.resultado ?? null;
    this.created_at = data.created_at ?? null;
    this.updated_at = data.updated_at ?? null;
  }

  toAPI() {
    return {
      id_metrica_accionable: this.id_metrica_accionable,
      id_accionable: this.id_accionable,
      nombre: this.nombre,
      operador: this.operador,
      criterio: this.criterio,
      resultado: this.resultado,
      creado: this.created_at,
      actualizado: this.updated_at,
    };
  }
}

export default MetricaAccionable;
