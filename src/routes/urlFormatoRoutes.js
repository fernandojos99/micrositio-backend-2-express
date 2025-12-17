// src/routes/urlFormatoRoutes.js
import express from 'express';
import UrlFormatoController from '../controllers/urlFormatoController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();
const urlFormatoController = new UrlFormatoController();

// Rutas para URLs formato (RESTful)
router.post('/crear', authMiddleware, urlFormatoController.crear.bind(urlFormatoController));
router.get('/', authMiddleware, urlFormatoController.obtenerTodas.bind(urlFormatoController));
router.get('/:id', authMiddleware, urlFormatoController.obtenerPorId.bind(urlFormatoController));
router.patch('/:id', authMiddleware, urlFormatoController.actualizar.bind(urlFormatoController));
router.delete('/:id', authMiddleware, urlFormatoController.eliminar.bind(urlFormatoController));

export default router;