import { createClient } from '@supabase/supabase-js';
import busboy from 'busboy';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bb = busboy({ headers: req.headers });
    let file = null;
    let bucket = 'product-images';
    let path = null;

    // Parse form data
    bb.on('file', (fieldname, stream, info) => {
      if (fieldname === 'file') {
        const chunks = [];
        stream.on('data', (data) => chunks.push(data));
        stream.on('end', () => {
          file = Buffer.concat(chunks);
        });
      }
    });

    bb.on('field', (fieldname, val) => {
      if (fieldname === 'path') path = val;
      if (fieldname === 'bucket') bucket = val;
    });

    // Wait for form to be parsed
    await new Promise((resolve, reject) => {
      bb.on('close', resolve);
      bb.on('error', reject);
    });

    if (!file || !path) {
      return res.status(400).json({ error: 'Missing file or path' });
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload to Supabase failed: ${error.message}`);
    }

    // Generate public URL
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return res.status(200).json({
      success: true,
      url: publicUrl.publicUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: `Upload failed: ${error.message}`
    });
  }
}
