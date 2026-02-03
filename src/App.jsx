import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';

// --- KONFIGURACJA API ---
const isProduction = window.location.hostname !== 'localhost';
const API_URL = isProduction ? '/.netlify/functions' : 'http://localhost:4242';

// --- PRZYŚPIESZONE ŁADOWANIE TAILWINDA ---
if (typeof document !== 'undefined' && !document.getElementById('tailwind-cdn')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn';
  script.src = "https://cdn.tailwindcss.com";
  document.head.appendChild(script);
}

const IconBase = ({ children, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
);

const Icons = {
  ShoppingCart: (p) => <IconBase {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></IconBase>,
  Menu: (p) => <IconBase {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></IconBase>,
  Store: (p) => <IconBase {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></IconBase>,
  X: (p) => <IconBase {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconBase>,
  Plus: (p) => <IconBase {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>,
  Minus: (p) => <IconBase {...p}><path d="M5 12h14"/></IconBase>,
  Trash2: (p) => <IconBase {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>,
  Bug: (p) => <IconBase {...p}><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/></IconBase>,
  Check: (p) => <IconBase {...p}><polyline points="20 6 9 17 4 12"/></IconBase>,
  Instagram: (p) => <IconBase {...p}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></IconBase>,
  Video: (p) => <IconBase {...p}><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></IconBase>,
  Kick: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className} width="24" height="24">
      <path d="M12.9 16.7l-4.2-4.2 4.2-4.2h-3.8L5.9 11.6v-3.3H2.5v7.5h3.4v-3.3l3.2 3.3h3.8zM16.5 7.4h-3.4v9.3h3.4V7.4zM21.5 7.4h-3.4v9.3h3.4V7.4z"/>
    </svg>
  ),
  TwitterX: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className} width="24" height="24">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.294 19.497h2.039L6.482 2.395h-2.19l13.315 18.255z"/>
    </svg>
  ),
  Loader: (p) => <IconBase {...p} className={`animate-spin ${p.className}`}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></IconBase>
};

const MOCK_PRODUCTS_DATA = [
  {
    id: 'prod_1',
    name: 'Spider Web',
    price: 29.99,
    image: 'https://placehold.co/400x300',
    latin: 'Araneus diadematus',
    type: 'spider',
    desc: 'Wspaniała sieć pajęcza'
  },
  {
    id: 'prod_2',
    name: 'Spider Legs',
    price: 19.99,
    image: 'https://placehold.co/400x300',
    latin: 'Araneus ventricosus',
    type: 'spider',
    desc: 'Długie nogi pajęczyce'
  },
  {
    id: 'prod_3',
    name: 'Spider Egg Sack',
    price: 14.99,
    image: 'https://placehold.co/400x300',
    latin: 'Paraphidippus aurantius',
    type: 'spider',
    desc: 'Kostka jaj pajęcza'
  }
];

const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
  }, []);

  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.name} dodany do koszyka!`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(item => item.id !== id)), []);
  
  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev.map(item => (item.id === id && item.qty + delta > 0) ? { ...item, qty: item.qty + delta } : item));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.qty), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  return { cart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast };
};

const HomeView = memo(({ navigateTo }) => (
  <div className="relative min-h-[70vh] flex items-center justify-center animate-fade-in overflow-hidden rounded-3xl">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 -z-10"></div>
    <div className="text-center px-4 max-w-4xl mx-auto relative">
      <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-100 rounded-full">
        Nowa dostawa ptaszników!
      </div>
      <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-8 leading-[1.1]">
        Egzotyka na <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Wyciągnięcie Ręki</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"> Spiderra to Twoje okno na świat terrarystyki. Oferujemy wyselekcjonowane gatunki i profesjonalny sprzęt. </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={() => navigateTo('shop')} className="px-10 py-5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-xl active:scale-95"> Przejdź do Sklepu </button>
        <button onClick={() => navigateTo('stream')} className="px-10 py-5 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:border-emerald-500 transition-all"> Oglądaj Live </button>
      </div>
    </div>
  </div>
));

const AboutView = memo(() => (
  <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-16 animate-fade-in shadow-sm">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
      <div className="w-full md:w-1/2">
        <img src="https://images.unsplash.com/photo-1548858881-80590a5525bc?auto=format&fit=crop&w=800&q=80" alt="Zespół Spiderra" className="rounded-3xl shadow-xl w-full aspect-square object-cover" />
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-4xl font-black mb-6 text-gray-900">Cześć, jestem <span className="text-emerald-500">Arek</span></h2>
        <p className="text-gray-600 leading-relaxed mb-4">Witaj w Spiderra! Moja przygoda z ptasznikami zaczęła się lata temu od jednego małego terrarium. Dziś to pasja, którą dzielę się z Wami jako Arek ze Spiderra Lab, oferując tylko zdrowe i sprawdzone zwierzęta.</p>
        <p className="text-gray-600 leading-relaxed mb-4">Każdy pająk, który do Was trafia, jest przeze mnie starannie wyselekcjonowany. Dbamy o to, abyście mogli cieszyć się tym niezwykłym hobby bez obaw.</p>
        <div className="flex gap-6 pt-4">
          <div><p className="text-2xl font-black">50+</p><p className="text-xs text-emerald-600 uppercase font-bold tracking-widest">Gatunków</p></div>
          <div><p className="text-2xl font-black">100%</p><p className="text-xs text-emerald-600 uppercase font-bold tracking-widest">Wsparcia</p></div>
        </div>
      </div>
    </div>
  </div>
));

const StreamView = memo(() => (
  <div className="animate-fade-in">
    <div className="bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-800 max-w-5xl mx-auto">
      <div className="p-6 md:p-10 flex flex-col gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></div>
              <h2 className="text-white text-2xl font-black tracking-tight uppercase">Spiderra Live</h2>
            </div>
            <div className="flex items-center gap-2 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Aktualnie online</span>
            </div>
          </div>
          
          <div className="aspect-video bg-black rounded-3xl relative flex items-center justify-center border border-gray-800 group cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548858881-80590a5525bc?auto=format&fit=crop&w=1200&q=40')] bg-cover bg-center opacity-40 blur-sm group-hover:scale-110 transition-transform duration-700"></div>
            <div className="relative z-10 text-center">
               <div className="w-20 h-20 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Icons.Video className="w-10 h-10 fill-current ml-1" />
               </div>
               <p className="text-white font-black text-xl tracking-tight uppercase">Ekspedycja: Lasy Deszczowe z Arkiem</p>
               <p className="text-emerald-400 text-sm font-bold mt-2 tracking-widest uppercase italic">Łączenie z kamerą...</p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg">
                <div className="w-full h-full bg-gray-900 rounded-[0.9rem] flex items-center justify-center">
                  <Icons.Bug className="text-emerald-400 w-6 h-6" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold">Arek | Spiderra Lab</p>
                <p className="text-gray-500 text-xs">Ptaszniki w ich naturalnym środowisku</p>
              </div>
            </div>
            <a href="https://kick.com/spiderra" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#53FC18] text-black px-6 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-transform">
               <Icons.Kick className="w-4 h-4" /> OBSERWUJ NA KICK
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const ShopView = memo(({ addToCart, products, loading }) => {
  const [filter, setFilter] = useState('all');
  const filtered = useMemo(() => filter === 'all' ? products : products.filter(p => p.type === filter), [filter, products]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Icons.Loader className="w-12 h-12 text-emerald-500" />
      <p className="mt-4 text-gray-500 font-medium">Ładowanie asortymentu...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {[{ id: 'all', label: 'Wszystko' }, { id: 'spider', label: 'Ptaszniki' }, { id: 'gear', label: 'Akcesoria' }].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-8 py-3 rounded-2xl font-bold transition-all ${filter === f.id ? 'bg-emerald-500 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100'}`}>
            {f.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-3xl p-6 border border-gray-100 group hover:shadow-2xl transition-all duration-500">
            <div className="overflow-hidden rounded-2xl h-64 mb-4">
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt={p.name} />
            </div>
            <h3 className="font-bold text-xl text-gray-900">{p.name}</h3>
            <p className="text-emerald-600 text-xs font-black uppercase tracking-widest mt-1 italic">{p.latin}</p>
            <p className="text-gray-500 text-sm mt-4 line-clamp-2">{p.desc}</p>
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50">
              <span className="text-2xl font-black">{p.price.toFixed(2)} zł</span>
              <button onClick={() => addToCart(p)} className="bg-gray-900 text-white p-3 rounded-xl hover:bg-emerald-500 transition-colors shadow-lg active:scale-90"><Icons.Plus/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTailwindReady, setIsTailwindReady] = useState(false);
  
  const { cart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast } = useCart();

  // Rozwiązanie problemu FOUC (Flash of Unstyled Content):
  useEffect(() => {
    const checkTailwind = () => {
      // Sprawdzamy czy skrypt jest w nagłówku i czy obiekt tailwind jest gotowy
      if (window.tailwind) {
        setIsTailwindReady(true);
      } else {
        // Jeśli jeszcze nie, sprawdzamy ponownie za moment
        const timeout = setTimeout(checkTailwind, 50);
        return () => clearTimeout(timeout);
      }
    };
    
    // Dodatkowe zabezpieczenie: jeśli skrypt jakimś cudem nie został wstrzyknięty na górze
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      script.onload = checkTailwind;
      document.head.appendChild(script);
    } else {
      checkTailwind();
    }
  }, []);

  // Endpoint do pobierania produktów
  // Jeśli jesteśmy na produkcji, używamy endpointu serverless 'get-products'
  // Jeśli lokalnie, używamy '/products' z server.js (o ile jest uruchomiony)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const endpoint = isProduction ? `${API_URL}/get-products` : `${API_URL}/products`;
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setProducts(data.length > 0 ? data : MOCK_PRODUCTS_DATA);
      } catch {
        setProducts(MOCK_PRODUCTS_DATA);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setCheckoutLoading(true);
    try {
      const res = await fetch(`${API_URL}/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch {
      showToast("Błąd: Serwer płatności nie odpowiada.", "error");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const navigate = useCallback((view) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // DOPÓKI TAILWIND NIE JEST GOTOWY, WYŚWIETLAMY CZYSTY EKRAN ŁADOWANIA
  if (!isTailwindReady) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        fontFamily: 'sans-serif',
        backgroundColor: '#ffffff'
      }}>
        <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '32px', letterSpacing: '-1px' }}>SPIDERRA</div>
        <div style={{ marginTop: '12px', color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>Ładowanie stylów...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#fcfcfd] min-h-screen text-gray-900 font-sans selection:bg-emerald-100">
      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* Nawigacja */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl z-[80] border-b h-20 flex items-center">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div className="text-2xl font-black cursor-pointer flex items-center gap-2" onClick={() => navigate('home')}>
            <Icons.Bug className="text-emerald-500 w-6 h-6" /> SPIDERRA
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-6 text-sm font-bold text-gray-500">
              <button onClick={() => navigate('home')} className={activeView === 'home' ? 'text-emerald-600' : 'hover:text-emerald-500'}>Start</button>
              <button onClick={() => navigate('shop')} className={activeView === 'shop' ? 'text-emerald-600' : 'hover:text-emerald-500'}>Sklep</button>
              <button onClick={() => navigate('stream')} className={activeView === 'stream' ? 'text-emerald-600' : 'hover:text-emerald-500'}>Transmisja</button>
              <button onClick={() => navigate('about')} className={activeView === 'about' ? 'text-emerald-600' : 'hover:text-emerald-500'}>O nas</button>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
                <Icons.ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-bold">{cartCount}</span>}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2 bg-gray-50 rounded-xl">
                <Icons.Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Mobilne */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-white pt-24 px-6 md:hidden animate-fade-in">
          <div className="flex flex-col gap-6 text-xl font-bold">
            <button onClick={() => navigate('home')}>Start</button>
            <button onClick={() => navigate('shop')}>Sklep</button>
            <button onClick={() => navigate('stream')}>Transmisja</button>
            <button onClick={() => navigate('about')}>O nas</button>
          </div>
        </div>
      )}

      {/* Widok Główny */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-[80vh]">
        {activeView === 'home' && <HomeView navigateTo={navigate} />}
        {activeView === 'about' && <AboutView />}
        {activeView === 'stream' && <StreamView />}
        {activeView === 'shop' && <ShopView addToCart={addToCart} products={products} loading={loading} />}
      </main>

      {/* Koszyk Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 animate-fade-in no-scrollbar border-l border-gray-100">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <h2 className="text-2xl font-black">Twój Koszyk</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"><Icons.X/></button>
            </div>
            <div className="flex-1 overflow-auto no-scrollbar">
              {cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                    <Icons.ShoppingCart className="w-16 h-16 mb-4" />
                    <p className="font-bold uppercase tracking-widest text-xs">Koszyk jest pusty</p>
                 </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-4 mb-6 bg-gray-50 p-4 rounded-2xl border border-transparent hover:border-emerald-100 transition-all">
                  <img src={item.image} className="w-20 h-20 object-cover rounded-xl shadow-sm" alt={item.name} />
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-emerald-600 text-[10px] font-black uppercase mb-3">{item.latin}</p>
                    <div className="flex items-center gap-4">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 border rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900">-</button>
                      <span className="font-bold text-sm">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 border rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><Icons.Trash2 className="w-4 h-4"/></button>
                    <span className="font-black text-sm">{(item.price * item.qty).toFixed(2)} zł</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-8 border-t bg-white">
              <div className="flex justify-between text-2xl font-black mb-8"><span>Razem</span><span>{cartTotal.toFixed(2)} zł</span></div>
              <button onClick={handleCheckout} disabled={checkoutLoading || cart.length === 0} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black hover:bg-emerald-600 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center">
                {checkoutLoading ? <Icons.Loader className="w-6 h-6" /> : "PRZEJDŹ DO PŁATNOŚCI"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stopka */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="text-2xl font-black mb-6 flex items-center gap-2">
                <Icons.Bug className="text-emerald-500 w-6 h-6" /> SPIDERRA
              </div>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                Pasja Arka do egzotyki dostarczana pod Twoje drzwi. Największy wybór ptaszników i akcesoriów w regionie.
              </p>
              <div className="flex gap-4">
                <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all"><Icons.Instagram className="w-5 h-5"/></button>
                <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-emerald-500 hover:text-white transition-all"><Icons.TwitterX className="w-5 h-5"/></button>
                <button className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 hover:bg-[#53FC18] hover:text-black transition-all"><Icons.Kick className="w-5 h-5"/></button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-6">Sklep</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500">Ptaszniki</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500">Terraria</button></li>
                <li><button className="hover:text-emerald-500">Nowości</button></li>
                <li><button className="hover:text-emerald-500">Bestsellery</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-6">Pomoc i Info</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><button className="hover:text-emerald-500">Regulamin</button></li>
                <li><button className="hover:text-emerald-500">Polityka Prywatności</button></li>
                <li><button className="hover:text-emerald-500">Wysyłka i Zwroty</button></li>
                <li><button className="hover:text-emerald-500">FAQ</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-6">Kontakt</h4>
              <p className="text-sm font-bold text-gray-500 mb-2">kontakt@spiderra.pl</p>
              <p className="text-sm font-bold text-gray-500 mb-6">+48 123 456 789</p>
              <p className="text-xs text-gray-400">Spiderra Lab by Arek<br/>ul. Egzotyczna 1<br/>00-001 Warszawa</p>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 tracking-widest uppercase">
            <p>&copy; {new Date().getFullYear()} Spiderra Lab. Wszystkie prawa zastrzeżone.</p>
            <p>Design & Code for Arek</p>
          </div>
        </div>
      </footer>

      {/* Powiadomienia Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 ${toast.type === 'error' ? 'bg-red-600' : 'bg-gray-900'} text-white rounded-2xl shadow-2xl transition-all duration-500 flex items-center gap-3 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        {toast.type === 'success' ? <Icons.Check className="text-emerald-400" /> : <Icons.X className="text-white" />}
        <span className="font-bold tracking-tight">{toast.message}</span>
      </div>
    </div>
  );
}