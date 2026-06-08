import SesionRepository from '../repositories/sesionRepository.js';
import ApiError from '../utils/ApiError.js';
import axios from 'axios';
//Trae la url del agente
import { AGENT_CONFIG } from '../config/agentConfig.js';

class SesionService {
  constructor() {
    this.sesionRepo = new SesionRepository();
  }

  async obtenerSesiones(id_empleado) {
    const sesiones = await this.sesionRepo.listarPorEmpleado(id_empleado);

    const sinTitulo = sesiones.filter(s => !s.titulo);
    if (sinTitulo.length > 0) {
      await Promise.allSettled(
        sinTitulo.map(async s => {
          try {
            const titulo = await this._generarTituloDesdeFastApi(s.thread_id);
            if (titulo) {
              await this.sesionRepo.actualizarTitulo(s.thread_id, titulo);
              s.titulo = titulo;
            }
          } catch {
            // si falla una sesión, no bloquear el resto
          }
        })
      );
    }

    return {
      sessions: sesiones.map(s => s.toAPI()),
      count: sesiones.length
    };
  }

  async _generarTituloDesdeFastApi(thread_id) {
    const response = await axios.get(`${AGENT_CONFIG.apiUrl}/sessions/${thread_id}/messages`);
    const messages = response.data?.messages;
    if (!Array.isArray(messages)) return null;

    const primerUsuario = messages.find(
      m => ['user', 'User', 'human', 'Human'].includes(m.role)
    );
    if (!primerUsuario?.content) return null;

    const limpio = primerUsuario.content.replace(/\s+/g, ' ').trim();
    const palabras = limpio.split(' ');
    return palabras.length > 5
      ? palabras.slice(0, 5).join(' ') + '...'
      : limpio;
  }

  async obtenerMensajes(thread_id) {
    try {
      const response = await axios.get(`${AGENT_CONFIG.apiUrl}/sessions/${thread_id}/messages`);
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

  async generarTitulo(thread_id, id_empleado) {
    const sesion = await this.sesionRepo.obtenerPorThreadId(thread_id);
    if (!sesion) {
      throw new ApiError('Sesión no encontrada', 404);
    }

    if (sesion.titulo) {
      return sesion.toAPI();
    }

    const titulo = await this._generarTituloDesdeFastApi(thread_id);
    if (!titulo) {
      throw new ApiError('No se pudo generar un título para la sesión', 400);
    }

    const actualizada = await this.sesionRepo.actualizarTitulo(thread_id, titulo);
    return actualizada.toAPI();
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
