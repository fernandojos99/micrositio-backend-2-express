// src/routes/empleadoRoutes.js
/**
 * Módulo de rutas para empleados.
 * @module routes/empleadoRoutes
 */

import express from 'express';
import EmpleadoController from '../controllers/empleadoController.js';
import { authMiddleware, soloEditores, configurarFiltroProyectos } from '../middlewares/authMiddleware.js';

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
 * Ruta PATCH para actualizar un empleado existente pero solo para sus habilidades
 * @name patch/empleados/
 * @function
 */
router.patch('/infopersonal', authMiddleware, soloEditores, empleadoController.actualizarHabilidades.bind(empleadoController));




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

/**
 * Ruta GET con todo lo que pinta la página Equipo en una sola petición:
 * empleados más habilidades, foto y conteo de proyectos (con la visibilidad
 * de proyectos del usuario).
 * @name get/empleados/resumen
 * @function
 */
router.get('/resumen', authMiddleware, configurarFiltroProyectos, empleadoController.listarResumen.bind(empleadoController));


/* ---------------------------------------------------------------------------
 * Rutas REST con el identificador en el path.
 *
 * Van al final a proposito: Express resuelve por orden de registro, asi que
 * las rutas literales de arriba ('/p', '/todos', '/aplicar-plantilla', ...)
 * siguen ganando y no las tapa el parametro.
 *
 * Las rutas antiguas, con el ID en el body (incluido un GET con body), se
 * mantienen para no romper a los clientes que aun no han migrado. Cuando el
 * front deje de usarlas, se borran.
 * ------------------------------------------------------------------------ */

router.get('/:id', authMiddleware, empleadoController.obtenerPorId.bind(empleadoController));
router.patch('/:id', authMiddleware, soloEditores, empleadoController.actualizar.bind(empleadoController));
router.delete('/:id', authMiddleware, soloEditores, empleadoController.desactivar.bind(empleadoController));

export default router;