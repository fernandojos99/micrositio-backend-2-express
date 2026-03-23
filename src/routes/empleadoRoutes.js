// src/routes/empleadoRoutes.js
/**
 * Módulo de rutas para empleados.
 * @module routes/empleadoRoutes
 */

import express from 'express';
import EmpleadoController from '../controllers/empleadoController.js';
import { authMiddleware, soloEditores } from '../middlewares/authMiddleware.js';

const router = express.Router();
const empleadoController = new EmpleadoController();

/**
 * Ruta GET para obtener un empleado por ID.
 * <Pendiente checar esto porque deberia ser get>
 * @name get/empleados/
 * @function
 */
router.post('/', authMiddleware, empleadoController.obtenerPorId.bind(empleadoController));

/**
 * Ruta POST para crear un nuevo empleado.
 * @name post/empleados
 * @function
 */
router.post('/create', authMiddleware, soloEditores, empleadoController.crear.bind(empleadoController));

/**
 * Ruta PATCH para actualizar un empleado existente.
 * @name patch/empleados/
 * @function
 */
router.patch('/', authMiddleware, soloEditores, empleadoController.actualizar.bind(empleadoController));

/**
 * Ruta DELETE para desactivar un empleado (eliminación lógica).
 * @name delete/empleados/
 * @function
 */
router.delete('/', authMiddleware, soloEditores, empleadoController.desactivar.bind(empleadoController));

/**
 * Ruta GET para obtener todos los empleados.
 * @name get/empleados/todos
 * @function
 */
router.get('/todos', authMiddleware, empleadoController.listarTodos.bind(empleadoController));

/**
 * Ruta GET para obtener empleados que no tienen usuario asociado.
 * @name get/empleados/sin-usuario
 * @function
 */
router.get('/sin-usuario', authMiddleware, empleadoController.obtenerEmpleadosSinUsuario.bind(empleadoController));

export default router;