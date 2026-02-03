import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';

// --- KONFIGURACJA API ---
const isProduction = window.location.hostname !== 'localhost';
const API_URL = isProduction ? '/.netlify/functions' : 'http://localhost:4242';

// --- KONFIGURACJA DANYCH FIRMY ---
const COMPANY_DATA = {
  name: "Spiderra - Arkadiusz Kołacki",
  address: "Lisów 88",
  zip: "26-660",
  city: "Lisów",
  email: "kontakt@spiderra.pl",
  phone: "+48 514 729 121",
  nip: "0000000000", 
  regon: "000000000",
  bankAccount: "00 0000 0000 0000 0000 0000 0000"
};

// --- KONFIGURACJA ZDJĘĆ ---
const LOGO_URL = "/zdjecia/logo.png"; 
// Tutaj wstaw ścieżkę do zdjęcia w tle na stronie głównej
const HERO_IMAGE_URL = "/zdjecia/tlo.jpg"; 

// --- PRZYŚPIESZONE ŁADOWANIE TAILWINDA ---
if (typeof document !== 'undefined' && !document.getElementById('tailwind-cdn')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn';
  script.src = "https://cdn.tailwindcss.com";
  document.head.appendChild(script);
}

// --- IKONY ---
const IconBase = ({ children, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
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
  FileText: (p) => <IconBase {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></IconBase>,
  Lock: (p) => <IconBase {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>,
  ArrowLeft: (p) => <IconBase {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></IconBase>,
  Filter: (p) => <IconBase {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IconBase>,
  Kick: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className} width="24" height="24">
      <path d="M12.9 16.7l-4.2-4.2 4.2-4.2h-3.8L5.9 11.6v-3.3H2.5v7.5h3.4v-3.3l3.2 3.3h3.8zM16.5 7.4h-3.4v9.3h3.4V7.4zM21.5 7.4h-3.4v9.3h3.4V7.4z"/>
    </svg>
  ),
  TikTok: (p) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={p.className} width="24" height="24">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
    </svg>
  ),
  Loader: (p) => <IconBase {...p} className={`animate-spin ${p.className}`}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></IconBase>
};

const MOCK_PRODUCTS_DATA = [
  { id: 'spider1', name: 'Grammostola rosea', latin: 'Grammostola rosea', type: 'spider', price: 150.00, image: '/zdjecia/ptaszniki/grammostola_rosea.jpg', desc: 'Ptasznik z Chile, znany ze swojego spokojnego usposobienia i łatwości hodowli.' },
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

  return { cart, setCart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast };
};

// --- WIDOKI ---

const SuccessView = memo(({ lastOrder }) => {
  if (!lastOrder) return null;
  const total = lastOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div className="bg-white rounded-3xl border border-[#e5e5e0] p-8 md:p-16 animate-fade-in shadow-sm max-w-3xl mx-auto text-center">
      <div className="w-20 h-20 bg-[#f5f5f0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#5c6b50]">
        <Icons.Check className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold text-[#44403c] mb-2">Dziękujemy za zamówienie!</h2>
      <p className="text-[#78716c] mb-8">Płatność została przyjęta. Na Twój adres e-mail wysłaliśmy potwierdzenie.</p>

      <div className="bg-[#fafaf9] rounded-2xl p-6 mb-8 text-left border border-[#e7e5e4]">
        <h3 className="font-bold text-[#44403c] mb-4 border-b border-[#e7e5e4] pb-2">Podsumowanie zakupów</h3>
        <div className="space-y-4">
          {lastOrder.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg overflow-hidden border border-[#e5e5e0]">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-bold text-[#44403c]">{item.name}</p>
                  <p className="text-[#78716c] text-xs">{item.qty} x {item.price.toFixed(2)} zł</p>
                </div>
              </div>
              <span className="font-bold text-[#44403c]">{(item.price * item.qty).toFixed(2)} zł</span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-[#e7e5e4] flex justify-between items-center text-lg">
          <span className="font-bold text-[#78716c]">Razem (produkty):</span>
          <span className="font-bold text-[#5c6b50]">{total.toFixed(2)} zł</span>
        </div>
        <p className="text-xs text-[#a8a29e] mt-2 text-right">* Do kwoty zostanie doliczony wybrany koszt dostawy.</p>
      </div>

      <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-[#57534e] text-white rounded-xl font-medium hover:bg-[#44403c] transition-all shadow-md">
        Wróć do sklepu
      </button>
    </div>
  );
});

const ProductDetailsView = memo(({ product, onBack, onAddToCart }) => (
  <div className="bg-white rounded-3xl border border-[#e5e5e0] p-6 md:p-12 animate-fade-in shadow-sm max-w-6xl mx-auto">
    <button onClick={onBack} className="flex items-center gap-2 text-[#78716c] hover:text-[#44403c] mb-8 font-medium transition-colors">
      <Icons.ArrowLeft className="w-5 h-5" /> Wróć do sklepu
    </button>
    <div className="flex flex-col md:flex-row gap-12">
      <div className="w-full md:w-1/2">
        <div className="aspect-square rounded-3xl overflow-hidden bg-[#fafaf9] shadow-sm border border-[#e7e5e4]">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col">
        <div>
          <p className="text-[#5c6b50] font-bold uppercase tracking-widest text-xs mb-2">{product.latin}</p>
          <h2 className="text-4xl font-bold text-[#44403c] mb-4 leading-tight">{product.name}</h2>
          <p className="text-2xl font-semibold text-[#57534e] mb-6">{product.price.toFixed(2)} PLN</p>
          
          <div className="prose prose-stone text-[#78716c] mb-8 leading-relaxed">
            <p>{product.desc || "Brak szczegółowego opisu dla tego produktu."}</p>
            <div className="mt-6 flex flex-col gap-2 text-sm">
               <p><span className="font-semibold text-[#44403c]">Dostępność:</span> W magazynie</p>
               <p><span className="font-semibold text-[#44403c]">Wysyłka:</span> 24h (Dni robocze)</p>
            </div>
          </div>
        </div>
        
        <div className="mt-auto pt-8 border-t border-[#e5e5e0]">
          <button 
            onClick={() => onAddToCart(product)} 
            className="w-full py-4 bg-[#57534e] text-white rounded-xl font-bold text-lg hover:bg-[#44403c] transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.98]"
          >
            <Icons.Plus className="w-6 h-6" /> Dodaj do koszyka
          </button>
        </div>
      </div>
    </div>
  </div>
));

const HomeView = memo(({ navigateTo }) => (
  <div className={`relative min-h-[70vh] flex items-center justify-center animate-fade-in overflow-hidden rounded-3xl border border-[#e7e5e4] ${HERO_IMAGE_URL ? '' : 'bg-[#fafaf9]'}`}>
    
    {/* Tło */}
    {HERO_IMAGE_URL ? (
      <>
        <img src={HERO_IMAGE_URL} alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        {/* Nakładka (overlay) - mocniejsza, aby tekst był czytelny */}
        <div className="absolute inset-0 bg-[#faf9f6]/45 backdrop-blur-sm"></div>
      </>
    ) : (
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5f5f4] via-[#faf9f6] to-[#e6e5d8]/30"></div>
    )}

    <div className="text-center px-4 max-w-4xl mx-auto relative z-10">
      <div className="inline-block px-4 py-1.5 mb-6 text-xs font-bold tracking-widest text-[#5c6b50] uppercase bg-[#f0f0eb] rounded-full border border-[#e6e5d8] shadow-sm">
        Nowości już dostępne!
      </div>
      <h1 className="text-5xl md:text-7xl font-bold text-[#44403c] mb-8 leading-[1.1] tracking-tight">
        Egzotyka na <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5c6b50] to-[#4a5740]">Wyciągnięcie Ręki</span>
      </h1>
      <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-normal"> <b>Spiderra</b> to Twoje okno na świat terrarystyki. Wyselekcjonowane gatunki i profesjonalny sprzęt w zasięgu ręki. </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button onClick={() => navigateTo('shop')} className="px-10 py-4 bg-[#57534e] text-white rounded-xl font-semibold hover:bg-[#44403c] transition-all shadow-lg active:scale-95"> Przejdź do Sklepu </button>
        <button onClick={() => navigateTo('stream')} className="px-10 py-4 bg-white border border-[#d6d3d1] text-[#57534e] rounded-xl font-semibold hover:border-[#a8a29e] hover:text-[#292524] transition-all shadow-sm hover:shadow-md"> Oglądaj Live </button>
      </div>
    </div>
  </div>
));

const AboutView = memo(() => (
  <div className="bg-white rounded-3xl border border-[#e5e5e0] p-8 md:p-16 animate-fade-in shadow-sm">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-12 items-center">
      <div className="w-full md:w-1/2">
        <div className="rounded-3xl overflow-hidden shadow-lg border border-[#e7e5e4]">
            <img src="/zdjecia/arek.png" alt="Arkadiusz Kołacki" className="w-full aspect-square object-cover" />
        </div>
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#44403c]">Cześć, jestem <span className="text-[#5c6b50]">Arek</span></h2>
        <div className="space-y-4 text-[#78716c] leading-relaxed font-light">
            <p>Witaj w Spiderra! Moja przygoda z ptasznikami zaczęła się w 2020 roku od małej Chromki. Dziś to pasja, którą dzielę się z Wami, oferując ptaszniki z różnych regionów świata oraz transmitując to jak żyją w naturze.</p>
            <p>Każdy pająk który jest w mojej ofercie jest wybrany tak aby zarówno początkujący jak i zaawansowany hodowca znalazł coś dla siebie. Dbam o to, abyś mógł/mogła cieszyć się swoim małym zwierzakiem.</p>
        </div>
        <div className="flex gap-8 pt-8 mt-4 border-t border-[#e5e5e0]">
          <div><p className="text-3xl font-bold text-[#44403c]">20+</p><p className="text-xs text-[#a8a29e] uppercase font-bold tracking-widest mt-1">Gatunków</p></div>
          <div><p className="text-3xl font-bold text-[#44403c]">100%</p><p className="text-xs text-[#a8a29e] uppercase font-bold tracking-widest mt-1">Wsparcia</p></div>
        </div>
      </div>
    </div>
  </div>
));

const StreamView = memo(() => (
  <div className="animate-fade-in">
    <div className="bg-[#292524] rounded-[2rem] overflow-hidden shadow-2xl border border-[#1c1917] max-w-5xl mx-auto text-[#d6d3d1]">
      <div className="p-6 md:p-10 flex flex-col gap-8">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
              <h2 className="text-white text-xl font-bold tracking-wide uppercase">Spiderra Live</h2>
            </div>
          </div>
          
          <div className="aspect-video bg-black rounded-2xl relative flex items-center justify-center border border-[#44403c] group cursor-pointer overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548858881-80590a5525bc?auto=format&fit=crop&w=1200&q=40')] bg-cover bg-center opacity-30 blur-sm group-hover:scale-105 transition-transform duration-700"></div>
            <div className="relative z-10 text-center">
               <div className="w-16 h-16 bg-[#5c6b50]/80 text-[#f5f5f0] rounded-full flex items-center justify-center shadow-lg mb-4 mx-auto backdrop-blur-sm border border-[#4a5740]">
                  <Icons.Video className="w-8 h-8 fill-current ml-0.5" />
               </div>
               <p className="text-white font-bold text-lg tracking-tight uppercase">Ekspedycja: Lasy Deszczowe</p>
               <p className="text-[#a8a29e] text-xs font-medium mt-2 tracking-widest uppercase">Łączenie z kamerą...</p>
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#44403c] p-0.5 border border-[#57534e]">
                <div className="w-full h-full rounded-[0.5rem] flex items-center justify-center overflow-hidden">
                   <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain opacity-80" />
                </div>
              </div>
              <div>
                <p className="text-white font-medium text-sm">Następna transmisja...</p>
                <p className="text-[#a8a29e] text-xs">Jordania 08/02</p>
              </div>
            </div>
            <a href="https://kick.com/spiderra" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#44403c] text-[#e7e5e4] border border-[#57534e] px-6 py-3 rounded-xl font-bold text-xs hover:bg-[#57534e] transition-colors uppercase tracking-wider">
               <Icons.Kick className="w-4 h-4" /> Obserwuj na Kick
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const ShopView = memo(({ addToCart, products, loading, onProductClick }) => {
  const [category, setCategory] = useState('all');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000);
  const [sortOrder, setSortOrder] = useState('default'); 

  // Obliczanie maksymalnej ceny
  const productsMaxPrice = useMemo(() => {
    if (products.length === 0) return 1000;
    return Math.max(...products.map(p => p.price));
  }, [products]);

  useEffect(() => {
    if (products.length > 0) {
        setMaxPrice(productsMaxPrice);
    }
  }, [productsMaxPrice, products]);

  const filtered = useMemo(() => {
    let result = products;

    if (category !== 'all') {
      result = result.filter(p => p.type === category);
    }

    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);

    if (sortOrder === 'asc') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === 'desc') {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [category, minPrice, maxPrice, sortOrder, products]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24">
      <Icons.Loader className="w-10 h-10 text-[#5c6b50] opacity-50" />
      <p className="mt-4 text-[#a8a29e] font-medium text-sm tracking-wide uppercase">Ładowanie asortymentu...</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      
      {/* --- SUWAK I FILTRY CSS --- */}
      <style>{`
        /* Style dla suwaków dual-range */
        .range-slider-container { position: relative; width: 100%; height: 24px; }
        .range-slider-input {
            position: absolute; pointer-events: none; -webkit-appearance: none;
            z-index: 20; height: 100%; width: 100%; opacity: 0; cursor: pointer;
        }
        .range-slider-input::-webkit-slider-thumb {
            pointer-events: all; width: 24px; height: 24px; -webkit-appearance: none; cursor: pointer;
        }
        .range-thumb {
            position: absolute; top: 50%; transform: translate(-50%, -50%);
            width: 16px; height: 16px; border-radius: 50%; background: #57534e;
            pointer-events: none; z-index: 30; box-shadow: 0 1px 3px rgba(0,0,0,0.3);
        }
        .range-track {
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 100%; height: 4px; background: #e7e5e4; border-radius: 99px; z-index: 10;
        }
        .range-track-active {
            position: absolute; top: 50%; transform: translateY(-50%);
            height: 4px; background: #5c6b50; z-index: 15;
        }
      `}</style>

      {/* Pasek Filtrów */}
      <div className="mb-10 bg-white p-6 rounded-2xl border border-[#e5e5e0] shadow-sm">
        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center">
          
          {/* Kategorie */}
          <div className="flex flex-wrap gap-3">
            {[{ id: 'all', label: 'Wszystko' }, { id: 'spider', label: 'Ptaszniki' }, { id: 'gear', label: 'Akcesoria' }].map(f => (
              <button 
                key={f.id} 
                onClick={() => setCategory(f.id)} 
                className={`px-6 py-2 rounded-xl font-medium text-sm transition-all border ${category === f.id ? 'bg-[#57534e] text-white border-[#57534e] shadow-md' : 'bg-[#fafaf9] text-[#78716c] border-[#e7e5e4] hover:bg-[#e7e5e4] hover:text-[#44403c]'}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cena i Sortowanie */}
          <div className="flex flex-col sm:flex-row gap-8 w-full lg:w-auto">
            
            {/* Profesjonalny Suwak Ceny */}
            <div className="flex flex-col gap-2 min-w-[240px]">
              <div className="flex justify-between text-xs text-[#78716c] font-medium font-mono">
                 <span>{minPrice} zł</span>
                 <span>{maxPrice} zł</span>
              </div>
              
              <div className="range-slider-container">
                 <div className="range-track"></div>
                 <div 
                    className="range-track-active"
                    style={{
                        left: `${(minPrice / productsMaxPrice) * 100}%`,
                        width: `${((maxPrice - minPrice) / productsMaxPrice) * 100}%`
                    }}
                 ></div>
                 
                 {/* Wizualne uchwyty */}
                 <div className="range-thumb" style={{ left: `${(minPrice / productsMaxPrice) * 100}%` }}></div>
                 <div className="range-thumb" style={{ left: `${(maxPrice / productsMaxPrice) * 100}%` }}></div>

                 {/* Niewidoczne inputy do sterowania */}
                 <input 
                    type="range" min="0" max={productsMaxPrice} step="1"
                    value={minPrice} 
                    onChange={(e) => {
                        const val = Math.min(Number(e.target.value), maxPrice - 10);
                        setMinPrice(val);
                    }}
                    className="range-slider-input"
                 />
                 <input 
                    type="range" min="0" max={productsMaxPrice} step="1"
                    value={maxPrice} 
                    onChange={(e) => {
                        const val = Math.max(Number(e.target.value), minPrice + 10);
                        setMaxPrice(val);
                    }}
                    className="range-slider-input"
                 />
              </div>
            </div>

            <div className="relative min-w-[160px]">
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full px-4 py-2.5 pr-8 rounded-xl border border-[#e7e5e4] text-sm focus:outline-none focus:ring-1 focus:ring-[#5c6b50] bg-[#fafaf9] text-[#44403c] appearance-none cursor-pointer"
              >
                <option value="default">Domyślnie</option>
                <option value="asc">Cena: Rosnąco</option>
                <option value="desc">Cena: Malejąco</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-[#78716c]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-[#e5e5e0] hover:border-[#d6d3d1] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col overflow-hidden group">
            <div 
              className="overflow-hidden h-64 cursor-pointer bg-[#fafaf9] relative" 
              onClick={() => onProductClick(p)}
            >
              <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out" alt={p.name} />
            </div>
            <div className="p-6 flex flex-col flex-1">
                <p className="text-[#5c6b50] text-[10px] font-bold uppercase tracking-widest mb-1">{p.latin}</p>
                <h3 className="font-bold text-lg text-[#44403c] cursor-pointer hover:text-[#5c6b50] transition-colors mb-2" onClick={() => onProductClick(p)}>{p.name}</h3>
                <p className="text-[#78716c] text-sm mb-6 line-clamp-2 leading-relaxed">{p.desc}</p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-[#e5e5e0]">
                <span className="text-xl font-bold text-[#44403c]">{p.price.toFixed(2)} <span className="text-sm font-normal text-[#a8a29e]">PLN</span></span>
                <button onClick={() => addToCart(p)} className="bg-[#f5f5f4] text-[#44403c] p-3 rounded-xl hover:bg-[#57534e] hover:text-white transition-colors active:scale-95"><Icons.Plus/></button>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// --- KOMPONENTY: REGULAMIN I POLITYKA ---

const TermsView = memo(() => (
  <div className="bg-white rounded-3xl border border-[#e5e5e0] p-8 md:p-16 animate-fade-in shadow-sm max-w-4xl mx-auto">
    <div className="flex items-center gap-4 mb-8 border-b border-[#e5e5e0] pb-6">
      <div className="p-3 bg-[#f5f5f0] rounded-xl text-[#5c6b50]"><Icons.FileText className="w-6 h-6" /></div>
      <h2 className="text-2xl font-bold text-[#44403c]">Regulamin Sklepu</h2>
    </div>
    <div className="prose prose-stone max-w-none text-[#78716c] leading-relaxed space-y-8 text-sm font-light">
      
      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">I. Postanowienia ogólne</h3>
        <p>Niniejszy Regulamin określa ogólne warunki, sposób świadczenia Usług drogą elektroniczną i sprzedaży prowadzonej za pośrednictwem Sklepu Internetowego www.spiderra.netlify.app. Sklep prowadzi {COMPANY_DATA.name}, wpisany do rejestru przedsiębiorców Centralnej Ewidencji i Informacji o Działalności Gospodarczej prowadzonej przez ministra właściwego ds. gospodarki pod adresem {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city}, NIP {COMPANY_DATA.nip}, REGON {COMPANY_DATA.regon}, zwany dalej Sprzedawcą.</p>
        <p className="mt-2">Kontakt ze Sprzedawcą odbywa się poprzez:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1 marker:text-[#5c6b50]">
          <li>adres poczty elektronicznej: {COMPANY_DATA.email};</li>
          <li>pod numerem telefonu: {COMPANY_DATA.phone};</li>
          <li>formularz kontaktowy dostępny na stronach Sklepu Internetowego.</li>
        </ul>
        <p className="mt-2">Niniejszy Regulamin jest nieprzerwanie dostępny w witrynie internetowej, w sposób umożliwiający jego pozyskanie, odtwarzanie i utrwalanie jego treści poprzez wydrukowanie lub zapisanie na nośniku w każdej chwili.</p>
        <p className="mt-2">Sprzedawca informuje, że korzystanie z Usług świadczonych drogą elektroniczną może wiązać się z zagrożeniem po stronie każdego użytkownika sieci Internet, polegającym na możliwości wprowadzenia do systemu teleinformatycznego Klienta szkodliwego oprogramowania oraz pozyskania i modyfikacji jego danych przez osoby nieuprawnione. By uniknąć ryzyka wystąpienia zagrożeń w/w Klient powinien stosować właściwe środki techniczne, które zminimalizują ich wystąpienie, a w szczególności programy antywirusowe i zaporę sieciową typu firewall.</p>
      </section>

      {/* ... reszta regulaminu ... */}
      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">XIV. Postanowienia końcowe</h3>
        <p>Wszelkie prawa do Sklepu Internetowego, w tym majątkowe prawa autorskie, prawa własności intelektualnej do jego nazwy, domeny internetowej, strony internetowej Sklepu Internetowego, a także do formularzy, logotypów należą do Sprzedawcy.</p>
        <p>W sprawach nieuregulowanych w niniejszym Regulaminie mają zastosowanie przepisy Kodeksu Cywilnego, przepisy Ustawy o świadczeniu usług drogą elektroniczną, przepisy Ustawy o prawach Konsumenta oraz inne właściwe przepisy prawa polskiego.</p>
      </section>

    </div>
  </div>
));

const PrivacyView = memo(() => (
  <div className="bg-white rounded-3xl border border-[#e5e5e0] p-8 md:p-16 animate-fade-in shadow-sm max-w-4xl mx-auto">
    <div className="flex items-center gap-4 mb-8 border-b border-[#e5e5e0] pb-6">
      <div className="p-3 bg-[#f5f5f0] rounded-xl text-[#5c6b50]"><Icons.Lock className="w-6 h-6" /></div>
      <h2 className="text-2xl font-bold text-[#44403c]">Polityka Prywatności</h2>
    </div>
    <div className="prose prose-stone max-w-none text-[#78716c] leading-relaxed space-y-8 text-sm font-light">
      <section>
        <h3 className="font-bold text-[#44403c] text-base mb-3">CZYM JEST POLITYKA PRYWATNOŚCI?</h3>
        <p>Chcielibyśmy zapoznać Cię ze szczegółami przetwarzania przez nas Twoich danych osobowych, aby dać Ci pełną wiedzę i komfort w korzystaniu z naszej strony internetowej.</p>
        <p className="mt-2">W związku z tym, że sami działamy w branży internetowej, wiemy jak ważna jest ochrona Twoich danych osobowych. Dlatego dokładamy szczególnych starań, aby chronić Twoją prywatność i informacje, które nam przekazujesz.</p>
        <p className="mt-4 font-bold text-[#44403c]">Kto jest administratorem strony internetowej?</p>
        <p>Administratorem strony internetowej jest {COMPANY_DATA.name}, wpisany do rejestru przedsiębiorców Centralnej Ewidencji i Informacji o Działalności Gospodarczej prowadzonej przez ministra właściwego ds. gospodarki pod adresem {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city}, NIP {COMPANY_DATA.nip}, REGON {COMPANY_DATA.regon} (czyli: my).</p>
      </section>
      {/* ... reszta polityki ... */}
    </div>
  </div>
));

// --- GŁÓWNA APLIKACJA ---

export default function App() {
  const [activeView, setActiveView] = useState('home');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTailwindReady, setIsTailwindReady] = useState(false);
  const [lastOrder, setLastOrder] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const { cart, setCart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast } = useCart();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      const savedCart = localStorage.getItem('pendingCart');
      if (savedCart) {
        setLastOrder(JSON.parse(savedCart));
        localStorage.removeItem('pendingCart'); 
        setCart([]); 
        setActiveView('success'); 
        window.history.replaceState({}, document.title, window.location.pathname); 
      }
    } else if (params.get('canceled')) {
      showToast("Płatność została anulowana.", "error");
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [setCart, showToast]);

  useEffect(() => {
    const checkTailwind = () => {
      if (window.tailwind) {
        setIsTailwindReady(true);
      } else {
        const timeout = setTimeout(checkTailwind, 50);
        return () => clearTimeout(timeout);
      }
    };
    
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
    
    localStorage.setItem('pendingCart', JSON.stringify(cart));
    
    setCheckoutLoading(true);
    try {
      const endpoint = `${API_URL}/create-checkout-session`;
      console.log("Wysyłanie żądania do:", endpoint);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({})); 
        throw new Error(errorData.error || `Błąd serwera: ${res.status}`);
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Brak linku do płatności w odpowiedzi serwera.");
      }
    } catch (err) {
      console.error("Błąd płatności:", err);
      showToast(err.message, "error");
      localStorage.removeItem('pendingCart'); 
    } finally {
      setCheckoutLoading(false);
    }
  };

  const navigate = useCallback((view) => {
    setActiveView(view);
    setSelectedProduct(null);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeProductDetails = () => {
    setSelectedProduct(null);
  };

  if (!isTailwindReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#faf9f6' }}>
        <img src={LOGO_URL} alt="Spiderra" style={{ height: '80px', width: 'auto' }} />
      </div>
    );
  }

  return (
    <div className="bg-[#faf9f6] min-h-screen text-[#44403c] font-sans antialiased">
      <style>{`
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* Nawigacja */}
      <nav className="fixed top-0 w-full bg-[#faf9f6]/90 backdrop-blur-md z-[80] border-b border-[#e7e5e4] h-20 flex items-center shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
          <div className="cursor-pointer flex items-center" onClick={() => navigate('home')}>
            <img src={LOGO_URL} alt="Spiderra" className="h-14 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8 text-sm font-medium text-[#78716c]">
              <button onClick={() => navigate('home')} className={`transition-colors hover:text-[#44403c] ${activeView === 'home' ? 'text-[#44403c]' : ''}`}>Start</button>
              <button onClick={() => navigate('shop')} className={`transition-colors hover:text-[#44403c] ${activeView === 'shop' ? 'text-[#44403c]' : ''}`}>Sklep</button>
              <button onClick={() => navigate('stream')} className={`transition-colors hover:text-[#44403c] ${activeView === 'stream' ? 'text-[#44403c]' : ''}`}>Transmisja</button>
              <button onClick={() => navigate('about')} className={`transition-colors hover:text-[#44403c] ${activeView === 'about' ? 'text-[#44403c]' : ''}`}>O mnie</button>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2.5 rounded-full hover:bg-[#e7e5e4] transition-colors text-[#57534e]">
                <Icons.ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && <span className="absolute top-0 right-0 bg-[#5c6b50] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white font-bold">{cartCount}</span>}
              </button>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-2.5 rounded-full hover:bg-[#e7e5e4] text-[#57534e]">
                <Icons.Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Menu Mobilne */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-[#faf9f6] pt-24 px-6 md:hidden animate-fade-in">
          <div className="flex flex-col gap-6 text-xl font-bold text-[#44403c]">
            <button onClick={() => navigate('home')} className="text-left">Start</button>
            <button onClick={() => navigate('shop')} className="text-left">Sklep</button>
            <button onClick={() => navigate('stream')} className="text-left">Transmisja</button>
            <button onClick={() => navigate('about')} className="text-left">O mnie</button>
            <div className="h-px bg-[#e7e5e4] w-full my-2"></div>
            <button onClick={() => navigate('terms')} className="text-[#78716c] text-base text-left font-medium">Regulamin</button>
            <button onClick={() => navigate('privacy')} className="text-[#78716c] text-base text-left font-medium">Polityka Prywatności</button>
          </div>
        </div>
      )}

      {/* Widok Główny */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-[85vh]">
        {activeView === 'home' && <HomeView navigateTo={navigate} />}
        {activeView === 'about' && <AboutView />}
        {activeView === 'stream' && <StreamView />}
        {activeView === 'terms' && <TermsView />}
        {activeView === 'privacy' && <PrivacyView />}
        {activeView === 'success' && <SuccessView lastOrder={lastOrder} />}
        
        {activeView === 'shop' && (
          selectedProduct ? (
            <ProductDetailsView 
              product={selectedProduct} 
              onBack={closeProductDetails} 
              onAddToCart={(p) => { addToCart(p); }} 
            />
          ) : (
            <ShopView 
              addToCart={addToCart} 
              products={products} 
              loading={loading} 
              onProductClick={openProductDetails} 
            />
          )
        )}
      </main>

      {/* Koszyk Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-[#292524]/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-8 animate-fade-in no-scrollbar border-l border-[#e7e5e4]">
            <div className="flex justify-between items-center mb-8 border-b border-[#e7e5e4] pb-6">
              <h2 className="text-2xl font-bold text-[#44403c]">Twój Koszyk</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-[#f5f5f4] rounded-full hover:bg-[#e7e5e4] transition-colors text-[#78716c] hover:text-[#44403c]"><Icons.X/></button>
            </div>
            <div className="flex-1 overflow-auto no-scrollbar">
              {cart.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Icons.ShoppingCart className="w-16 h-16 mb-4 text-[#d6d3d1]" />
                    <p className="font-medium uppercase tracking-widest text-xs text-[#a8a29e]">Twój koszyk jest pusty</p>
                 </div>
              ) : cart.map(item => (
                <div key={item.id} className="flex gap-4 mb-6 bg-[#fafaf9] p-4 rounded-2xl border border-[#e7e5e4] hover:border-[#d6d3d1] transition-all">
                  <div className="w-20 h-20 bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0">
                     <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <p className="text-[#5c6b50] text-[10px] font-bold uppercase tracking-wide mb-1">{item.latin}</p>
                        <h4 className="font-bold text-[#44403c] text-sm leading-tight">{item.name}</h4>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-white border border-[#e7e5e4] rounded-lg flex items-center justify-center text-[#78716c] hover:text-[#44403c] hover:border-[#d6d3d1] transition-colors">-</button>
                      <span className="font-semibold text-sm text-[#44403c] w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-white border border-[#e7e5e4] rounded-lg flex items-center justify-center text-[#78716c] hover:text-[#44403c] hover:border-[#d6d3d1] transition-colors">+</button>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between items-end">
                    <button onClick={() => removeFromCart(item.id)} className="text-[#d6d3d1] hover:text-red-500 transition-colors p-1"><Icons.Trash2 className="w-4 h-4"/></button>
                    <span className="font-bold text-[#44403c] text-sm">{(item.price * item.qty).toFixed(2)} zł</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-6 border-t border-[#e7e5e4] bg-white">
              <div className="flex justify-between items-end mb-8">
                <span className="text-[#78716c] font-medium">Razem</span>
                <span className="text-2xl font-bold text-[#44403c]">{cartTotal.toFixed(2)} <span className="text-sm font-normal text-[#a8a29e]">PLN</span></span>
              </div>
              <button onClick={handleCheckout} disabled={checkoutLoading || cart.length === 0} className="w-full py-4 bg-[#57534e] text-white rounded-xl font-bold hover:bg-[#44403c] transition-all shadow-lg shadow-[#e7e5e4] disabled:opacity-50 disabled:shadow-none flex items-center justify-center">
                {checkoutLoading ? <Icons.Loader className="w-6 h-6" /> : "PRZEJDŹ DO PŁATNOŚCI"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stopka */}
      <footer className="bg-white border-t border-[#e7e5e4] pt-20 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="mb-6 flex items-center">
                <img src={LOGO_URL} alt="Spiderra" className="h-10 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
              </div>
              <div className="flex gap-3">
                <button className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.Instagram className="w-5 h-5"/></button>
                <button className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.TikTok className="w-5 h-5"/></button>
                <button className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.Kick className="w-5 h-5"/></button>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-[#44403c] uppercase tracking-widest text-xs mb-6">Sklep</h4>
              <ul className="space-y-4 text-sm font-medium text-[#78716c]">
                <li><button onClick={() => navigate('shop')} className="hover:text-[#44403c] text-left transition-colors">Ptaszniki</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-[#44403c] text-left transition-colors">Akcesoria</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-[#44403c] text-left transition-colors">Nowości</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#44403c] uppercase tracking-widest text-xs mb-6">Pomoc</h4>
              <ul className="space-y-4 text-sm font-medium text-[#78716c]">
                <li><button onClick={() => navigate('terms')} className="hover:text-[#44403c] text-left transition-colors">Regulamin</button></li>
                <li><button onClick={() => navigate('privacy')} className="hover:text-[#44403c] text-left transition-colors">Polityka Prywatności</button></li>
                <li><button onClick={() => navigate('terms')} className="hover:text-[#44403c] text-left transition-colors">Wysyłka i Zwroty</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[#44403c] uppercase tracking-widest text-xs mb-6">Kontakt</h4>
              <p className="text-sm font-medium text-[#78716c] mb-2">{COMPANY_DATA.email}</p>
              <p className="text-sm font-medium text-[#78716c] mb-6">{COMPANY_DATA.phone}</p>
              <div className="text-xs text-[#a8a29e] font-light leading-relaxed">
                  <p>{COMPANY_DATA.name}</p>
                  <p>ul. {COMPANY_DATA.address}</p>
                  <p>{COMPANY_DATA.zip} {COMPANY_DATA.city}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[#e7e5e4] flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-[#d6d3d1] tracking-widest uppercase">
            <p>&copy; {new Date().getFullYear()} Spiderra Lab. Wszystkie prawa zastrzeżone.</p>
            <p className="opacity-50">Design & Code for Arek</p>
          </div>
        </div>
      </footer>

      {/* Powiadomienia Toast */}
      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#292524] text-white shadow-2xl'} rounded-full transition-all duration-500 flex items-center gap-3 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        {toast.type === 'success' ? <Icons.Check className="text-emerald-400 w-4 h-4" /> : <Icons.X className="w-4 h-4" />}
        <span className="font-medium text-sm tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
}