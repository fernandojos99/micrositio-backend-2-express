import supabase from '../config/supabaseClient.js';

class FormatoRepository {
  static async create(formatoData) {
    const { document_name, document_url, document_type } = formatoData;
    
    const { data, error } = await supabase
      .from('formato')
      .insert([
        {
          document_name,
          document_url,
          document_type
        }
      ])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findAll() {
    const { data, error } = await supabase
      .from('formato')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('formato')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, formatoData) {
    const { document_name, document_url, document_type } = formatoData;
    
    const { data, error } = await supabase
      .from('formato')
      .update({
        document_name,
        document_url,
        document_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { data, error } = await supabase
      .from('formato')
      .delete()
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export default FormatoRepository;