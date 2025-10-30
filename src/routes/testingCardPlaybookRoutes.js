import express from 'express';
import TestingCardPlaybookController from '../controllers/testingCardPlaybookController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const controller = new TestingCardPlaybookController();

// Listar todos los registros
router.get('/', authMiddleware, (req, res, next) => controller.listarTodos(req, res, next));

// Consultar por página (PK)
router.get('/por-pagina', authMiddleware, (req, res, next) => controller.obtenerPorPagina(req, res, next));

// Buscar por campo
router.get('/buscar', authMiddleware, (req, res, next) => controller.buscarPorCampo(req, res, next));

router.get('/buscar-tipo', authMiddleware, (req, res, next) => controller.buscarPorTipo(req, res, next));

// Ejemplo en listarTodos
// El método listarTodos debe estar definido en el controlador, no aquí.

export default router;