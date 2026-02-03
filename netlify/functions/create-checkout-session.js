const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Obsługa CORS dla zapytań OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Akceptujemy tylko metodę POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { items } = JSON.parse(event.body);
    
    if (!items || items.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Koszyk jest pusty' }) };
    }

    // Dynamicznie ustalamy adres powrotu (np. localhost lub domena na Netlify)
    const origin = event.headers.origin || 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik'],
      // Dodajemy zbieranie adresu wysyłki
      shipping_address_collection: {
        allowed_countries: ['PL'], // Tutaj wpisz kody krajów, do których wysyłasz (np. ['PL', 'DE'])
      },
      // Dodajemy zbieranie numeru telefonu (przydatne dla kuriera)
      phone_number_collection: {
        enabled: true,
      },
      // Opcjonalnie: Możesz włączyć zbieranie adresu rozliczeniowego, jeśli jest inny
      billing_address_collection: 'required',
      
      line_items: items.map(item => ({
        price_data: {
          currency: 'pln',
          product_data: {
            name: item.name,
            images: [item.image],
          },
          // Stripe oczekuje kwoty w groszach
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.qty,
      })),
      mode: 'payment',
      success_url: `${origin}/?success=true`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (e) {
    console.error("Stripe Error:", e);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message || 'Wystąpił błąd podczas tworzenia sesji płatności.' }),
    };
  }
};