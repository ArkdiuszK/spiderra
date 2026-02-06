import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';

// --- KONFIGURACJA API ---
const isProduction = window.location.hostname !== 'localhost';
const API_URL = isProduction ? '/.netlify/functions' : 'http://localhost:4242';

// --- KONFIGURACJA DANYCH FIRMY ---
const COMPANY_DATA = {
  name: "Spiderra - Arkadiusz Kołacki",
  address: "Lisów 88",
  zip: "26-660",
  city: "Lisów",
  email: "spiderra.kontakt@outlook.com",
  phone: "+48 514 729 121",
  nip: "0000000000", 
  regon: "000000000",
  bankAccount: "00 0000 0000 0000 0000 0000 0000"
};

// --- KONFIGURACJA ZDJĘĆ ---
const LOGO_URL = "/zdjecia/logo.png"; 
const HERO_IMAGE_URL = "/zdjecia/tlo.jpg"; 

// --- DEFINICJA KATEGORII I GRUP FILTRÓW ---
const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'Wszystko' },
  { 
    id: 'spider', 
    label: 'Ptaszniki',
    filterGroups: [
      {
        label: "Płeć", 
        tags: [
          { id: 'female', label: 'Samica' },
          { id: 'male', label: 'Samiec' },
          { id: 'unsexed', label: 'Niesex (NS)' }
        ]
      },
      {
        label: "Dla kogo?",
        tags: [
          { id: 'beginner', label: 'Dla początkujących' },
          { id: 'intermediate', label: 'Dla średniozaawansowanych' },
          { id: 'advanced', label: 'Dla zaawansowanych' }
        ]
      },
      {
        label: "Typ / Cechy",
        tags: [
          { id: 'terrestrial', label: 'Naziemne' },
          { id: 'arboreal', label: 'Nadrzewne' },
          { id: 'fossorial', label: 'Podziemne' },
          { id: 'dwarf', label: 'Karłowate' },
          { id: 'rare', label: 'Rzadkie' },
          { id: 'bestseller', label: 'Bestsellery' }
        ]
      }
    ]
  },
  { 
    id: 'gear', 
    label: 'Akcesoria',
    filterGroups: [
      {
        label: "Kategorie",
        tags: [
          { id: 'terrarium', label: 'Terraria' },
          { id: 'container', label: 'Pojemniki hodowlane' },
          { id: 'substrate', label: 'Podłoże' },
          { id: 'tools', label: 'Narzędzia' },
          { id: 'heating', label: 'Ogrzewanie' },
          { id: 'decor', label: 'Wystrój' }
        ]
      }
    ]
  }
];

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#faf9f6] text-[#44403c] p-4">
          <h1 className="text-3xl font-bold mb-4">Ups! Coś poszło nie tak.</h1>
          <p className="mb-6 text-[#78716c]">Wystąpił błąd krytyczny aplikacji. Spróbuj odświeżyć stronę.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-[#57534e] text-white rounded-xl hover:bg-[#44403c] transition-colors shadow-lg"
          >
            Odśwież stronę
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// --- POMOCNICY (SEO, Tailwind, Reveal) ---
const SEO = ({ title, description }) => {
  useEffect(() => {
    document.title = title ? `${title} | Spiderra` : "Spiderra - Sklep z Ptaszniki i Akcesoriami";
    let metaDesc = document.querySelector("meta[name='description']");
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.name = "description";
      document.head.appendChild(metaDesc);
    }
    metaDesc.content = description || "Sklep z ptasznikami i akcesoriami hodowlanymi.";
  }, [title, description]);
  return null;
};

const injectTailwind = () => {
  if (typeof document !== 'undefined' && !document.getElementById('tailwind-cdn')) {
    const script = document.createElement('script');
    script.id = 'tailwind-cdn';
    script.src = "https://cdn.tailwindcss.com";
    script.async = true;
    document.head.appendChild(script);
  }
};
injectTailwind();

const useReveal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
        setIsVisible(true);
        return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
};

const Reveal = memo(({ children, className = "", delay = 0 }) => {
  const [ref, isVisible] = useReveal();
  const transitionDelay = `${delay}ms`;
  return (
    <div 
      ref={ref} 
      className={`transition-all duration-700 ease-out transform will-change-transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay }}
    >
      {children}
    </div>
  );
});

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
  ArrowRight: (p) => <IconBase {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></IconBase>,
  ChevronLeft: (p) => <IconBase {...p}><polyline points="15 18 9 12 15 6" /></IconBase>,
  ChevronRight: (p) => <IconBase {...p}><polyline points="9 18 15 12 9 6" /></IconBase>,
  Filter: (p) => <IconBase {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IconBase>,
  MessageCircle: (p) => <IconBase {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></IconBase>,
  Truck: (p) => <IconBase {...p}><rect width="16" height="13" x="2" y="5" rx="2" /><path d="M2 9h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /><path d="M5 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><circle cx="7" cy="15" r="2" /><circle cx="17" cy="15" r="2" /></IconBase>,
  Box: (p) => <IconBase {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></IconBase>,
  Camera: (p) => <IconBase {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></IconBase>,
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
  Loader: (p) => <IconBase {...p} className={`animate-spin ${p.className}`}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></IconBase>,
  ArrowUp: (p) => <IconBase {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></IconBase>
};

// --- DANE PRODUKTÓW (MOCK) ---
const MOCK_PRODUCTS_DATA = [
  { 
    id: 'spider1', 
    name: 'Grammostola rosea', 
    latin: 'Grammostola rosea', 
    type: 'spider', 
    tags: ['terrestrial', 'beginner', 'bestseller', 'female'], 
    price: 150.00, 
    image: '/zdjecia/ptaszniki/grammostola_rosea.jpg', 
    desc: 'Ptasznik z Chile, znany ze swojego spokojnego usposobienia i łatwości hodowli. Gatunek naziemny, idealny dla początkujących.' 
  },
  { 
    id: 'spider2', 
    name: 'Caribena versicolor', 
    latin: 'Caribena versicolor', 
    type: 'spider', 
    tags: ['arboreal', 'beginner', 'bestseller', 'unsexed'], 
    price: 85.00, 
    image: 'https://placehold.co/400x300/e2e8f0/10b981?text=Versicolor', 
    desc: 'Jeden z najpiękniejszych ptaszników nadrzewnych. Dzięki łagodnemu usposobieniu nadaje się na pierwszego pająka nadrzewnego.' 
  },
  { 
    id: 'spider3', 
    name: 'Theraphosa stirmi', 
    latin: 'Theraphosa stirmi', 
    type: 'spider', 
    tags: ['terrestrial', 'advanced', 'rare', 'sold_out', 'female'], 
    price: 450.00, 
    image: 'https://placehold.co/400x300/e2e8f0/991b1b?text=Stirmi', 
    desc: 'Jeden z największych pająków świata. Wymaga doświadczenia w utrzymaniu odpowiedniej wilgotności.' 
  },
  { 
    id: 'kit_s', 
    name: 'Zestaw S "Plecak" | Dla małych ptaszników', 
    latin: 'Dla L1-L3', 
    type: 'gear', 
    tags: ['container', 'bestseller'], 
    price: 11.99, 
    image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Zestaw+S', 
    desc: 'Najlepszy start dla malucha (L1-L3). W skład zestawu wchodzi profesjonalny pojemnik hodowlany typu Breeding Box (5x5x7cm) z bezpieczną klapką "feeding hatch", która ułatwia karmienie bez ryzyka ucieczki pająka. Krystalicznie przejrzyste ścianki pozwalają na doskonałą obserwację, a precyzyjna boczna wentylacja zapewnia zdrowy przepływ powietrza. To nie jest zwykłe pudełko – to bezpieczny azyl dla Twojego nowego podopiecznego.',
    variants: [
      { id: 'eco', name: 'Economy', price: 11.99, desc: 'Pojemnik + Torf', stripeId: 'price_PLACEHOLDER_ECO_S' }, 
      { id: 'biz', name: 'Business', price: 14.99, desc: 'Pojemnik + Torf + Kora', stripeId: 'price_PLACEHOLDER_BIZ_S' },
      { id: 'first', name: 'First Class', price: 17.99, desc: 'Premium + Mech + Ozdoby', stripeId: 'price_PLACEHOLDER_FIRST_S' }
    ]
  },
  { 
    id: 'kit_m', 
    name: 'Zestaw "Walizka podręczna" | Dla średnich ptaszników', 
    latin: 'Dla L4-L7', 
    type: 'gear', 
    tags: ['container'], 
    price: 39.99,
    image: 'https://placehold.co/400x300/f1f5f9/a8a29e?text=Zestaw+M', 
    desc: 'Komfortowa przesiadka do klasy biznes dla podrostków (L4-L7). Sercem zestawu jest przestronny box hodowlany (wymiary ok. 19x12,5x7,5 cm), który zapewnia idealną przestrzeń życiową na etapie dynamicznego wzrostu. Pojemnik wyposażony jest w wygodną klapkę inspekcyjną ("feeding hatch") do bezpiecznego podawania karmy oraz fabryczny system wentylacji bocznej i górnej. Krystalicznie czyste ścianki pozwalają cieszyć się widokiem pupila, a solidne zamknięcie gwarantuje, że pająk zostanie w środku.',
    variants: [
      { id: 'eco', name: 'Economy', price: 39.99, desc: 'Moczbox + Torf', stripeId: 'price_PLACEHOLDER_ECO_M' },
      { id: 'biz', name: 'Business', price: 49.00, desc: 'Braplast + Tuba', stripeId: 'price_PLACEHOLDER_BIZ_M' },
      { id: 'first', name: 'First Class', price: 65.00, desc: 'Braplast + Tuba + Wystrój + Miska', stripeId: 'price_PLACEHOLDER_FIRST_M' }
    ]
  },
  { 
    id: 'kit_l', 
    name: 'Zestaw "Bagaż rejestrowany" | Dla dużych ptaszników', 
    latin: 'Dla Dorosłych', 
    type: 'gear', 
    tags: ['container'], 
    price: 72.99,
    image: 'https://placehold.co/400x300/f1f5f9/78716c?text=Zestaw+L', 
    desc: 'Luksusowa rezydencja dla dorosłych gigantów. Zestaw "Bagaż Rejestrowany" opiera się na masywnym pojemniku hodowlanym o wymiarach 32x22x15 cm, zapewniającym ogromną przestrzeń życiową nawet dla największych ptaszników. Box posiada zintegrowaną miskę na wodę (koniec z przewracaniem!), bezpieczny "feeding hatch" w pokrywie oraz system wentylacji krzyżowej. To docelowy apartament, w którym Twój pająk poczuje się jak król dżungli.',
    variants: [
      { id: 'eco', name: 'Economy', price: 72.99, desc: 'Box + Torf', stripeId: 'price_PLACEHOLDER_ECO_L' },
      { id: 'biz', name: 'Business', price: 89.00, desc: 'Duży Braplast + Duża Tuba', stripeId: 'price_PLACEHOLDER_BIZ_L' },
      { id: 'first', name: 'First Class', price: 129.00, desc: 'Terrarium/Box + Ścianka + Full Opcja', stripeId: 'price_PLACEHOLDER_FIRST_L' }
    ]
  },
  { id: 'gear2', name: 'Włókno kokosowe', latin: 'Substrat prasowany', type: 'gear', tags: ['substrate', 'bestseller'], price: 15.00, image: 'https://placehold.co/400x300/f1f5f9/a8a29e?text=Włókno', desc: 'Podstawowe podłoże do terrariów. Dobrze trzyma wilgoć, bezpieczne dla zwierząt.' },
  { id: 'gear3', name: 'Pęseta długa', latin: '30 cm', type: 'gear', tags: ['tools'], price: 25.00, image: 'https://placehold.co/400x300/e2e8f0/64748b?text=Pęseta', desc: 'Niezbędne narzędzie do karmienia i sprzątania w terrarium. Stal nierdzewna.' },
];

const useCart = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    const msgString = (typeof message === 'string') ? message : 'Wystąpił błąd operacji.';
    setToast({ visible: true, message: msgString, type });
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
  
  // --- SPRAWDZANIE CZY W KOSZYKU SĄ ZWIERZĘTA ---
  const hasLiveAnimals = useMemo(() => cart.some(item => item.type === 'spider'), [cart]);

  return { cart, setCart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast, hasLiveAnimals };
};

// --- KOMPONENT: SCROLL TO TOP ---
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 500) setVisible(true);
      else setVisible(false);
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-24 right-6 z-[90] p-3 bg-white border border-[#e7e5e4] rounded-full shadow-lg text-[#57534e] hover:bg-[#f5f5f4] transition-all duration-300 transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}
    >
      <Icons.ArrowUp className="w-5 h-5" />
    </button>
  );
};

// --- WIDOKI (DEFINIOWANE PRZED APPCONTENT) ---
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
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" decoding="async"/>
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

// ... (BestsellerSlider, TravelGallery - bez zmian) ...
const BestsellerSlider = memo(({ products, onProductClick, addToCart }) => {
  const scrollRef = useRef(null);
  const bestsellers = useMemo(() => {
    const tagged = products.filter(p => p.tags && Array.isArray(p.tags) && p.tags.includes('bestseller'));
    return tagged.length > 0 ? tagged : products.slice(0, 5); 
  }, [products]);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 320; 
      current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  if (bestsellers.length === 0) return null;
  return (
    <div className="relative group/slider">
      <div className="flex items-center justify-between mb-6 px-2">
        <h3 className="text-2xl font-bold text-[#44403c]">Bestsellery</h3>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-2 rounded-full border border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#44403c] transition-colors"><Icons.ChevronLeft className="w-5 h-5"/></button>
          <button onClick={() => scroll('right')} className="p-2 rounded-full border border-[#e7e5e4] text-[#78716c] hover:bg-[#f5f5f4] hover:text-[#44403c] transition-colors"><Icons.ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 snap-x scroll-smooth no-scrollbar"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {bestsellers.map(product => (
          <div 
            key={product.id} 
            className="flex-shrink-0 w-72 bg-white rounded-2xl border border-[#e5e5e0] snap-start hover:shadow-xl transition-all duration-300 group/card cursor-pointer"
            onClick={() => onProductClick(product)}
          >
            <div className="h-48 overflow-hidden rounded-t-2xl bg-[#fafaf9] relative">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async"/>
              <div className="absolute top-3 left-3 bg-[#5c6b50] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                Top
              </div>
            </div>
            <div className="p-5">
              <p className="text-[#5c6b50] text-[10px] font-bold uppercase tracking-widest mb-1">{product.latin}</p>
              <h4 className="font-bold text-lg text-[#44403c] mb-2 line-clamp-1">{product.name}</h4>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xl font-bold text-[#44403c]">{product.price.toFixed(2)} zł</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    addToCart(product);
                  }}
                  className="w-8 h-8 rounded-full bg-[#f5f5f4] flex items-center justify-center text-[#44403c] group-hover/card:bg-[#57534e] group-hover/card:text-white transition-colors"
                >
                  <Icons.Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const TravelGallery = memo(({ navigateTo }) => {
  const photos = [
    { id: 1, src: "/zdjecia/cypr.jpg", location: "Cypr", desc: "Tarantula w naturze" },
    { id: 2, src: "/zdjecia/madera.jpg", location: "Madera", desc: "Madera" },
    { id: 3, src: "/zdjecia/hiszpania.JPG", location: "Hiszpania", desc: "Barcelona" },
    { id: 4, src: "/zdjecia/maroko.jpg", location: "Maroko", desc: "Marrakesz" },
  ];
  const displayPhotos = photos.slice(0, 4);
  return (
    <section className="max-w-7xl mx-auto px-6 pt-16">
      <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2 text-[#5c6b50]">
            <Icons.Camera className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest">Ekspedycje</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-[#44403c]">Z Dziennika Podróży</h3>
        </div>
        <p className="text-[#78716c] text-sm max-w-md text-right md:text-left font-light leading-relaxed">
          Nie jestem tylko sprzedawcą – jestem badaczem. Zobacz, jak wyglądają naturalne siedliska pająków, które oferuję.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-[250px] gap-4">
        {displayPhotos.map((photo, index) => (
          <div 
            key={photo.id}
            className={`relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm border border-[#e5e5e0] ${
              index === 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-1'
            }`}
          >
            <img src={photo.src} alt={photo.location} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" loading="lazy" decoding="async"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <p className="text-white font-bold text-lg">{photo.location}</p>
              {index === 0 && <p className="text-stone-300 text-sm mt-1">{photo.desc}</p>}
            </div>
          </div>
        ))}
        <div 
          onClick={() => navigateTo('stream')} 
          className="relative rounded-3xl overflow-hidden shadow-sm border border-[#e5e5e0] bg-[#57534e] flex flex-col items-center justify-center p-6 text-center cursor-pointer group hover:bg-[#44403c] transition-colors md:col-span-1"
        >
            <p className="text-white font-bold text-xl mb-2">...i wiele więcej!</p>
            <p className="text-[#a8a29e] text-xs leading-relaxed max-w-[150px]">
              Śledź moje wyprawy na bieżąco w sekcji Transmisja.
            </p>
            <div className="mt-6 p-3 rounded-full bg-white/10 group-hover:bg-white/20 transition-colors">
                <Icons.ArrowRight className="w-5 h-5 text-white" />
            </div>
        </div>
      </div>
    </section>
  );
});

const ProductDetailsView = memo(({ product, onBack, onAddToCart, allProducts }) => {
  const isSoldOut = product.tags && product.tags.includes('sold_out');

  const [selectedVariant, setSelectedVariant] = useState(
    (product.variants && product.variants.length > 0) ? product.variants[0] : null
  );

  useEffect(() => {
    if(product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
    } else {
        setSelectedVariant(null);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (isSoldOut) return;

    if (selectedVariant) {
      const variantProduct = {
        id: `${product.id}-${selectedVariant.id}`, 
        name: `${product.name} - ${selectedVariant.name}`,
        price: selectedVariant.price,
        image: product.image,
        latin: product.latin,
        stripeId: selectedVariant.stripeId,
        originalId: product.id,
        // PRZEKAZUJEMY TYP PRODUKTU!
        type: product.type 
      };
      onAddToCart(variantProduct);
    } else {
      const cleanProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        latin: product.latin,
        // PRZEKAZUJEMY TYP PRODUKTU!
        type: product.type
      };
      onAddToCart(cleanProduct);
    }
  };
  
  // ... (reszta ProductDetailsView bez zmian)
  const relatedProducts = useMemo(() => {
    if (!allProducts) return [];
    if (product.type === 'spider') {
      return allProducts.filter(p => p.type === 'gear').slice(0, 3);
    } else {
      return allProducts.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 3);
    }
  }, [product, allProducts]);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const showVariantSelector = product.variants && product.variants.length > 1;

  return (
    <div className="animate-fade-in space-y-12">
      <div className="bg-white rounded-3xl border border-[#e5e5e0] p-6 md:p-12 shadow-sm max-w-6xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-[#78716c] hover:text-[#44403c] mb-8 font-medium transition-colors">
          <Icons.ArrowLeft className="w-5 h-5" /> Wróć do sklepu
        </button>
        <div className="flex flex-col md:flex-row gap-12">
          <div className="w-full md:w-1/2">
            <div className="aspect-square rounded-3xl overflow-hidden bg-[#fafaf9] shadow-sm border border-[#e7e5e4] relative">
              <img src={product.image} alt={product.name} className={`w-full h-full object-cover ${isSoldOut ? 'grayscale opacity-70' : ''}`} loading="eager" />
              
              {isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <div className="bg-[#44403c] text-white px-6 py-2 rounded-xl font-bold text-lg shadow-lg rotate-[-5deg] border-2 border-white">
                        WYPRZEDANE
                    </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2 flex flex-col">
            <div>
              <p className="text-[#5c6b50] font-bold uppercase tracking-widest text-xs mb-2">{product.latin}</p>
              <h2 className="text-4xl font-bold text-[#44403c] mb-4 leading-tight">{product.name}</h2>
              <p className="text-2xl font-semibold text-[#57534e] mb-6 animate-fade-in" key={currentPrice}>
                {currentPrice.toFixed(2)} PLN
              </p>
               
              <div className="prose prose-stone text-[#78716c] mb-8 leading-relaxed">
                <p>{product.desc || "Brak szczegółowego opisu dla tego produktu."}</p>
              </div>

              {showVariantSelector && (
                <div className={`mb-8 p-4 bg-[#fafaf9] rounded-2xl border border-[#e7e5e4] ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#a8a29e] mb-3">Wybierz wersję:</p>
                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <div 
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`flex justify-between items-center p-4 rounded-xl cursor-pointer border-2 transition-all ${
                          selectedVariant && selectedVariant.id === variant.id 
                            ? 'border-[#5c6b50] bg-white shadow-md' 
                            : 'border-transparent bg-white hover:border-[#e7e5e4]'
                        }`}
                      >
                        <div>
                          <p className={`font-bold text-sm ${selectedVariant && selectedVariant.id === variant.id ? 'text-[#5c6b50]' : 'text-[#44403c]'}`}>
                            {variant.name}
                          </p>
                          <p className="text-xs text-[#78716c]">{variant.desc}</p>
                        </div>
                        <span className="font-bold text-[#44403c]">{variant.price.toFixed(2)} zł</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2 text-sm text-[#78716c]">
                 <p>
                    <span className="font-semibold text-[#44403c]">Dostępność:</span>{' '}
                    {isSoldOut ? <span className="text-red-600 font-bold">Wyprzedane</span> : <span className="text-emerald-600">W magazynie</span>}
                 </p>
                 <p><span className="font-semibold text-[#44403c]">Wysyłka:</span> 24h (Dni robocze)</p>
              </div>
            </div>
             
            <div className="mt-auto pt-8 border-t border-[#e5e5e0]">
              <button 
                onClick={handleAddToCart} 
                disabled={isSoldOut}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-3 active:scale-[0.98] ${
                    isSoldOut 
                    ? 'bg-[#e7e5e4] text-[#a8a29e] cursor-not-allowed shadow-none' 
                    : 'bg-[#57534e] text-white hover:bg-[#44403c]'
                }`}
              >
                {isSoldOut ? (
                    'Produkt niedostępny'
                ) : (
                    <>
                        <Icons.Plus className="w-6 h-6" /> 
                        {showVariantSelector ? `Dodaj wariant ${selectedVariant ? selectedVariant.name : ''}` : 'Dodaj do koszyka'}
                    </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* ... (sekcja related products) ... */}
    </div>
  );
});

// ... (HomeView, ShopView, AboutView, StreamView, ShippingReturnsView, TermsView, PrivacyView - bez zmian) ...
// (Zakładam, że wkleiłeś poprzedni plik, więc nie będę powtarzał tych sekcji, chyba że chcesz - 
// Skupiam się na Głównej Aplikacji gdzie jest koszyk)

// --- GŁÓWNA APLIKACJA ---
function AppContent() {
  const [activeView, setActiveView] = useState('home');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTailwindReady, setIsTailwindReady] = useState(false);
  const [lastOrder, setLastOrder] = useState(null); 
  const [selectedProduct, setSelectedProduct] = useState(null);
   
  const { cart, setCart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast, hasLiveAnimals } = useCart();

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
        let data = await res.json();
         
        data = data.map(product => ({
            ...product,
            tags: typeof product.tags === 'string' ? product.tags.split(',').map(t => t.trim()) : (product.tags || []),
            type: product.type || 'spider', 
            latin: product.latin || '',
        }));

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
      showToast(err.message || "Błąd płatności", "error");
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
        <div style={{ marginTop: '12px', color: '#9ca3af', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px' }}>Ładowanie stylów...</div>
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

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[90] bg-[#faf9f6] pt-24 px-6 md:hidden animate-fade-in">
          <div className="flex flex-col gap-6 text-xl font-bold text-[#44403c]">
            <button onClick={() => navigate('home')} className="text-left">Start</button>
            <button onClick={() => navigate('shop')} className="text-left">Sklep</button>
            <button onClick={() => navigate('stream')} className="text-left">Transmisja</button>
            <button onClick={() => navigate('about')} className="text-left">O mnie</button>
            <div className="h-px bg-[#e7e5e4] w-full my-2"></div>
            <button onClick={() => navigate('shipping')} className="text-[#78716c] text-base text-left font-medium">Wysyłka i Zwroty</button>
            <button onClick={() => navigate('terms')} className="text-[#78716c] text-base text-left font-medium">Regulamin</button>
            <button onClick={() => navigate('privacy')} className="text-[#78716c] text-base text-left font-medium">Polityka Prywatności</button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-[85vh]">
        {activeView === 'home' && <HomeView navigateTo={navigate} products={products} onProductClick={openProductDetails} addToCart={addToCart} />}
        {activeView === 'about' && <AboutView />}
        {activeView === 'stream' && <StreamView />}
        {activeView === 'terms' && <TermsView />}
        {activeView === 'privacy' && <PrivacyView />}
        {activeView === 'shipping' && <ShippingReturnsView />}
        {activeView === 'success' && <SuccessView lastOrder={lastOrder} />}
         
        {activeView === 'shop' && (
          selectedProduct ? (
            <ProductDetailsView 
              product={selectedProduct} 
              onBack={closeProductDetails} 
              onAddToCart={(p) => { addToCart(p); }} 
              allProducts={products}
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

      {/* --- PRZYCISK SCROLL TO TOP --- */}
      <ScrollToTop />

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

            {/* --- SEKCJA PŁATNOŚCI W KOSZYKU --- */}
            <div className="pt-6 border-t border-[#e7e5e4] bg-white">
              {/* Informacja o wymuszonej wysyłce (tylko wizualna, backend blokuje resztę) */}
              {hasLiveAnimals && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-xl mb-4 flex items-start gap-2">
                      <Icons.Bug className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                          <p className="font-bold">Twój koszyk zawiera żywe zwierzęta.</p>
                          <p>Dostępna będzie tylko bezpieczna wysyłka (Pocztex/Heatpack).</p>
                      </div>
                  </div>
              )}

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

      {/* Stopka (bez zmian) */}
      <footer className="bg-white border-t border-[#e7e5e4] pt-20 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div>
              <div className="mb-6 flex items-center">
                <img src={LOGO_URL} alt="Spiderra" className="h-10 w-auto object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-500" />
              </div>
              <div className="flex gap-3">
                <a href="https://www.instagram.com/sp_iderra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.Instagram className="w-5 h-5"/></a>
                <a href="https://www.tiktok.com/@spiderra26" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.TikTok className="w-5 h-5"/></a>
                <a href="https://kick.com/spiderra" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#f5f5f4] rounded-full flex items-center justify-center text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-[#44403c] transition-all"><Icons.Kick className="w-5 h-5"/></a>
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
                <li><button onClick={() => navigate('shipping')} className="hover:text-[#44403c] text-left transition-colors">Wysyłka i Zwroty</button></li>
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
            <p>&copy; {new Date().getFullYear()} Spiderra ©. Wszystkie prawa zastrzeżone.</p>
          </div>
        </div>
      </footer>

      <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 ${toast.type === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-[#292524] text-white shadow-2xl'} rounded-full transition-all duration-500 flex items-center gap-3 ${toast.visible ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0'}`}>
        {toast.type === 'success' ? <Icons.Check className="text-emerald-400 w-4 h-4" /> : <Icons.X className="w-4 h-4" />}
        <span className="font-medium text-sm tracking-wide">{toast.message}</span>
      </div>
    </div>
  );
}

// --- GŁÓWNY PUNKT WEJŚCIA (APP) ---
export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}