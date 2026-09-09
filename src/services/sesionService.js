import SesionRepository from '../repositories/sesionRepository.js';
import ApiError from '../utils/ApiError.js';
import axios from 'axios';
import { AGENT_CONFIG } from '../config/agentConfig.js';

class SesionService {
  constructor() {
    this.sesionRepo = new SesionRepository();
    // Cola de tareas en memoria - permitimos regeneración
    this.taskQueue = new Map(); // thread_id -> { promise, status, timestamp, version }
    this.versionCounter = new Map(); // thread_id -> version actual
  }

  async obtenerSesiones(id_empleado) {
    const sesiones = await this.sesionRepo.listarPorEmpleado(id_empleado);

    // Filtrar sesiones sin título para generar
    const sinTitulo = sesiones.filter(s => !s.titulo);
    
    // Lanzar tareas en segundo plano para las que no tienen título
    if (sinTitulo.length > 0) {
      sinTitulo.forEach(s => {
        this._generarTituloEnBackground(s.thread_id);
      });
    }

    // Devolver inmediatamente con los títulos existentes
    return {
      sessions: sesiones.map(s => s.toAPI()),
      count: sesiones.length,
      pendingTitles: sinTitulo.map(s => s.thread_id) // IDs de títulos en generación
    };
  }

  async _generarTituloEnBackground(thread_id) {
    // Incrementar versión para esta sesión
    const currentVersion = (this.versionCounter.get(thread_id) || 0) + 1;
    this.versionCounter.set(thread_id, currentVersion);

    // Si ya hay una tarea en curso, la reemplazamos (permitimos duplicados)
    if (this.taskQueue.has(thread_id)) {
    }

    const promise = (async () => {
      try {
        const titulo = await this._generarTituloDesdeFastApi(thread_id);
        
        // Verificar que no haya una versión más nueva en cola
        if (this.versionCounter.get(thread_id) !== currentVersion) {
          return;
        }

        if (titulo) {
          await this.sesionRepo.actualizarTitulo(thread_id, titulo);
        } else {
        }
      } catch (error) {
        console.error(`❌ Error generando título para ${thread_id} (v${currentVersion}):`, error.message);
      } finally {
        // Limpiar de la cola solo si es la versión actual
        if (this.versionCounter.get(thread_id) === currentVersion) {
          this.taskQueue.delete(thread_id);
        }
      }
    })();

    this.taskQueue.set(thread_id, { 
      promise, 
      status: 'pending',
      timestamp: Date.now(),
      version: currentVersion
    });

    return promise;
  }

  async _generarTituloDesdeFastApi(thread_id) {
    try {
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
    } catch (error) {
      console.error(`Error en _generarTituloDesdeFastApi para ${thread_id}:`, error.message);
      return null;
    }
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
    // Limpiar de la cola si existe
    this.taskQueue.delete(thread_id);
    this.versionCounter.delete(thread_id);
    return sesion.toAPI();
  }

  async generarTitulo(thread_id, id_empleado) {
    const sesion = await this.sesionRepo.obtenerPorThreadId(thread_id);
    if (!sesion) {
      throw new ApiError('Sesión no encontrada', 404);
    }

    // Siempre regenerar el título (permite duplicados)
    this._generarTituloEnBackground(thread_id);

    // Devolver la sesión con estado de generación
    return {
      ...sesion.toAPI(),
      titulo: sesion.titulo || null, // Mantener el título existente mientras se regenera
      status: 'regenerating',
      thread_id: thread_id
    };
  }

  async asegurarSesion(thread_id, id_empleado) {
    const existente = await this.sesionRepo.obtenerPorThreadId(thread_id);
    if (existente) {
      await this.sesionRepo.actualizarActualizado(thread_id);
    } else {
      await this.sesionRepo.crear({ thread_id, id_empleado });
    }
  }

  // Método para verificar estado de generación de un título
  async obtenerEstadoTitulo(thread_id) {
    const task = this.taskQueue.get(thread_id);
    const sesion = await this.sesionRepo.obtenerPorThreadId(thread_id);
    
    if (!sesion) {
      return {
        thread_id,
        status: 'not_found',
        titulo: null
      };
    }

    if (task) {
      return {
        thread_id,
        status: task.status,
        titulo: sesion.titulo || null,
        version: task.version,
        timestamp: task.timestamp
      };
    }

    return {
      thread_id,
      status: sesion.titulo ? 'completed' : 'pending',
      titulo: sesion.titulo || null,
      version: this.versionCounter.get(thread_id) || 0
    };
  }

  // Método para obtener todas las tareas pendientes
  obtenerTareasPendientes() {
    const pending = [];
    for (const [thread_id, task] of this.taskQueue) {
      pending.push({
        thread_id,
        status: task.status,
        version: task.version,
        timestamp: task.timestamp
      });
    }
    return pending;
  }

  // Método para forzar regeneración de título (permite duplicados)
  async regenerarTitulo(thread_id) {
    const sesion = await this.sesionRepo.obtenerPorThreadId(thread_id);
    if (!sesion) {
      throw new ApiError('Sesión no encontrada', 404);
    }

    // No limpiar el título existente, permitir duplicados
    this._generarTituloEnBackground(thread_id);

    return {
      thread_id,
      status: 'regenerating',
      titulo_actual: sesion.titulo || null,
      message: 'Regeneración de título iniciada (se permiten duplicados)'
    };
  }

  // Método para obtener historial de versiones (opcional)
  async obtenerHistorialVersiones(thread_id) {
    const sesion = await this.sesionRepo.obtenerPorThreadId(thread_id);
    if (!sesion) {
      throw new ApiError('Sesión no encontrada', 404);
    }

    const version = this.versionCounter.get(thread_id) || 0;
    const task = this.taskQueue.get(thread_id);

    return {
      thread_id,
      titulo_actual: sesion.titulo,
      ultima_version: version,
      tarea_pendiente: task ? {
        version: task.version,
        timestamp: task.timestamp,
        status: task.status
      } : null,
      historial: await this._obtenerHistorialTitulos(thread_id) // Si tienes historial en DB
    };
  }

  // Método privado para obtener historial (si lo implementas en DB)
  async _obtenerHistorialTitulos(thread_id) {
    // Aquí podrías implementar un historial en la base de datos
    // Por ahora retornamos un array vacío
    return [];
  }
}

export default SesionService;