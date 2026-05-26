import ChatRepository from '../repositories/chatRepository.js';
import ApiError from '../utils/ApiError.js';
import axios from 'axios';

class ChatService {
  constructor() {
    this.chatRepo = new ChatRepository();
  }

  async streamChat(message, thread_id, signal) {
    if (!message || typeof message !== 'string') {
      throw new ApiError('El campo "message" es requerido y debe ser un texto', 400);
    }

    try {
      return await this.chatRepo.enviarMensaje(message, thread_id, signal);
    } catch (error) {
      if (axios.isCancel(error)) {
        return null;
      }

      throw error;
    }
  }
}

export default ChatService;
