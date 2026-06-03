import TestingCardPlaybookRepository from '../repositories/testingCardPlaybookRepository.js';

class TestingCardPlaybookService {
  constructor() {
    this.repository = new TestingCardPlaybookRepository();
  }

  async listarTodos() {
    return await this.repository.listarTodos();
  }

  async obtenerPorPagina(pagina) {
    return await this.repository.obtenerPorPagina(pagina);
  }

  async buscarPorTipo(tipo) {
    return await this.repository.buscarPorTipo(tipo);
  }

  async buscarPorCampo(campo) {
    return await this.repository.buscarPorCampo(campo);
  }

  async crear(data) {
    return await this.repository.crear(data);
  }

  async actualizar(pagina, data) {
    return await this.repository.actualizar(pagina, data);
  }

  async eliminar(pagina) {
    return await this.repository.eliminar(pagina);
  }
}

export default TestingCardPlaybookService;