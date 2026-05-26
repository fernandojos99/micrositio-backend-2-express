import axios from 'axios';
import ChatService from '../services/chatService.js';

class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  async stream(req, res, next) {
    const abortController = new AbortController();

    res.on('close', () => {
      abortController.abort();
    });

    try {
      const { message, thread_id } = req.body;
      const stream = await this.chatService.streamChat(message, thread_id, abortController.signal);

      if (!stream) return;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      stream.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            if (!res.writableEnded) res.write(`${line}\n\n`);
          }
        }
      });

      stream.on('end', () => {
        if (!res.writableEnded) res.end();
      });

      stream.on('error', (err) => {
        if (!axios.isCancel(err)) console.error('Stream error:', err);
        if (!res.writableEnded) res.end();
      });

    } catch (error) {
      if (!res.headersSent) next(error);
    }
  }
}

export default ChatController;
