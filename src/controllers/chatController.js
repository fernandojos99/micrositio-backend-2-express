import axios from 'axios';
import ChatService from '../services/chatService.js';

class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  async ping(req, res, next) {
    try {
      const result = await this.chatService.ping();
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async stream(req, res, next) {
    const abortController = new AbortController();

    res.on('close', () => {
      abortController.abort();
    });

    try {
      const { message, thread_id } = req.body;
      const result = await this.chatService.streamChat(message, thread_id, req.user.id_empleado, abortController.signal);

      if (!result) return;

      const { stream, thread_id: resolvedThreadId } = result;

      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no'
      });

      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ type: 'thread_id', thread_id: resolvedThreadId })}\n\n`);
      }

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
