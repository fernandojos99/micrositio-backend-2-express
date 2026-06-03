// src/routes/plantillaTestingCardRoutes.js
import express from 'express';
import PlantillaTestingCardController from '../controllers/plantillaTestingCardController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const plantillaTestingCardController = new PlantillaTestingCardController();

router.get('/', authMiddleware, soloEditores, plantillaTestingCardController.listarTodas.bind(plantillaTestingCardController));
router.get('/empleado/:id_empleado', authMiddleware, soloEditores, plantillaTestingCardController.listarPorEmpleado.bind(plantillaTestingCardController));
router.get('/testing-card/:id_testing_card', authMiddleware, soloEditores, plantillaTestingCardController.listarPorTestingCard.bind(plantillaTestingCardController));
router.get('/:id', authMiddleware, soloEditores, plantillaTestingCardController.obtenerPorId.bind(plantillaTestingCardController));
router.post('/', authMiddleware, soloEditores, plantillaTestingCardController.crear.bind(plantillaTestingCardController));
router.patch('/:id', authMiddleware, soloEditores, plantillaTestingCardController.actualizar.bind(plantillaTestingCardController));
router.delete('/:id', authMiddleware, soloEditores, plantillaTestingCardController.eliminar.bind(plantillaTestingCardController));

export default router;
