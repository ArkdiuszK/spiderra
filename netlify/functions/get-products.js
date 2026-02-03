const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_TEST_KEY);

exports.handler = async (event, context) => {
  try {
    // Pobieramy aktywne produkty ze Stripe wraz z cenami
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    // Formatujemy dane do struktury używanej przez Twój frontend
    const formattedProducts = products.data.map(p => ({
      id: p.id,
      name: p.name,
      price: p.default_price ? p.default_price.unit_amount / 100 : 0,
      image: p.images[0] || 'https://placehold.co/400x300',
      latin: p.metadata.latin || '',
      type: p.metadata.type || 'spider',
      desc: p.description
    }));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Zezwolenie na CORS
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formattedProducts),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch products' }),
    };
  }
};