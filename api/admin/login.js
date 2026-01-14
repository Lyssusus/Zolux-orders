export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Hardcoded credentials for now
  // In production, use Supabase Auth or similar
  const adminCredentials = {
    username: 'marketing@zolux.pl',
    password: 'FAfrwifn3185'
  };

  if (username === adminCredentials.username && password === adminCredentials.password) {
    // In production, generate a proper JWT token
    const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    return res.status(200).json({
      success: true,
      token: token,
      user: username,
      message: 'Zalogowano pomęślnie'
    });
  }

  return res.status(401).json({
    error: 'Nieprawidłowe dane logowania'
  });
}
