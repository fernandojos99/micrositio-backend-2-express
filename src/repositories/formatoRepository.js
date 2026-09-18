import { consulta, unoObligatorio, exigirFila, insertarFilas, actualizarFilas } from '../config/db.js';

// Este repositorio no envuelve los errores: los relanza tal cual y decide el
// controller. Un "no encontrado" llega como SinFilas (antes, el PGRST116 de
// `.single()`).
class FormatoRepository {
  static async create(formatoData) {
    const { document_name, document_url, document_type, categoria } = formatoData;

    return exigirFila(insertarFilas('formato', [
      {
        document_name,
        document_url,
        document_type,
        categoria
      }
    ]));
  }

  static async findAll() {
    return consulta('SELECT * FROM formato ORDER BY created_at DESC');
  }

  static async findById(id) {
    return unoObligatorio('SELECT * FROM formato WHERE id = $1', [id]);
  }

  static async update(id, updateData) {
    // Solo actualizar los campos proporcionados
    const dataToUpdate = {
      ...updateData,
      updated_at: new Date().toISOString()
    };

    return exigirFila(actualizarFilas('formato', dataToUpdate, 'id = $1', [id]));
  }

  static async delete(id) {
    return exigirFila(consulta('DELETE FROM formato WHERE id = $1 RETURNING *', [id]));
  }
}

export default FormatoRepository;
