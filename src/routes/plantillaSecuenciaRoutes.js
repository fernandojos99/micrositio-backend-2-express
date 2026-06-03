// src/routes/plantillaSecuenciaRoutes.js
import express from 'express';
import plantillaSecuenciaController from '../controllers/plantillaSecuenciaController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authMiddleware);
router.get('/', plantillaSecuenciaController.obtenerTodas);
router.get('/:id', plantillaSecuenciaController.obtenerPorId);
router.get('/secuencia/:id_secuencia', plantillaSecuenciaController.obtenerPorIdSecuencia);
router.post('/', soloEditores, plantillaSecuenciaController.crear);
router.put('/:id', soloEditores, plantillaSecuenciaController.actualizar);
router.delete('/:id', soloEditores, plantillaSecuenciaController.eliminar);

export default router;
