const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Obsługa nagłówków CORS (pozwala na komunikację ze stroną)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const { items } = JSON.parse(event.body);

    if (!items || items.length === 0) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Koszyk jest pusty' }) };
    }

    // --- LOGIKA FILTROWANIA WYSYŁKI ---
    const hasLiveAnimals = items.some(item => item.type === 'spider');

    let shippingOptions = [];

    if (hasLiveAnimals) {
      // SCENARIUSZ 1: W koszyku jest pająk -> Tylko bezpieczna wysyłka (Pocztex)
      // Blokujemy zwykłego kuriera i paczkomaty
      shippingOptions = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 3000, currency: 'pln' }, // 30.00 PLN
            display_name: 'Kurier Pocztex (Żywe Zwierzęta + Heatpack)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ];
    } else {

      shippingOptions = [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: { amount: 2300, currency: 'pln' }, // 23.00 PLN
            display_name: 'Kurier (Akcesoria)',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 1 },
              maximum: { unit: 'business_day', value: 2 },
            },
          },
        },
      ];
    }

    // Tworzenie sesji płatności w Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'blik', 'p24'], 
      locale: 'pl',
      line_items: items.map(item => {
          // Obsługa wariantów cenowych ze Stripe (jeśli mają stripeId)
          if (item.stripeId && item.stripeId.startsWith('price_')) {
              return {
                  price: item.stripeId,
                  quantity: item.qty,
              };
          }
          // Obsługa produktów bez zdefiniowanego wariantu w Stripe (fallback - np. stare produkty)
          return {
            price_data: {
              currency: 'pln',
              product_data: {
                name: item.name,
                images: item.image ? [item.image] : [], 
                metadata: {
                    latin_name: item.latin || ''
                }
              },
              unit_amount: Math.round(item.price * 100), // Cena w groszach
            },
            quantity: item.qty,
          };
      }),
      mode: 'payment',
      shipping_options: shippingOptions, 
      shipping_address_collection: {
        allowed_countries: ['PL'], 
      },
      phone_number_collection: {
        enabled: true, 
      },
      success_url: `${event.headers.origin}?success=true`,
      cancel_url: `${event.headers.origin}?canceled=true`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ url: session.url }),
    };

  } catch (error) {
    console.error("Błąd Stripe:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Wystąpił błąd podczas tworzenia płatności.' }),
    };
  }
};