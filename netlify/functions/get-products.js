const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Nagłówki CORS (aby Twoja strona mogła pobrać dane)
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 1. Pobieramy wszystkie aktywne ceny wraz z danymi produktu
    // expand: ['data.product'] sprawia, że w obiekcie ceny mamy pełne info o produkcie (zdjęcia, opis)
    const prices = await stripe.prices.list({
      active: true,
      limit: 100, // Pobierz max 100 cen na raz
      expand: ['data.product']
    });

    // 2. Grupowanie cen według Produktów
    const productsMap = {};

    prices.data.forEach(price => {
      const product = price.product;

      // Pomijamy produkty zarchiwizowane lub nieaktywne
      if (!product.active) return;

      // Jeśli tego produktu jeszcze nie ma w mapie, dodajemy go
      if (!productsMap[product.id]) {
        productsMap[product.id] = {
          id: product.id,
          name: product.name,
          latin: product.metadata.latin || '', // Pobieramy łacińską nazwę z metadanych produktu
          type: product.metadata.type || 'gear', // Domyślnie 'gear' (akcesoria) jeśli brak typu
          tags: product.metadata.tags ? product.metadata.tags.split(',') : [],
          image: product.images[0] || '', // Pierwsze zdjęcie ze Stripe
          desc: product.description,
          price: 0, // Cena "od" (zostanie ustawiona na najniższą)
          variants: [] // Tu będą wpadać nasze warianty
        };
      }

      // 3. Dodajemy tę cenę jako wariant
      // Używamy pola 'nickname' ze Stripe jako nazwy wariantu (np. "Economy")
      // Jeśli nickname jest pusty, używamy "Standard"
      const variantName = price.nickname || 'Standard';
      
      const variant = {
        id: price.id, // ID wariantu to ID ceny
        name: variantName,
        price: price.unit_amount / 100, // Stripe trzyma ceny w groszach
        desc: price.metadata.desc || '', // Opis wariantu z metadanych ceny (np. "Pojemnik + Torf")
        stripeId: price.id
      };

      productsMap[product.id].variants.push(variant);
    });

    // 4. Konwersja mapy na tablicę i sortowanie wariantów
    const productsArray = Object.values(productsMap).map(product => {
      // Sortujemy warianty po cenie (od najtańszego)
      product.variants.sort((a, b) => a.price - b.price);
      
      // Ustawiamy główną cenę produktu jako cenę najtańszego wariantu
      if (product.variants.length > 0) {
        product.price = product.variants[0].price;
      }

      // Jeśli produkt ma tylko 1 wariant i nazywa się on "Standard", 
      // możemy usunąć tablicę variants, żeby App.js traktował go jak zwykły produkt (bez wyboru)
      // Ale dla spójności zostawmy to, App.js sobie poradzi.
      
      return product;
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(productsArray),
    };

  } catch (error) {
    console.error("Błąd pobierania produktów:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Nie udało się pobrać produktów ze Stripe' }),
    };
  }
};