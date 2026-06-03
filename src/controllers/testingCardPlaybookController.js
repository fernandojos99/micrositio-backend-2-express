import TestingCardPlaybookService from '../services/testingCardPlaybookService.js';
import ApiError from '../utils/ApiError.js';
import { success, created, noContent } from '../utils/responseHelper.js';

class TestingCardPlaybookController {
  constructor() {
    this.testingCardPlaybookService = new TestingCardPlaybookService();
  }

  async listarTodos(req, res, next) {
    try {
      const datos = await this.testingCardPlaybookService.listarTodos();
      return success(res, datos);
    } catch (error) {
      console.error('Error en listarTodos:', error);
      next(error);
    }
  }

  async obtenerPorPagina(req, res, next) {
    try {
      const { pagina } = req.query;
      if (!pagina) {
        throw new ApiError('Se requiere el parámetro "pagina" en la query', 400);
      }
      const playbook = await this.testingCardPlaybookService.obtenerPorPagina(pagina);
      if (!playbook) {
        throw new ApiError('No se encontró el registro', 404);
      }
      return success(res, playbook);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorCampo(req, res, next) {
    try {
      const { campo } = req.query;
      if (!campo) {
        throw new ApiError('Se requiere el parámetro "campo" en la query', 400);
      }
      const playbooks = await this.testingCardPlaybookService.buscarPorCampo(campo);
      return success(res, playbooks);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorTipo(req, res, next) {
    try {
      const { tipo } = req.query;
      if (!tipo) {
        throw new ApiError('Se requiere el parámetro "tipo" en la query', 400);
      }
      const playbooks = await this.testingCardPlaybookService.buscarPorTipo(tipo);
      return success(res, playbooks);
    } catch (error) {
      next(error);
    }
  }

  async crear(req, res, next) {
    try {
      const nuevo = await this.testingCardPlaybookService.crear(req.body);
      return created(res, nuevo, { message: 'Playbook creado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async actualizar(req, res, next) {
    try {
      const { pagina } = req.query;
      if (!pagina) {
        throw new ApiError('Se requiere el parámetro "pagina" en la query', 400);
      }
      const actualizado = await this.testingCardPlaybookService.actualizar(pagina, req.body);
      return success(res, actualizado, { message: 'Playbook actualizado exitosamente' });
    } catch (error) {
      next(error);
    }
  }

  async eliminar(req, res, next) {
    try {
      const { pagina } = req.query;
      if (!pagina) {
        throw new ApiError('Se requiere el parámetro "pagina" en la query', 400);
      }
      await this.testingCardPlaybookService.eliminar(pagina);
      return success(res, null, { message: 'Playbook eliminado exitosamente' });
    } catch (error) {
      next(error);
    }
  }
}

export default TestingCardPlaybookController;
