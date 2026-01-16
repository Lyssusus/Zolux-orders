import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Create Supabase client inside function for serverless
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );


  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { file, fileName, bucket } = req.body;

    if (!file || !fileName || !bucket) {
      return res.status(400).json({ error: 'Missing file, fileName, or bucket' });
    }

    // Convert base64 to buffer - handle both data:image/jpeg;base64, and plain base64
    let base64Data = file;
    if (file.includes('base64,')) {
      base64Data = file.split('base64,')[1];
    }

    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(error.message);
    }

    // Get public URL
    const { data: publicUrl } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return res.status(200).json({
      success: true,
      url: publicUrl.publicUrl,
      path: fileName
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      error: `Upload failed: ${error.message}`
    });
  }
}
