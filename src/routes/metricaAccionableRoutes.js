import express from 'express';
import MetricaAccionableController from '../controllers/metricaAccionableController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();

const metricaAccionableController = new MetricaAccionableController();

router.get(
  '/accionable/:id_accionable',
  authMiddleware,
  metricaAccionableController.obtenerPorAccionable.bind(metricaAccionableController)
);

router.post(
  '/',
  authMiddleware,
  soloEditores,
  metricaAccionableController.crear.bind(metricaAccionableController)
);

router.patch(
  '/:id_metrica_accionable',
  authMiddleware,
  soloEditores,
  metricaAccionableController.actualizar.bind(metricaAccionableController)
);

router.delete(
  '/:id_metrica_accionable',
  authMiddleware,
  soloEditores,
  metricaAccionableController.eliminar.bind(metricaAccionableController)
);

export default router;
