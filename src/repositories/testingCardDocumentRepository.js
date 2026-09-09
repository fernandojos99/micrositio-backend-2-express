import supabase from '../config/supabaseClient.js';
import TestingCardDocument from '../models/TestingCardDocument.js';

class TestingCardDocumentRepository {
  async create(documentData) {
    try {
      
      const { data, error } = await supabase
        .from('testing_card_documents')
        .insert(documentData)
        .select('*')
        .single();

      
      if (error) throw error;
      return TestingCardDocument.fromDatabase(data);
    } catch (error) {
      throw new Error(`Error al crear documento: ${error.message}`);
    }
  }

  async findByTestingCardId(testingCardId) {
    try {
      const { data, error } = await supabase
        .from('testing_card_documents')
        .select('*')
        .eq('testing_card_id', testingCardId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map(TestingCardDocument.fromDatabase) || [];
    } catch (error) {
      throw new Error(`Error al obtener documentos: ${error.message}`);
    }
  }

  async findById(id) {
    try {
      const { data, error } = await supabase
        .from('testing_card_documents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? TestingCardDocument.fromDatabase(data) : null;
    } catch (error) {
      throw new Error(`Error al obtener documento: ${error.message}`);
    }
  }

  async delete(id) {
    try {
      const { error } = await supabase
        .from('testing_card_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar documento: ${error.message}`);
    }
  }

  async update(id, updateData) {
    try {
      const { data, error } = await supabase
        .from('testing_card_documents')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return TestingCardDocument.fromDatabase(data);
    } catch (error) {
      throw new Error(`Error al actualizar documento: ${error.message}`);
    }
  }
}

export default new TestingCardDocumentRepository();
