import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Tylko metoda POST jest dozwolona' });
  }

  try {
    const data = req.body;

    if (!data.email || !data.productId || !data.quantity) {
      return res.status(400).json({ message: 'Brak wymaganych danych' });
    }

    console.log('Otrzymano zamówienie:', data);

    if (process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Zolux System <onboarding@resend.dev>',
        to: 'biuro@zolux.pl',
        subject: `Nowe zamówienie: ${data.productName}`,
        html: `
          <h1>Nowe zamówienie!</h1>
          <p><strong>Klient:</strong> ${data.firstName} ${data.lastName}</p>
          <p><strong>NIP:</strong> ${data.nip}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Telefon:</strong> ${data.phone}</p>
          <p><strong>Adres dostawy:</strong> ${data.address}</p>
          <hr>
          <p><strong>Produkt:</strong> ${data.productName}</p>
          <p><strong>Ilość:</strong> ${data.quantity} szt.</p>
          <p><strong>Wartość:</strong> ${data.totalValue.toFixed(2)} PLN</p>
        `
      });

      await resend.emails.send({
        from: 'Zolux System <onboarding@resend.dev>',
        to: data.email,
        subject: `Potwierdzenie zamówienia: ${data.productName}`,
        html: `
          <h1>Dziękujemy za zamówienie!</h1>
          <p>Cześć ${data.firstName},</p>
          <p>Otrzymaliśmy Twoje zamówienie na:</p>
          <ul>
            <li><strong>Produkt:</strong> ${data.productName}</li>
            <li><strong>Ilość:</strong> ${data.quantity} szt.</li>
            <li><strong>Wartość:</strong> ${data.totalValue.toFixed(2)} PLN</li>
          </ul>
          <p>Adres dostawy: ${data.address}</p>
          <hr>
          <p>Zespół Zolux</p>
        `
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: 'Zamówienie przyjęte pomyślnie!',
      orderId: Date.now()
    });

  } catch (error) {
    console.error('Błąd backendu:', error);
    return res.status(500).json({ message: 'Wystąpił błąd serwera: ' + error.message });
  }
}

export default allowCors(handler);
