export default class Habilidad {
  constructor(data) {
    this.id_habilidad = data.id_habilidad;
    this.id_empleado = data.id_empleado;
    this.nombre_habilidad = data.nombre;
    this.nivel = data.nivel;
    this.nombre_habilidad = data.nombre_habilidad;
    // añade otros campos si los tienes
  }

    fromRow() {
    return {
      id_habilidad: this.id_habilidad,
      id_empleado: this.id_empleado,
      nombre: this.nombre,
      nivel: this.nivel,
      nombre_habilidad: this.nombre_habilidad,
 /*      created_at: this.created_at,
      updated_at: this.updated_at */
    };
  }
}