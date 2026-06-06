import ChatRepository from '../repositories/chatRepository.js';
import SesionService from './sesionService.js';
import ApiError from '../utils/ApiError.js';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

class ChatService {
  constructor() {
    this.chatRepo = new ChatRepository();
    this.sesionService = new SesionService();
  }

  async ping() {
    return await this.chatRepo.ping();
  }

  async streamChat(message, thread_id, id_empleado, signal) {
    if (!message || typeof message !== 'string') {
      throw new ApiError('El campo "message" es requerido y debe ser un texto', 400);
    }

    let sesionThreadId = thread_id;

    if (!sesionThreadId) {
      sesionThreadId = uuidv4();
    }

    try {
      await this.sesionService.asegurarSesion(sesionThreadId, id_empleado);

      const stream = await this.chatRepo.enviarMensaje(message, sesionThreadId, signal);
      return { stream, thread_id: sesionThreadId };
    } catch (error) {
      if (axios.isCancel(error)) {
        return null;
      }

      throw error;
    }
  }
}

export default ChatService;
