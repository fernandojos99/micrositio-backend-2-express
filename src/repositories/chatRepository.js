import axios from 'axios';
import ApiError from '../utils/ApiError.js';
//trae la url del agente
import { AGENT_CONFIG } from '../config/agentConfig.js';
class ChatRepository {
  async enviarMensaje(message, thread_id, signal) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${AGENT_CONFIG.apiUrl}/chat/stream`,
        data: { message, thread_id },
        responseType: 'stream',
        signal
      });

      return response.data;
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }

      throw new ApiError(`Error de conexión con el agente: ${error.message}`, 500);
    }
  }
}

export default ChatRepository;
