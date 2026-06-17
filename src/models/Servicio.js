class Servicio {
    constructor(data) {
      this.id = data.id;
      this.nombre = data.nombre;
      this.descripcion = data.descripcion;
      this.objetivo = data.objetivo;
      this.entregables = data.entregables;
      this.precio_aprox = data.precio_aprox;
      this.horas_totales = data.horas_totales;
      this.categoria = data.categoria;
      this.created_at = data.created_at;
      this.updated_at = data.updated_at;
    }
  
    toAPI() {
      return {
        id: this.id,
        nombre: this.nombre,
        descripcion: this.descripcion,
        objetivo: this.objetivo,
        entregables: this.entregables,
        precio_aprox: this.precio_aprox,
        horas_totales: this.horas_totales,
        categoria: this.categoria,
        created_at: this.created_at,
        updated_at: this.updated_at
      };
    }
  }
  
  export default Servicio;