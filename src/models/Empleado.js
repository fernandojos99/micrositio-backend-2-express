// src/models/Empleado.js
import { empleadoCreateSchema, empleadoUpdateSchema } from '../middlewares/validation/empleadoSchema.js';
import ApiError from '../utils/ApiError.js';

class Empleado {
  constructor(data = {}) {
    this.id_empleado = data.id_empleado ?? null;

    this.nombre_pila = data.nombre_pila ?? "";
    this.apellido_paterno = data.apellido_paterno ?? "";
    this.apellido_materno = data.apellido_materno ?? null;

    this.celular = data.celular ?? null;
    this.correo = data.correo ?? "";
    this.numero_empleado = data.numero_empleado ?? "";

    this.activo = data.activo ?? true;

    // ✅ Manejo seguro de fechas
    this.fecha_ingreso = this.parseDate(data.fecha_ingreso, new Date());
    this.updated_at = this.parseDate(data.updated_at, new Date());

    // ✅ nuevos campos
    this.cargo = data.cargo ?? "";
    this.departamento = data.departamento ?? "";
    this.infopersonal = data.infopersonal ?? "";
  }

  // 🔥 helper reutilizable
  parseDate(value, fallback = null) {
    const date = new Date(value);
    return isNaN(date.getTime()) ? fallback : date;
  }

  static validateCreate(data) {
    try {
      return empleadoCreateSchema.parse(data);
    } catch (error) {
      throw new ApiError(
        `Validación fallida: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }
  }

  static validateUpdate(data) {
    try {
      return empleadoUpdateSchema.parse(data);
    } catch (error) {
      throw new ApiError(
        `Validación fallida: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }
  }

  static fromDatabase(dbData = {}) {
    return new Empleado({
      id_empleado: dbData.id_empleado,
      nombre_pila: dbData.nombre_pila,
      apellido_paterno: dbData.apellido_paterno,
      apellido_materno: dbData.apellido_materno,
      celular: dbData.celular,
      correo: dbData.correo,
      numero_empleado: dbData.numero_empleado,
      activo: dbData.activo,
      fecha_ingreso: dbData.fecha_ingreso,
      updated_at: dbData.updated_at,

      cargo: dbData.cargo,
      departamento: dbData.departamento,
      infopersonal: dbData.infopersonal
    });
  }

  // 🔥 helper para evitar romper con toISOString
  safeToISOString(date) {
    return date instanceof Date && !isNaN(date)
      ? date.toISOString()
      : null;
  }

  toDatabase() {
    return {
      nombre_pila: this.nombre_pila,
      apellido_paterno: this.apellido_paterno,
      apellido_materno: this.apellido_materno,
      celular: this.celular,
      correo: this.correo,
      numero_empleado: this.numero_empleado,
      activo: this.activo,
      cargo: this.cargo,
      departamento: this.departamento,
      infopersonal: this.infopersonal,
      fecha_ingreso: this.safeToISOString(this.fecha_ingreso)
    };
  }

  toAPI() {
    return {
      id: this.id_empleado,
      nombre_pila: this.nombre_pila,
      apellido_paterno: this.apellido_paterno,
      apellido_materno: this.apellido_materno,
      celular: this.celular,
      correo: this.correo,
      numero_empleado: this.numero_empleado,
      activo: this.activo,
      fecha_ingreso: this.safeToISOString(this.fecha_ingreso),
      actualizado: this.safeToISOString(this.updated_at),

      cargo: this.cargo,
      departamento: this.departamento,
      infopersonal: this.infopersonal
    };
  }
}

export default Empleado;