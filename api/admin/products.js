const { createClient } = require('@supabase/supabase-js');
const formidable = require('formidable');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://nxgwktdkewmcujneader.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54Z3drdGRrZXdtY3VqbmVhZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMDEyNDIsImV4cCI6MjA0OTU3NzI0Mn0.7L3w00E-12Q5G7j-F4hm5RGvXNBhEwRMBKfO4gGi1Vk';

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
