import express from 'express';
import SecuenciaController from '../controllers/secuenciaController.js';
import { authMiddleware, soloEditores, verificarAccesoProyecto } from '../middlewares/authMiddleware.js';

const router = express.Router();
const secuenciaController = new SecuenciaController();

router.get('/', authMiddleware, verificarAccesoProyecto, secuenciaController.obtenerTodas.bind(secuenciaController));

router.get('/:id', authMiddleware, secuenciaController.obtenerPorId.bind(secuenciaController));

router.post('/', authMiddleware, soloEditores, secuenciaController.crear.bind(secuenciaController));

router.patch('/:id', authMiddleware, soloEditores, secuenciaController.actualizar.bind(secuenciaController));

router.patch('/:id/aplicar-plantilla', authMiddleware, secuenciaController.aplicarPlantilla.bind(secuenciaController));

router.delete('/:id', authMiddleware, soloEditores, secuenciaController.eliminar.bind(secuenciaController));

export default router;
