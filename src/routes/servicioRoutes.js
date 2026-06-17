import express from 'express';
import ServicioController from '../controllers/servicioController.js';
import {
  authMiddleware,
  soloEditores
} from '../middlewares/authMiddleware.js';

const router = express.Router();

const servicioController =
  new ServicioController();

router.get(
  '/s',
  authMiddleware,
  servicioController.obtenerPorId.bind(servicioController)
);

router.get(
  '/',
  authMiddleware,
  servicioController.obtenerTodos.bind(servicioController)
);

router.post(
  '/',
  authMiddleware,
  soloEditores,
  servicioController.crear.bind(servicioController)
);

router.patch(
  '/',
  authMiddleware,
  soloEditores,
  servicioController.actualizar.bind(servicioController)
);

router.delete(
  '/',
  authMiddleware,
  soloEditores,
  servicioController.eliminar.bind(servicioController)
);

export default router;