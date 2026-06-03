// src/routes/plantillaMetricaTcRoutes.js
import express from 'express';
import PlantillaMetricaTcController from '../controllers/plantillaMetricaTcController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const plantillaMetricaTcController = new PlantillaMetricaTcController();

router.get('/', authMiddleware, soloEditores, plantillaMetricaTcController.listarTodas.bind(plantillaMetricaTcController));
router.get('/empleado/:id_empleado', authMiddleware, soloEditores, plantillaMetricaTcController.listarPorEmpleado.bind(plantillaMetricaTcController));
router.get('/metrica/:id_metrica', authMiddleware, soloEditores, plantillaMetricaTcController.listarPorMetrica.bind(plantillaMetricaTcController));
router.get('/:id', authMiddleware, soloEditores, plantillaMetricaTcController.obtenerPorId.bind(plantillaMetricaTcController));
router.post('/', authMiddleware, soloEditores, plantillaMetricaTcController.crear.bind(plantillaMetricaTcController));
router.patch('/:id', authMiddleware, soloEditores, plantillaMetricaTcController.actualizar.bind(plantillaMetricaTcController));
router.delete('/:id', authMiddleware, soloEditores, plantillaMetricaTcController.eliminar.bind(plantillaMetricaTcController));

export default router;
