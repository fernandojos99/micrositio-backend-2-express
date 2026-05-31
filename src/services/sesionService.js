import SesionRepository from '../repositories/sesionRepository.js';
import ApiError from '../utils/ApiError.js';
import axios from 'axios';

const AGENT_API_URL = process.env.AGENT_API_URL || 'http://localhost:8000';

class SesionService {
  constructor() {
    this.sesionRepo = new SesionRepository();
  }

  async obtenerSesiones(id_empleado) {
    const sesiones = await this.sesionRepo.listarPorEmpleado(id_empleado);
    return {
      sessions: sesiones.map(s => s.toAPI()),
      count: sesiones.length
    };
  }

  async obtenerMensajes(thread_id) {
    try {
      const response = await axios.get(`${AGENT_API_URL}/sessions/${thread_id}/messages`);
      const data = response.data;
      if (data && Array.isArray(data.messages)) {
        data.messages = data.messages.filter(m => m.role !== 'tool');
      }
      return data;
    } catch (error) {
      throw new ApiError(`Error al obtener mensajes: ${error.message}`, 500);
    }
  }

  async eliminarSesion(thread_id, id_empleado) {
    const sesion = await this.sesionRepo.eliminar(thread_id, id_empleado);
    if (!sesion) {
      throw new ApiError('Sesión no encontrada', 404);
    }
    return sesion.toAPI();
  }

  async asegurarSesion(thread_id, id_empleado) {
    const existente = await this.sesionRepo.obtenerPorThreadId(thread_id);
    if (existente) {
      await this.sesionRepo.actualizarActualizado(thread_id);
    } else {
      await this.sesionRepo.crear({ thread_id, id_empleado });
    }
  }
}

export default SesionService;
