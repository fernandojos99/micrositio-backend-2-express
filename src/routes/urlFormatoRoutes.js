// src/routes/urlFormatoRoutes.js
import express from 'express';
import UrlFormatoController from '../controllers/urlFormatoController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const urlFormatoController = new UrlFormatoController();

router.get('/', authMiddleware, urlFormatoController.obtenerTodas.bind(urlFormatoController));
router.get('/:id', authMiddleware, urlFormatoController.obtenerPorId.bind(urlFormatoController));
router.post('/', authMiddleware, soloEditores, urlFormatoController.crear.bind(urlFormatoController));
router.patch('/:id', authMiddleware, soloEditores, urlFormatoController.actualizar.bind(urlFormatoController));
router.delete('/:id', authMiddleware, soloEditores, urlFormatoController.eliminar.bind(urlFormatoController));

export default router;
