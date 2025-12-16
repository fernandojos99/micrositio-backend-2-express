// src/routes/urlFormatoRoutes.js
import express from 'express';
import UrlFormatoController from '../controllers/urlFormatoController.js';

const router = express.Router();
const urlFormatoController = new UrlFormatoController();

// Rutas para URLs formato
router.get('/obtener-por-id', urlFormatoController.obtenerPorId.bind(urlFormatoController));
router.get('/obtener-todas', urlFormatoController.obtenerTodas.bind(urlFormatoController));
router.post('/crear', urlFormatoController.crear.bind(urlFormatoController));
router.put('/actualizar', urlFormatoController.actualizar.bind(urlFormatoController));
router.delete('/eliminar', urlFormatoController.eliminar.bind(urlFormatoController));

export default router;