import { consulta, unoObligatorio } from '../config/db.js';

// Este repositorio no envuelve los errores: los relanza tal cual y decide el
// controller.
class TestingCardPlaybookRepository {
  async listarTodos() {
    return consulta('SELECT * FROM testing_card_playbook');
  }

  async obtenerPorPagina(pagina) {
    try {
      return await unoObligatorio('SELECT * FROM testing_card_playbook WHERE pagina = $1', [pagina]);
    } catch (error) {
      console.error('Error en obtenerPorPagina:', error);
      throw error;
    }
  }

  async buscarPorCampo(campo) {
    return consulta('SELECT * FROM testing_card_playbook WHERE campo = $1', [campo]);
  }

   async buscarPorTipo(tipo) {
    return consulta('SELECT * FROM testing_card_playbook WHERE tipo = $1', [tipo]);
  }
}

export default TestingCardPlaybookRepository;
