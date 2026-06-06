class Sesion {
  constructor(data) {
    this.id_session = data.id_session;
    this.id_empleado = data.id_empleado;
    this.thread_id = data.thread_id;
    this.titulo = data.titulo || null;
    this.created_at = new Date(data.created_at || Date.now());
    this.updated_at = new Date(data.updated_at || Date.now());
  }

  static fromDatabase(dbData) {
    return new Sesion({
      id_session: dbData.id_session,
      id_empleado: dbData.id_empleado,
      thread_id: dbData.thread_id,
      titulo: dbData.titulo,
      created_at: dbData.created_at,
      updated_at: dbData.updated_at
    });
  }

  toAPI() {
    return {
      thread_id: this.thread_id,
      titulo: this.titulo,
      last_update: this.updated_at.toISOString(),
      created_at: this.created_at.toISOString()
    };
  }
}

export default Sesion;
