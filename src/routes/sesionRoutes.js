import { Router } from 'express';
import SesionController from '../controllers/sesionController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();
const sesionController = new SesionController();

router.get('/sessions', authMiddleware, sesionController.obtenerSesiones.bind(sesionController));
router.get('/sessions/:thread_id/messages', authMiddleware, sesionController.obtenerMensajes.bind(sesionController));
router.delete('/sessions/:thread_id', authMiddleware, sesionController.eliminarSesion.bind(sesionController));

export default router;
