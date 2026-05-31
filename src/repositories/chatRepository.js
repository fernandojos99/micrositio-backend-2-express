import axios from 'axios';
import ApiError from '../utils/ApiError.js';

// const AGENT_API_URL = process.env.AGENT_API_URL || 'https://2iuf62w3yz3tdqbdtghk4n5suy0ygvcr.lambda-url.us-east-1.on.aws';

const AGENT_API_URL = 'http://localhost:8000'
class ChatRepository {
  async enviarMensaje(message, thread_id, signal) {
    try {
      const response = await axios({
        method: 'POST',
        url: `${AGENT_API_URL}/chat/stream`,
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
