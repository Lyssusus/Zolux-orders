const { createClient } = require('@supabase/supabase-js');
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    // Get all products
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) throw error;
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'POST') {
    // Create new product
    try {
      const { name, price, price_discounted, description, image_url } = req.body;
      
      const { data, error } = await supabase
        .from('products')
        .insert([{ name, price, price_discounted, description, image_url }])
        .select();
      
      if (error) throw error;
      res.status(201).json(data[0]);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    // Update product
    try {
      const { id, name, price, price_discounted, description, image_url } = req.body;
      
      const { data, error } = await supabase
        .from('products')
        .update({ name, price, price_discounted, description, image_url })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      res.status(200).json(data[0]);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else if (req.method === 'DELETE') {
    // Delete product
    try {
      const { id } = req.query;
      
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      res.status(200).json({ message: 'Produkt usunięty' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
