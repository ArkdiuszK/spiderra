import React, { useState, useMemo, useCallback, memo, useEffect, useRef } from 'react';

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) { console.error("ErrorBoundary caught an error", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFCF8] text-[#1C1917] p-4 text-center">
          <h1 className="font-serif text-3xl mb-4 font-bold">Ups! Coś poszło nie tak.</h1>
          <p className="mb-6 text-[#3F4F44]/70">Wystąpił błąd krytyczny aplikacji. Spróbuj odświeżyć stronę.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-3 bg-[#1C1917] text-white rounded-sm hover:bg-[#3F4F44] transition-colors shadow-lg font-bold uppercase tracking-widest text-xs"
          >
            Odśwież stronę
          </button>
        </div>
      );
    }
    return this.props.children; 
  }
}

// --- KONFIGURACJA STYLU (PREMIUM LOOK & FEEL) ---
const injectStyles = () => {
  if (typeof document !== 'undefined') {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      script.onload = () => {
        window.tailwind.config = {
          theme: {
            extend: {
              colors: {
                spider: {
                  base: '#FDFCF8',
                  dark: '#1C1917',
                  primary: '#3F4F44',
                  gold: '#C5A065',
                  sand: '#E7E5E4',
                  light: '#F5F5F4'
                }
              },
              fontFamily: {
                serif: ['Playfair Display', 'serif'],
                sans: ['Inter', 'sans-serif'],
              },
              animation: {
                'fade-in': 'fadeIn 0.8s ease-out forwards',
                'slide-in-right': 'slideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'slide-in-up': 'slideInUp 0.5s ease-out forwards',
                'scroll-left': 'scrollLeft 60s linear infinite',
                'scroll-left-slow': 'scrollLeft 80s linear infinite',
              },
              keyframes: {
                fadeIn: { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
                slideInRight: { from: { transform: 'translateX(100%)' }, to: { transform: 'translateX(0)' } },
                slideInUp: { from: { transform: 'translateY(100%)' }, to: { transform: 'translateY(0)' } },
                scrollLeft: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-33.33%)' } }
              }
            }
          }
        };
      };
      document.head.appendChild(script);
    }
    if (!document.getElementById('google-fonts')) {
      const link = document.createElement('link');
      link.id = 'google-fonts';
      link.rel = 'stylesheet';
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&display=swap";
      document.head.appendChild(link);
    }
  }
};
injectStyles();

// --- KONFIGURACJA API (AUTO-WYKRYWANIE) ---
const getApiUrl = () => {
    if (typeof window === 'undefined') return '';
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return 'http://localhost:4242';
    if (protocol === 'blob:' || hostname.includes('sandbox') || hostname.includes('usercontent') || hostname.includes('google')) return 'SIMULATION'; 
    return '/.netlify/functions';
};
const API_URL = getApiUrl();

const COMPANY_DATA = {
  name: "Spiderra.pl - Arkadiusz Kołacki",
  address: "Rakowicka 22D/27",
  zip: "31-510",
  city: "Kraków",
  email: "spiderra.kontakt@outlook.com",
  phone: "+48 514 729 121",
  nip: "05300309233", 
  bankAccount: "PL 50 1050 1588 1000 0097 9433 1703",
  socials: {
    instagram: "https://www.instagram.com/sp_iderra",
    tiktok: "https://www.tiktok.com/@spiderra26",
    kick: "https://kick.com/spiderra"
  }
};

const LOGO_URL = "/zdjecia/logo.png"; 
const LOGO_URL2 = "/zdjecia/logo2.png"; 
const HERO_IMAGE_URL = "/zdjecia/tlo.jpg"; 

const PRODUCT_CATEGORIES = [
  { id: 'all', label: 'Wszystko' },
  { id: 'spider', label: 'Ptaszniki', filterGroups: [
      { label: "Płeć", tags: [{ id: 'female', label: 'Samica' }, { id: 'male', label: 'Samiec' }, { id: 'unsexed', label: 'Niesex' }] },
      { label: "Poziom", tags: [{ id: 'beginner', label: 'Dla początkujących' }, { id: 'intermediate', label: 'Dla średniozaawansowanych' }, { id: 'advanced', label: 'Dla zaawansowanych' }] },
      { label: "Typ", tags: [{ id: 'terrestrial', label: 'Naziemne' }, { id: 'arboreal', label: 'Nadrzewne' }, { id: 'fossorial', label: 'Podziemne' }, { id: 'rare', label: 'Rzadkie' }, { id: 'bestseller', label: 'Bestsellery' }] }
  ]},
  { id: 'gear', label: 'Akcesoria', filterGroups: [
      { label: "Kategorie", tags: [{ id: 'terrarium', label: 'Terraria' }, { id: 'container', label: 'Pojemniki' }, { id: 'substrate', label: 'Podłoże' }, { id: 'tools', label: 'Narzędzia' }, { id: 'heating', label: 'Ogrzewanie' }, { id: 'decor', label: 'Wystrój' }] }
  ]}
];

const MOCK_PRODUCTS_DATA = [
  { id: 'spider1', name: 'Grammostola rosea', latin: 'Grammostola rosea', type: 'spider', tags: ['terrestrial', 'beginner', 'bestseller', 'female'], price: 150.00, image: '/zdjecia/ptaszniki/grammostola_rosea.jpg', desc: 'Ptasznik z Chile, znany ze swojego spokojnego usposobienia i łatwości hodowli. Gatunek naziemny, idealny dla początkujących.' },
  { id: 'spider2', name: 'Caribena versicolor', latin: 'Caribena versicolor', type: 'spider', tags: ['arboreal', 'beginner', 'bestseller', 'unsexed'], price: 85.00, image: 'https://placehold.co/400x300/e2e8f0/10b981?text=Versicolor', desc: 'Jeden z najpiękniejszych ptaszników nadrzewnych. Dzięki łagodnemu usposobieniu nadaje się na pierwszego pająka nadrzewnego.' },
  { id: 'spider3', name: 'Theraphosa stirmi', latin: 'Theraphosa stirmi', type: 'spider', tags: ['terrestrial', 'advanced', 'rare', 'sold_out', 'female'], price: 450.00, image: 'https://placehold.co/400x300/e2e8f0/991b1b?text=Stirmi', desc: 'Jeden z największych pająków świata. Wymaga doświadczenia w utrzymaniu odpowiedniej wilgotności.' },
  { id: 'kit_s', name: 'Zestaw S "Plecak"', latin: 'Dla L1-L3', type: 'gear', tags: ['container', 'bestseller'], price: 11.99, image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Zestaw+S', desc: 'Najlepszy start dla malucha. W skład zestawu wchodzi profesjonalny pojemnik hodowlany.', variants: [{ id: 'eco', name: 'Economy', price: 11.99, desc: 'Pojemnik + Torf' }, { id: 'biz', name: 'Business', price: 14.99, desc: 'Premium' }] },
  { id: 'kit_m', name: 'Zestaw "Walizka"', latin: 'Dla L4-L7', type: 'gear', tags: ['container'], price: 39.99, image: 'https://placehold.co/400x300/f1f5f9/a8a29e?text=Zestaw+M', desc: 'Komfortowa przesiadka do klasy biznes dla podrostków.', variants: [{ id: 'eco', name: 'Economy', price: 39.99, desc: 'Moczbox' }, { id: 'biz', name: 'Business', price: 49.00, desc: 'Braplast' }] },
  { id: 'gear2', name: 'Włókno kokosowe', latin: 'Substrat', type: 'gear', tags: ['substrate', 'bestseller'], price: 15.00, image: 'https://placehold.co/400x300/f1f5f9/a8a29e?text=Włókno', desc: 'Podstawowe podłoże.' }
];

const IconBase = ({ children, className, ...props }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>{children}</svg>
);

const Icons = {
  ShoppingCart: (p) => <IconBase {...p}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></IconBase>,
  Menu: (p) => <IconBase {...p}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></IconBase>,
  X: (p) => <IconBase {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></IconBase>,
  Plus: (p) => <IconBase {...p}><path d="M5 12h14"/><path d="M12 5v14"/></IconBase>,
  Minus: (p) => <IconBase {...p}><path d="M5 12h14"/></IconBase>,
  Trash2: (p) => <IconBase {...p}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></IconBase>,
  Bug: (p) => <IconBase {...p}><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/></IconBase>,
  Check: (p) => <IconBase {...p}><polyline points="20 6 9 17 4 12"/></IconBase>,
  ArrowLeft: (p) => <IconBase {...p}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></IconBase>,
  ArrowRight: (p) => <IconBase {...p}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></IconBase>,
  ChevronLeft: (p) => <IconBase {...p}><polyline points="15 18 9 12 15 6" /></IconBase>,
  ChevronRight: (p) => <IconBase {...p}><polyline points="9 18 15 12 9 6" /></IconBase>,
  ChevronDown: (p) => <IconBase {...p}><polyline points="6 9 12 15 18 9"/></IconBase>,
  Filter: (p) => <IconBase {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></IconBase>,
  Camera: (p) => <IconBase {...p}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></IconBase>,
  Truck: (p) => <IconBase {...p}><rect width="16" height="13" x="2" y="5" rx="2" /><path d="M2 9h13a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" /><path d="M5 9V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" /><circle cx="7" cy="15" r="2" /><circle cx="17" cy="15" r="2" /></IconBase>,
  Lock: (p) => <IconBase {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>,
  FileText: (p) => <IconBase {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></IconBase>,
  Instagram: (p) => <IconBase {...p}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></IconBase>,
  Video: (p) => <IconBase {...p}><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></IconBase>,
  MessageCircle: (p) => <IconBase {...p}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></IconBase>,
  Kick: (p) => (<svg viewBox="0 0 24 24" fill="currentColor" className={p.className} width="24" height="24"><path d="M12.9 16.7l-4.2-4.2 4.2-4.2h-3.8L5.9 11.6v-3.3H2.5v7.5h3.4v-3.3l3.2 3.3h3.8zM16.5 7.4h-3.4v9.3h3.4V7.4zM21.5 7.4h-3.4v9.3h3.4V7.4z"/></svg>),
  TikTok: (p) => (<svg viewBox="0 0 24 24" fill="currentColor" className={p.className} width="24" height="24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>),
  Loader: (p) => <IconBase {...p} className={`animate-spin ${p.className}`}><path d="M12 2v4"/><path d="m16.2 7.8 2.9-2.9"/><path d="M18 12h4"/><path d="m16.2 16.2 2.9 2.9"/><path d="M12 18v4"/><path d="m4.9 19.1 2.9-2.9"/><path d="M2 12h4"/><path d="m4.9 4.9 2.9 2.9"/></IconBase>,
  ArrowUp: (p) => <IconBase {...p}><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></IconBase>,
  Cookie: (p) => <IconBase {...p}><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/><path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 14v.01"/></IconBase>,
  ToggleLeft: (p) => <IconBase {...p}><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="8" cy="12" r="2"/></IconBase>,
  ToggleRight: (p) => <IconBase {...p}><rect width="20" height="12" x="2" y="6" rx="6" ry="6"/><circle cx="16" cy="12" r="2"/></IconBase>
};

// --- HOOKS ---
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
    setIsCartOpen(true); 
    showToast(`${product.name} dodany do koszyka!`);
  }, [showToast]);

  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(item => item.id !== id)), []);
  const updateQty = useCallback((id, delta) => {
    setCart(prev => prev.map(item => (item.id === id && item.qty + delta > 0) ? { ...item, qty: item.qty + delta } : item));
  }, []);

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.qty), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);
  const hasLiveAnimals = useMemo(() => cart.some(item => item.type === 'spider'), [cart]);

  return { cart, setCart, isCartOpen, setIsCartOpen, toast, showToast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, hasLiveAnimals };
};

// --- KOMPONENT: SCROLL TO TOP ---
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const toggle = () => setVisible(window.pageYOffset > 500);
    window.addEventListener('scroll', toggle);
    return () => window.removeEventListener('scroll', toggle);
  }, []);
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`fixed bottom-8 right-8 z-[90] p-3 bg-white border border-spider-sand rounded-full shadow-lg text-spider-dark hover:bg-spider-light transition-all transform ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
      <Icons.ArrowUp className="w-5 h-5" />
    </button>
  );
};

// --- KOMPONENT: COOKIE BANNER ---
const CookieBanner = ({ onAccept }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({ essential: true, analytics: false, marketing: false });

  const handleToggle = (key) => {
    if (key === 'essential') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAcceptAll = () => {
    onAccept({ essential: true, analytics: true, marketing: true });
  };

  const handleSaveSelected = () => {
    onAccept(preferences);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-spider-dark/95 backdrop-blur-md border-t border-spider-gold/20 p-6 z-[200] animate-slide-in-up shadow-[0_-4px_20px_rgba(0,0,0,0.3)] text-left">
      {!showDetails ? (
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="hidden md:block p-3 bg-spider-gold/10 rounded-full h-fit">
                <Icons.Cookie className="w-6 h-6 text-spider-gold"/>
            </div>
            <div>
                <h4 className="text-spider-gold font-bold text-sm uppercase tracking-widest mb-2">Dbamy o Twoją prywatność</h4>
                <p className="text-white/80 text-xs md:text-sm font-light leading-relaxed max-w-2xl">
                Strona korzysta z plików cookies. Masz prawo do wglądu w swoje dane oraz zarządzania nimi.
                </p>
            </div>
          </div>
          <div className="flex gap-4 flex-shrink-0 w-full md:w-auto">
            <button 
              onClick={() => setShowDetails(true)}
              className="w-full md:w-auto px-6 py-3 border border-spider-sand/20 text-white font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all rounded-sm"
            >
              Dostosuj
            </button>
            <button 
              onClick={handleAcceptAll}
              className="w-full md:w-auto px-8 py-3 bg-spider-gold text-spider-dark font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg rounded-sm"
            >
              Akceptuję wszystko
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <h4 className="text-spider-gold font-bold text-lg mb-6">Ustawienia prywatności</h4>
            <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/10">
                    <div>
                        <p className="text-white font-bold text-sm">Niezbędne</p>
                        <p className="text-white/50 text-xs">Wymagane do działania strony (koszyk, płatności). Zawsze włączone.</p>
                    </div>
                    <Icons.ToggleRight className="w-8 h-8 text-spider-gold opacity-50 cursor-not-allowed"/>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleToggle('analytics')}>
                    <div>
                        <p className="text-white font-bold text-sm">Analityczne</p>
                        <p className="text-white/50 text-xs">Pomagają nam ulepszać sklep analizując ruch na stronie.</p>
                    </div>
                    {preferences.analytics ? <Icons.ToggleRight className="w-8 h-8 text-spider-gold"/> : <Icons.ToggleLeft className="w-8 h-8 text-white/30"/>}
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-sm border border-white/10 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => handleToggle('marketing')}>
                    <div>
                        <p className="text-white font-bold text-sm">Marketingowe</p>
                        <p className="text-white/50 text-xs">Pozwalają dopasować reklamy do Twoich zainteresowań.</p>
                    </div>
                    {preferences.marketing ? <Icons.ToggleRight className="w-8 h-8 text-spider-gold"/> : <Icons.ToggleLeft className="w-8 h-8 text-white/30"/>}
                </div>
            </div>
            <div className="flex gap-4 justify-end">
                <button onClick={() => setShowDetails(false)} className="text-white/70 hover:text-white text-xs font-bold uppercase tracking-widest px-4">Wstecz</button>
                <button onClick={handleSaveSelected} className="px-8 py-3 bg-spider-gold text-spider-dark font-bold uppercase tracking-widest text-xs hover:bg-white transition-all shadow-lg rounded-sm">Zapisz wybrane</button>
            </div>
        </div>
      )}
    </div>
  );
};

// --- WIDOKI ---
const SuccessView = memo(({ lastOrder }) => {
  if (!lastOrder) return null;
  const total = lastOrder.reduce((sum, item) => sum + (item.price * item.qty), 0);
  return (
    <div className="bg-white rounded-sm border border-spider-sand p-8 md:p-16 animate-fade-in shadow-sm max-w-3xl mx-auto text-center">
      <div className="w-20 h-20 bg-spider-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-spider-primary">
        <Icons.Check className="w-10 h-10" />
      </div>
      <h2 className="font-serif text-3xl font-bold text-spider-dark mb-2">Zamówienie Przyjęte</h2>
      <p className="text-spider-dark/70 mb-8 font-light">Twoja przygoda właśnie się zaczyna.</p>
      <div className="bg-spider-base rounded-sm p-6 mb-8 text-left border border-spider-sand">
        <h3 className="font-bold text-spider-dark mb-4 border-b border-spider-sand pb-2 uppercase tracking-widest text-xs">Podsumowanie</h3>
        {lastOrder.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-sm overflow-hidden border border-spider-sand">
                <img src={item.image} alt={item.name} className="w-full h-full object-cover"/>
              </div>
              <div>
                <p className="font-bold text-spider-dark">{item.name}</p>
                <p className="text-spider-dark/50 text-xs">{item.qty} x {item.price.toFixed(2)} zł</p>
              </div>
            </div>
            <span className="font-bold text-spider-dark">{(item.price * item.qty).toFixed(2)} zł</span>
          </div>
        ))}
        <div className="mt-6 pt-4 border-t border-spider-sand flex justify-between items-center text-lg">
          <span className="font-bold text-spider-dark/60 text-sm">Razem:</span>
          <span className="font-serif font-bold text-spider-primary">{total.toFixed(2)} zł</span>
        </div>
      </div>
      <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-spider-dark text-white rounded-sm font-bold uppercase tracking-widest hover:bg-spider-primary transition-all">Wróć do sklepu</button>
    </div>
  );
});

const BestsellerSlider = memo(({ products, onProductClick, addToCart }) => {
  const scrollRef = useRef(null);
  const bestsellers = useMemo(() => {
    const tagged = products.filter(p => p.tags && p.tags.includes('bestseller'));
    return tagged.length > 0 ? tagged : products.slice(0, 5); 
  }, [products]);
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 320; 
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };
  if (bestsellers.length === 0) return null;
  return (
    <div className="relative group/slider my-16">
      <div className="flex items-center justify-between mb-8 px-2 text-left">
        <h3 className="font-serif text-3xl md:text-4xl text-spider-dark font-bold">Ulubieńcy Hodowców</h3>
        <div className="flex gap-2">
          <button onClick={() => scroll('left')} className="p-3 border border-spider-sand hover:bg-spider-dark hover:text-white transition-colors rounded-sm"><Icons.ChevronLeft className="w-5 h-5"/></button>
          <button onClick={() => scroll('right')} className="p-3 border border-spider-sand hover:bg-spider-dark hover:text-white transition-colors rounded-sm"><Icons.ChevronRight className="w-5 h-5"/></button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-8 overflow-x-auto pb-8 snap-x scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {bestsellers.map(product => (
          <div key={product.id} className="flex-shrink-0 w-80 bg-white rounded-sm border border-transparent hover:border-spider-sand snap-start shadow-sm hover:shadow-2xl transition-all duration-500 group/card cursor-pointer" onClick={() => onProductClick(product)}>
            <div className="h-72 overflow-hidden relative group/image bg-spider-light text-left">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async"/>
              <div className="absolute top-4 left-4 bg-spider-gold/90 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 uppercase tracking-widest shadow-lg">Top</div>
              <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="absolute bottom-0 right-0 m-4 bg-white text-spider-dark p-3.5 rounded-full shadow-lg translate-y-12 opacity-0 group-hover/image:translate-y-0 group-hover/image:opacity-100 transition-all duration-300 hover:bg-spider-primary hover:text-white">
                <Icons.Plus className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 text-left">
              <p className="text-spider-gold text-[10px] font-bold uppercase tracking-widest mb-2">{product.latin}</p>
              <h4 className="font-serif text-xl text-spider-dark mb-2 line-clamp-1 group-hover:text-spider-primary transition-colors font-bold">{product.name}</h4>
              <span className="text-lg font-light text-spider-dark">{product.price.toFixed(2)} zł</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const TravelGallery = memo(({ navigateTo }) => {
  const allPhotos = [
    { id: 1, src: "/zdjecia/cypr.jpg", location: "Cypr", width: "w-72" },
    { id: 2, src: "/zdjecia/madera.jpg", location: "Madera", width: "w-96" },
    { id: 3, src: "/zdjecia/hiszpania.JPG", location: "Hiszpania", width: "w-64" },
    { id: 4, src: "/zdjecia/maroko.jpg", location: "Maroko", width: "w-80" },
    { id: 5, src: "/zdjecia/rzym.jpg", location: "Włochy", width: "w-[400px]" },
    { id: 6, src: "/zdjecia/saloniki.jpg", location: "Grecja", width: "w-72" },
    { id: 7, src: "/zdjecia/malta.jpg", location: "Malta", width: "w-72" },
    { id: 8, src: "/zdjecia/ochryd.jpg", location: "Macedonia", width: "w-96" },
    { id: 9, src: "/zdjecia/szwecja.jpg", location: "Szwecja", width: "w-64" },
    { id: 10, src: "/zdjecia/watykan.jpg", location: "Watykan", width: "w-80" },
    { id: 11, src: "/zdjecia/nicea.jpg", location: "Francja", width: "w-[400px]" },
    { id: 12, src: "/zdjecia/monako.jpg", location: "Monako", width: "w-72" },
    { id: 13, src: "/zdjecia/zadar.jpg", location: "Chorwacja", width: "w-96" },
    { id: 14, src: "/zdjecia/austria.jpg", location: "Austria", width: "w-64" },
    { id: 15, src: "/zdjecia/jordania.jpg", location: "Jordania", width: "w-[400px]" },
  ];
  const half = Math.ceil(allPhotos.length / 2);
  const row1 = [...allPhotos.slice(0, half), ...allPhotos.slice(0, half), ...allPhotos.slice(0, half)];
  const row2 = [...allPhotos.slice(half), ...allPhotos.slice(half), ...allPhotos.slice(half)];

  return (
    <section className="py-24 bg-spider-light border-y border-spider-sand overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16 text-center">
         <span className="text-xs font-bold text-spider-gold uppercase tracking-[0.2em] mb-4 block">Ekspedycje</span>
         <h3 className="font-serif text-4xl md:text-6xl text-spider-dark mb-6">Dziennik Podróży</h3>
         <p className="text-spider-dark/60 font-light max-w-2xl mx-auto leading-relaxed">A oto kraje, które już odwiedziłem...</p>
      </div>
      <div className="space-y-10">
        <div className="relative w-full overflow-hidden">
           <div className="flex gap-8 w-max animate-scroll-left">
             {row1.map((item, i) => (
               <div key={`r1-${i}`} className={`relative h-80 rounded-sm overflow-hidden shrink-0 ${item.width}`}>
                 <img src={item.src} alt={item.location} className="w-full h-full object-cover" loading="lazy"/>
                 <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                   <span className="text-white font-serif italic text-xl tracking-wide">{item.location}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
        <div className="relative w-full overflow-hidden">
           <div className="flex gap-8 w-max animate-scroll-left-slow">
             {row2.map((item, i) => (
               <div key={`r2-${i}`} className={`relative h-80 rounded-sm overflow-hidden shrink-0 ${item.width}`}>
                 <img src={item.src} alt={item.location} className="w-full h-full object-cover" loading="lazy"/>
                 <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                   <span className="text-white font-serif italic text-xl tracking-wide">{item.location}</span>
                 </div>
               </div>
             ))}
           </div>
        </div>
      </div>
    </section>
  );
});

const HomeView = memo(({ navigateTo, products, onProductClick, addToCart }) => (
  <div className="animate-fade-in pb-12">
    <div className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-spider-dark mb-24 group">
      <img src={HERO_IMAGE_URL} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-[30s]" alt="Hero" loading="eager"/>
      <div className="relative z-10 text-center text-white px-4 max-w-5xl animate-fade-in">
        <span className="block text-xs font-bold uppercase tracking-[0.4em] mb-8 text-spider-gold opacity-90">Arkadiusz Kołacki Presents</span>
        <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl mb-10 leading-none tracking-tight">Z pasji do ptaszników<br/><span className="italic font-light opacity-90">Z miłości do podróżowania</span></h1>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
           <button onClick={() => navigateTo('shop')} className="px-12 py-5 bg-white text-spider-dark font-bold uppercase tracking-[0.2em] text-xs hover:bg-spider-gold hover:text-white transition-all shadow-2xl">Odkryj Sklep</button>
           <button onClick={() => navigateTo('stream')} className="px-12 py-5 border border-white text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-spider-dark transition-all backdrop-blur-sm">Transmisje</button>
        </div>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 text-left">
       <BestsellerSlider products={products} onProductClick={onProductClick} addToCart={addToCart} />
    </div>
    <TravelGallery navigateTo={navigateTo} />
  </div>
));

const ProductDetailsView = memo(({ product, onBack, onAddToCart, allProducts }) => {
  const isSoldOut = product.tags && product.tags.includes('sold_out');
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    if (product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product]);

  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const relatedProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(p => p.id !== product.id).sort(() => 0.5 - Math.random()).slice(0, 3);
  }, [product, allProducts]);

  return (
    <div className="animate-fade-in py-12 max-w-7xl mx-auto px-6">
      <button onClick={onBack} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-spider-dark/60 hover:text-spider-dark mb-12 group transition-colors">
        <Icons.ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Powrót do kolekcji
      </button>
      <div className="flex flex-col lg:flex-row gap-16 mb-24">
        <div className="w-full lg:w-1/2">
          <div className="aspect-[4/5] bg-white rounded-sm overflow-hidden border border-spider-sand relative group">
            <img src={product.image} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isSoldOut ? 'grayscale opacity-70' : ''}`} loading="eager" />
            {isSoldOut && <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm"><span className="border-2 border-spider-dark px-8 py-3 font-bold uppercase tracking-widest text-spider-dark text-lg">Wyprzedane</span></div>}
          </div>
        </div>
        <div className="w-full lg:w-1/2 flex flex-col justify-center">
          <p className="text-spider-gold font-bold uppercase tracking-[0.25em] text-xs mb-4">{product.latin}</p>
          <h2 className="font-serif text-5xl md:text-6xl text-spider-dark mb-8 leading-tight">{product.name}</h2>
          <p className="text-3xl font-light text-spider-dark mb-8">{currentPrice.toFixed(2)} zł</p>
          <div className="prose prose-stone text-spider-dark/70 font-light mb-12 leading-loose text-lg"><p>{product.desc}</p></div>
          
          {product.variants && product.variants.length > 0 && (
            <div className="mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-spider-dark mb-4 block">Wybierz wariant</span>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant) => (
                  <button key={variant.id} onClick={() => setSelectedVariant(variant)} className={`px-8 py-4 border text-sm transition-all ${selectedVariant && selectedVariant.id === variant.id ? 'border-spider-dark bg-spider-dark text-white shadow-lg' : 'border-spider-sand text-spider-dark hover:border-spider-dark'}`}>
                    {variant.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto border-t border-spider-sand pt-10">
            <button onClick={() => { if(!isSoldOut) { if(selectedVariant) onAddToCart({...product, ...selectedVariant, id: `${product.id}-${selectedVariant.id}`}); else onAddToCart(product); }}} disabled={isSoldOut} className={`w-full py-5 bg-spider-dark text-white font-bold uppercase tracking-[0.2em] text-sm hover:bg-spider-primary transition-all shadow-xl hover:shadow-2xl ${isSoldOut ? 'opacity-50 cursor-not-allowed hover:shadow-none' : ''}`}>
              {isSoldOut ? 'Produkt Niedostępny' : 'Dodaj do koszyka'}
            </button>
            <div className="flex gap-8 mt-8 text-xs text-spider-dark/50 uppercase tracking-widest justify-center">
                <span className="flex items-center gap-2"><Icons.Truck className="w-4 h-4"/> Wysyłka 24h</span>
                <span className="flex items-center gap-2"><Icons.Check className="w-4 h-4"/> Gwarancja LAG</span>
            </div>
          </div>
        </div>
      </div>
      {relatedProducts.length > 0 && (
        <div className="border-t border-spider-sand pt-20">
           <h3 className="font-serif text-3xl text-spider-dark mb-12 text-center">Mogą Cię zainteresować</h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {relatedProducts.map(rp => (
                <div key={rp.id} className="group cursor-pointer" onClick={() => onAddToCart(rp)}>
                   <div className="aspect-square bg-spider-light mb-6 overflow-hidden relative rounded-sm">
                      <img src={rp.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" decoding="async"/>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="bg-white text-spider-dark px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-xl">Szybki zakup</span>
                      </div>
                   </div>
                   <h4 className="font-serif text-xl text-spider-dark mb-1 group-hover:text-spider-primary transition-colors">{rp.name}</h4>
                   <p className="text-spider-dark/60 text-sm">{rp.price.toFixed(2)} zł</p>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
});

const ShopView = memo(({ addToCart, products, onProductClick }) => {
  const [category, setCategory] = useState('spider');
  const [selectedTags, setSelectedTags] = useState([]); 
  const [minPrice, setMinPrice] = useState(0); 
  const [maxPrice, setMaxPrice] = useState(1000); 
  const [sortOrder, setSortOrder] = useState('bestsellers');

  const filtered = useMemo(() => {
    let result = [...products];
    if (category !== 'all') result = result.filter(p => p.type === category);
    if (selectedTags.length > 0) {
       const catDef = PRODUCT_CATEGORIES.find(c => c.id === category);
       if (catDef?.filterGroups) {
         result = result.filter(p => catDef.filterGroups.every(g => {
            const activeInGroup = g.tags.map(t => t.id).filter(id => selectedTags.includes(id));
            if (activeInGroup.length === 0) return true;
            return p.tags && activeInGroup.some(tag => p.tags.includes(tag));
         }));
       }
    }
    result = result.filter(p => p.price >= minPrice && p.price <= maxPrice);
    switch (sortOrder) {
      case 'asc': result.sort((a,b) => a.price - b.price); break;
      case 'desc': result.sort((a,b) => b.price - a.price); break;
      case 'az': result.sort((a,b) => a.name.localeCompare(b.name)); break;
      case 'za': result.sort((a,b) => b.name.localeCompare(a.name)); break;
      case 'bestsellers':
        result.sort((a, b) => {
            const aBest = a.tags && a.tags.includes('bestseller') ? 1 : 0;
            const bBest = b.tags && b.tags.includes('bestseller') ? 1 : 0;
            return bBest - aBest;
        });
        break;
    }
    return result;
  }, [category, selectedTags, minPrice, maxPrice, sortOrder, products]);

  const currentFilters = PRODUCT_CATEGORIES.find(c => c.id === category)?.filterGroups || [];
  const toggleTag = (id) => setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  return (
    <div className="animate-fade-in py-12 flex flex-col lg:flex-row gap-12 lg:gap-24 max-w-7xl mx-auto px-6 text-left">
      <aside className="w-full lg:w-72 flex-shrink-0 space-y-12 mb-16 lg:mb-0 lg:pr-8">
        <div>
          <h4 className="font-serif text-2xl mb-8 text-spider-dark font-bold">Kategorie</h4>
          <div className="flex flex-col gap-3">
            {PRODUCT_CATEGORIES.map(cat => (
              <button key={cat.id} onClick={() => { setCategory(cat.id); setSelectedTags([]); }} className={`text-left py-3 px-6 text-sm uppercase tracking-widest transition-all border-l-2 ${category === cat.id ? 'border-spider-primary text-spider-dark font-bold bg-spider-light' : 'border-transparent text-spider-dark/60 hover:text-spider-dark hover:border-spider-sand'}`}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
        {currentFilters.map((group, idx) => (
          <div key={idx}>
            <h5 className="font-bold text-xs uppercase tracking-widest text-spider-gold mb-6">{group.label}</h5>
            <div className="flex flex-wrap gap-3">
              {group.tags.map(tag => (
                <button key={tag.id} onClick={() => toggleTag(tag.id)} className={`px-4 py-2 text-xs border transition-all ${selectedTags.includes(tag.id) ? 'bg-spider-primary text-white border-spider-primary shadow-md' : 'bg-transparent text-spider-dark/70 border-spider-sand hover:border-spider-dark'}`}>
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <div>
           <h5 className="font-bold text-xs uppercase tracking-widest text-spider-gold mb-6">Cena</h5>
           <div className="flex items-center gap-4 text-sm text-spider-dark">
              <input type="number" value={minPrice} onChange={e => setMinPrice(Number(e.target.value))} className="w-24 p-3 border border-spider-sand bg-transparent text-center focus:border-spider-dark focus:outline-none transition-colors"/>
              <span className="text-spider-sand">—</span>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))} className="w-24 p-3 border border-spider-sand bg-transparent text-center focus:border-spider-dark focus:outline-none transition-colors"/>
           </div>
        </div>
      </aside>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 border-b border-spider-sand pb-6 gap-4">
           <span className="text-sm text-spider-dark/60 tracking-wide">{filtered.length} produktów</span>
           <div className="relative group">
             <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="appearance-none bg-transparent text-sm font-bold uppercase tracking-widest text-spider-dark focus:outline-none cursor-pointer pr-8 py-2">
                <option value="bestsellers">Bestsellery</option>
                <option value="az">Nazwa A-Z</option>
                <option value="za">Nazwa Z-A</option>
                <option value="asc">Cena rosnąco</option>
                <option value="desc">Cena malejąco</option>
             </select>
             <Icons.ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-spider-dark/50"/>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
          {filtered.map(p => (
            <div key={p.id} className="group cursor-pointer bg-white transition-all duration-500 pb-4 hover:-translate-y-2" onClick={() => onProductClick(p)}>
               <div className="aspect-[4/5] bg-spider-light overflow-hidden relative mb-6 shadow-sm group-hover:shadow-xl transition-shadow rounded-sm">
                  <img src={p.image} alt={p.name} className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${p.tags.includes('sold_out') ? 'grayscale opacity-70' : ''}`} loading="lazy" decoding="async"/>
                  {!p.tags.includes('sold_out') && (
                    <button onClick={(e) => { e.stopPropagation(); addToCart(p); }} className="absolute bottom-0 right-0 m-4 bg-white text-spider-dark p-3.5 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-spider-primary hover:text-white">
                      <Icons.Plus className="w-5 h-5"/>
                    </button>
                  )}
               </div>
               <div className="px-2 text-center text-left">
                  <p className="text-[10px] text-spider-gold font-bold uppercase tracking-[0.15em] mb-2">{p.latin}</p>
                  <h3 className="font-serif text-lg text-spider-dark mb-3 group-hover:text-spider-primary transition-colors leading-tight font-bold">{p.name}</h3>
                  <p className="text-spider-dark font-light">{p.price.toFixed(2)} zł</p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

const AboutView = memo(() => (
  <div className="animate-fade-in max-w-7xl mx-auto py-16 px-6 text-left">
    <div className="flex flex-col md:flex-row gap-20 items-center mb-32">
       <div className="w-full md:w-1/2 relative group">
          <div className="absolute -top-6 -left-6 w-full h-full border-2 border-spider-gold z-0 transition-transform group-hover:translate-x-2 group-hover:translate-y-2"></div>
          <img src="/zdjecia/arek.png" alt="Arek" className="relative z-10 w-full transition-all duration-700 shadow-2xl" loading="lazy" decoding="async"/>
       </div>
       <div className="w-full md:w-1/2">
          <span className="text-spider-gold font-bold uppercase tracking-[0.25em] text-xs mb-6 block">Historia Marki</span>
          <h2 className="font-serif text-5xl md:text-6xl text-spider-dark mb-10 leading-tight font-bold">Cześć,<br/>jestem Arek.</h2>
          <div className="prose prose-lg prose-stone text-spider-dark/70 font-light leading-relaxed">
             <p className="mb-6">Moja przygoda z terrarystyką zaczęła się w 2020 roku od małej Chromki. To właśnie od niej wszystko się zaczęło. Z czasem narodziła się myśl: <span className="text-spider-dark font-normal italic">„Ciekawe, jak one żyją w naturze?”.</span></p>
             <p>Spiderra to połączenie moich hobby a jednocześnie iskra do tego, aby dzielić się z Wami energią, którą przywożę z każdej wyprawy. Każdy ptasznik w mojej ofercie to kawałek tej pasji.</p>
          </div>
       </div>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
       {[
         { icon: Icons.Bug, title: "Unikalne Gatunki", text: "Selekcja, która zachwyca." },
         { icon: Icons.Video, title: "Edukacja Live", text: "Transmisje prosto z natury." },
         { icon: Icons.MessageCircle, title: "Pełne Wsparcie", text: "Pomoc na każdym etapie." }
       ].map((item, idx) => (
         <div key={idx} className="p-10 border border-spider-sand bg-white hover:border-spider-primary transition-all duration-300 group hover:-translate-y-2 hover:shadow-xl">
            <div className="w-16 h-16 bg-spider-light rounded-full flex items-center justify-center mx-auto mb-8 text-spider-dark group-hover:bg-spider-primary group-hover:text-white transition-colors">
               <item.icon className="w-8 h-8"/>
            </div>
            <h3 className="font-serif text-2xl mb-4 text-spider-dark font-bold">{item.title}</h3>
            <p className="text-sm text-spider-dark/60 font-light uppercase tracking-wide">{item.text}</p>
         </div>
       ))}
    </div>
  </div>
));

const StreamView = memo(() => (
  <div className="animate-fade-in py-16 px-6 max-w-6xl mx-auto">
     <div className="bg-spider-dark rounded-sm overflow-hidden text-white shadow-2xl border border-white/5">
        <div className="p-12 border-b border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-6">
              <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_red]"></span>
              <div className="text-left">
                  <h2 className="font-serif text-3xl font-bold">Studio Live</h2>
                  <p className="text-white/40 text-xs uppercase tracking-widest mt-1">Eksploracja na żywo</p>
              </div>
           </div>
           <a href={COMPANY_DATA.socials.kick} target="_blank" className="px-8 py-3 bg-white/10 hover:bg-spider-gold text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-3 rounded-full">
               <Icons.Kick className="w-4 h-4"/> Przejdź na Kick.com
           </a>
        </div>
        <div className="aspect-video bg-black relative flex items-center justify-center group overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1548858881-80590a5525bc?auto=format&fit=crop&w=1200&q=40')] bg-cover opacity-30 group-hover:scale-105 transition-transform duration-[10s]"></div>
           <div className="relative z-10 text-center">
              <Icons.Video className="w-24 h-24 text-spider-gold mb-8 mx-auto opacity-80"/>
              <p className="text-white/50 tracking-[0.4em] text-sm uppercase font-bold">Kamera Offline</p>
           </div>
        </div>
        <div className="p-10 bg-[#151413] flex justify-between items-center">
           <div className="flex items-center gap-6">
              <img src={LOGO_URL2} alt="Logo" className="w-16"/>
              <div className="border-l border-white/10 pl-6 text-left">
                 <p className="text-spider-gold uppercase tracking-widest text-[10px] font-bold mb-1">Następna wyprawa</p>
                 <p className="text-white font-serif text-2xl">Gruzja 04.2026</p>
              </div>
           </div>
        </div>
     </div>
  </div>
));

const ContactView = memo(() => (
    <div className="animate-fade-in py-20 px-6 max-w-4xl mx-auto text-center">
        <span className="text-spider-gold font-bold uppercase tracking-[0.25em] text-xs mb-6 block">Bądźmy w kontakcie</span>
        <h2 className="font-serif text-5xl md:text-6xl text-spider-dark mb-12 font-bold">Masz pytania?</h2>
        
        {/* Existing Contact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="p-10 bg-white border border-spider-sand">
                <h3 className="font-serif text-2xl text-spider-dark mb-4">Email</h3>
                <p className="text-spider-dark/60 font-light mb-6">Odpowiadam zazwyczaj w ciągu 24h.</p>
                <a href={`mailto:${COMPANY_DATA.email}`} className="text-spider-primary font-bold hover:text-spider-gold transition-colors text-lg border-b border-spider-primary/20 pb-1">{COMPANY_DATA.email}</a>
            </div>
            <div className="p-10 bg-white border border-spider-sand">
                <h3 className="font-serif text-2xl text-spider-dark mb-4">Telefon</h3>
                <p className="text-spider-dark/60 font-light mb-6">Masz pytania? Zadzwoń.</p>
                <a href={`tel:${COMPANY_DATA.phone}`} className="text-spider-primary font-bold hover:text-spider-gold transition-colors text-lg border-b border-spider-primary/20 pb-1">{COMPANY_DATA.phone}</a>
            </div>
        </div>

        {/* New Working Hours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
             <div className="p-10 bg-spider-base border border-spider-sand">
                <h3 className="font-serif text-2xl text-spider-dark mb-4">Dni Robocze</h3>
                <p className="text-spider-dark/60 font-light mb-2">Poniedziałek - Piątek</p>
                <p className="text-xl font-bold text-spider-primary">10:00 - 18:00</p>
            </div>
            <div className="p-10 bg-spider-base border border-spider-sand">
                <h3 className="font-serif text-2xl text-spider-dark mb-4">Weekend</h3>
                <p className="text-spider-dark/60 font-light mb-2">Sobota - Niedziela</p>
                <p className="text-xl font-bold text-spider-primary">Nieczynne</p>
            </div>
        </div>

        <div className="p-10 bg-spider-light border border-spider-sand text-left">
            <h4 className="font-bold text-xs uppercase tracking-widest text-spider-dark mb-4">Dane firmy</h4>
            <p className="font-serif text-xl text-spider-dark mb-1">{COMPANY_DATA.name}</p>
            <p className="text-spider-dark/60 font-light mb-1">ul. {COMPANY_DATA.address}</p>
            <p className="text-spider-dark/60 font-light mb-4">{COMPANY_DATA.zip} {COMPANY_DATA.city}</p>
            <p className="text-xs text-spider-dark/40 uppercase tracking-widest">NIP: {COMPANY_DATA.nip}</p>
        </div>
    </div>
));

const LegalView = ({ title, children }) => (
  <div className="animate-fade-in max-w-3xl mx-auto py-20 px-6 text-left">
     <div className="flex items-center gap-6 mb-12 pb-8 border-b border-spider-sand">
        <div className="p-5 bg-spider-base border border-spider-sand text-spider-primary rounded-full shadow-sm"><Icons.FileText className="w-8 h-8"/></div>
        <h2 className="font-serif text-4xl md:text-5xl text-spider-dark font-bold">{title}</h2>
     </div>
     <div className="prose prose-lg prose-stone max-w-none text-spider-dark/70 font-light leading-loose text-justify">
        {children}
     </div>
  </div>
);

const TermsView = () => (
    <>
        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">§1 Postanowienia Ogólne</h3>
        <p className="mb-4">1. Sklep internetowy Spiderra, dostępny pod adresem internetowym, prowadzony jest przez Arkadiusza Kołackiego, wykonującego działalność nierejestrowaną, z siedzibą przy ul. Rakowickiej 22D/27, 31-510 Kraków.</p>
        <p className="mb-4">2. Kontakt ze Sprzedawcą możliwy jest za pośrednictwem adresu e-mail: spiderra.kontakt@outlook.com.</p>
        <p className="mb-4">3. Niniejszy Regulamin określa zasady korzystania ze sklepu internetowego, w szczególności zasady składania zamówień i zawierania umów sprzedaży przy wykorzystaniu środków porozumiewania się na odległość.</p>

        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">§2 Produkty i Zasady Sprzedaży</h3>
        <p className="mb-4">1. Wszystkie ceny podane na stronie sklepu są cenami brutto (zawierają wszystkie składniki, w tym cła i podatki).</p>
        <p className="mb-4">2. Sprzedawca oświadcza, że oferowane w sklepie żywe zwierzęta (ptaszniki) pochodzą z legalnej hodowli i są dopuszczone do obrotu na terenie Polski. W przypadku gatunków objętych ochroną CITES, do zakupu dołączany jest stosowny dokument potwierdzający urodzenie w niewoli.</p>
        <p className="mb-4">3. Oferta sklepu obejmuje również akcesoria terrarystyczne, w tym pojemniki hodowlane, podłoża i narzędzia.</p>
        <p className="mb-4">4. Hodowla jest pod nadzorem Powiatowego Lekarza Weterynarii w Krakowie. Weterynaryjny Numer Identyfikacyjny (WNI): [126161XX].</p>


        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">§3 Płatności i Dostawa</h3>
        <p className="mb-4">1. Klient ma możliwość zapłaty za zamówienie poprzez szybkie płatności online obsługiwane przez zewnętrznego operatora płatności.</p>
        <p className="mb-4">2. Czas realizacji zamówienia wynosi zazwyczaj do 3 dni roboczych od momentu zaksięgowania wpłaty.</p>
        <p className="mb-4">3. <strong>Wysyłka żywych zwierząt odbywa się wyłącznie od poniedziałku do środy</strong>, aby uniknąć ryzyka przetrzymywania przesyłki w magazynach przewoźnika przez weekend.</p>
        <p className="mb-4">4. Sprzedawca zastrzega sobie prawo do wstrzymania wysyłki żywych zwierząt w przypadku niekorzystnych warunków atmosferycznych (zbyt niskie lub zbyt wysokie temperatury), o czym poinformuje Klienta.</p>

        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">§4 Odstąpienie od Umowy i Zwroty</h3>
        <p className="mb-4">1. Klientowi będącemu konsumentem przysługuje prawo do odstąpienia od umowy sprzedaży w terminie 14 dni bez podania przyczyny, z zastrzeżeniem ust. 2.</p>
        <p className="mb-4">2. <strong>Wyłączenie prawa do odstąpienia od umowy:</strong> Zgodnie z art. 38 pkt 4 ustawy o prawach konsumenta, prawo odstąpienia od umowy zawartej na odległość <strong>nie przysługuje</strong> konsumentowi w odniesieniu do umów, w której przedmiotem świadczenia jest rzecz ulegająca szybkiemu zepsuciu lub mająca krótki termin przydatności do użycia. Przepis ten ma zastosowanie do sprzedaży żywych zwierząt.</p>
        <p className="mb-4">3. Zwrotom podlegają towary takie jak akcesoria i pojemniki hodowlane, pod warunkiem, że nie noszą śladów użytkowania.</p>

        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">§5 Reklamacje (Live Arrival Guarantee)</h3>
        <p className="mb-4">1. Sprzedawca udziela gwarancji "Live Arrival Guarantee" (LAG) na żywe zwierzęta.</p>
        <p className="mb-4">2. Szczegółowe warunki gwarancji LAG opisane są w zakładce "Wysyłka i Zwroty".</p>
    </>
);

const PrivacyView = () => (
    <>
        <p className="mb-4">Szanujemy Twoją prywatność i dbamy o ochronę Twoich danych osobowych. Poniżej znajdziesz szczegółowe informacje dotyczące przetwarzania danych w naszym sklepie.</p>
        
        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">1. Administrator Danych</h3>
        <p className="mb-4">Administratorem Twoich danych osobowych jest Arkadiusz Kołacki, prowadzący działalność pod marką Spiderra, z siedzibą w Krakowie przy ul. Rakowickiej 22D/27. Możesz skontaktować się z nami pod adresem: spiderra.kontakt@outlook.com.</p>
        
        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">2. Cel i Podstawa Przetwarzania</h3>
        <p className="mb-4">Twoje dane osobowe (imię, nazwisko, adres, e-mail, numer telefonu) przetwarzane są wyłącznie w celach niezbędnych do:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Realizacji umowy sprzedaży i wysyłki zamówienia (art. 6 ust. 1 lit. b RODO).</li>
            <li>Obsługi procesu reklamacji lub zwrotu.</li>
            <li>Kontaktu w sprawach związanych z realizacją zamówienia.</li>
            <li>Wypełnienia obowiązków prawnych ciążących na Administratorze (np. księgowość).</li>
        </ul>

        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">3. Odbiorcy Danych</h3>
        <p className="mb-4">Twoje dane mogą być przekazywane wyłącznie podmiotom współpracującym, niezbędnym do realizacji zamówienia, takim jak:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Operatorzy płatności elektronicznych.</li>
            <li>Firmy kurierskie i przewozowe (w celu dostarczenia przesyłki).</li>
            <li>Biuro rachunkowe.</li>
        </ul>

        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">4. Twoje Prawa</h3>
        <p className="mb-4">Posiadasz prawo dostępu do treści swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, prawo do przenoszenia danych oraz prawo wniesienia sprzeciwu.</p>

        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">5. Pliki Cookies</h3>
        <p className="mb-4">Nasz sklep wykorzystuje pliki cookies (ciasteczka) w celu zapewnienia prawidłowego działania serwisu (np. utrzymanie sesji koszyka) oraz w celach analitycznych, aby ulepszać funkcjonowanie sklepu. Możesz zarządzać ustawieniami cookies w swojej przeglądarce lub poprzez nasz panel ustawień cookies.</p>
    </>
);

const ShippingReturnsView = () => (
    <>
        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">Bezpieczna Wysyłka Zwierząt</h3>
        <p className="mb-4">Zdrowie i bezpieczeństwo zwierząt jest dla nas priorytetem. Ptaszniki pakowane są z zachowaniem najwyższych standardów, w sposób uniemożliwiający im przemieszczanie się wewnątrz paczki oraz chroniący przed czynnikami zewnętrznymi.</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
            <li><strong>Styrobox:</strong> Każda przesyłka z żywymi zwierzętami jest zabezpieczona termicznym opakowaniem styropianowym.</li>
            <li><strong>Heatpack:</strong> W okresie jesienno-zimowym (gdy temperatury spadają), do paczki dodajemy chemiczny ogrzewacz (heatpack), który utrzymuje odpowiednią temperaturę przez 40-72 godziny.</li>
        </ul>
        <p className="mb-4 text-spider-dark font-bold">Wysyłka żywych zwierząt realizowana jest wyłącznie od poniedziałku do środy, aby zagwarantować dostawę przed weekendem.</p>

        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">Gwarancja LAG (Live Arrival Guarantee)</h3>
        <p className="mb-4">Udzielam pełnej gwarancji na żywe dostarczenie zwierzęcia. W rzadkim przypadku, gdy pająk dotrze martwy, zwracam pieniądze lub wysyłam nowy egzemplarz na mój koszt.</p>
        <p className="mb-2 font-bold">Warunki uznania gwarancji:</p>
        <ul className="list-disc pl-5 mb-4 space-y-2">
            <li>Odbiór przesyłki w dniu pierwszej próby doręczenia.</li>
            <li>Przesłanie wyraźnego, nieprzerwanego filmu z momentu otwierania paczki (tzw. unboxing video), na którym widać martwe zwierzę.</li>
            <li>Zgłoszenie problemu w ciągu 2 godzin od odebrania paczki.</li>
        </ul>

        <h3 className="font-serif text-2xl text-spider-dark mt-8 mb-4">Zwroty i Reklamacje</h3>
        <p className="mb-4"><strong>Żywe zwierzęta:</strong> Ze względu na specyfikę towaru, nie przyjmujemy zwrotów żywych zwierząt bez podania przyczyny (odstąpienie od umowy bez podania przyczyny nie przysługuje).</p>
        <p className="mb-4"><strong>Akcesoria i Pojemniki:</strong> W przypadku zakupu akcesoriów (pojemniki, podłoże, narzędzia), masz prawo do zwrotu towaru w terminie 14 dni od otrzymania przesyłki, pod warunkiem, że towar nie był używany i jest w oryginalnym opakowaniu. Koszt wysyłki zwrotnej pokrywa Kupujący.</p>
    </>
);

// --- APP CONTENT ---
const AppContent = () => {
  const [activeView, setActiveView] = useState('home');
  const [products, setProducts] = useState(MOCK_PRODUCTS_DATA);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showCookies, setShowCookies] = useState(false); // Cookie state

  const { cart, isCartOpen, setIsCartOpen, addToCart, removeFromCart, updateQty, cartTotal, hasLiveAnimals, toast, showToast, setCart } = useCart();

  const navigate = (view) => { setActiveView(view); setSelectedProduct(null); setIsMobileMenuOpen(false); window.scrollTo({top:0, behavior:'smooth'}); };
  const openProduct = (p) => { setSelectedProduct(p); setActiveView('shop'); window.scrollTo({top:0, behavior:'smooth'}); };

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
      const fetchProducts = async () => {
          if (API_URL === 'SIMULATION') return;
          try {
             const res = await fetch(`${API_URL}/getproduct`);
             if (res.ok) {
                 const data = await res.json();
                 const normalized = data.map(p => ({
                     ...p,
                     tags: Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',') : []),
                     price: Number(p.price)
                 }));
                 if (normalized.length > 0) setProducts(normalized);
             }
          } catch(e) { console.log("Fetch products failed:", e); }
      };
      fetchProducts();
  }, []);

  // Cookie Logic
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowCookies(true);
    }
  }, []);

  const handleAcceptCookies = (preferences) => {
    localStorage.setItem('cookieConsent', JSON.stringify(preferences));
    setShowCookies(false);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    localStorage.setItem('pendingCart', JSON.stringify(cart));
    setCheckoutLoading(true);

    if (API_URL === 'SIMULATION') {
        setTimeout(() => {
            setCheckoutLoading(false);
            setLastOrder(cart);
            setCart([]);
            setActiveView('success');
            showToast("Płatność testowa zakończona sukcesem (Symulacja)");
        }, 1500);
        return;
    }

    try {
      const res = await fetch(`${API_URL}/createsession`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      if (!res.ok) {
         const errData = await res.json().catch(() => ({}));
         throw new Error(errData.error || `Błąd: ${res.status}`);
      }
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (e) {
      showToast(e.message || "Błąd płatności.", 'error');
    } finally {
      if (API_URL !== 'SIMULATION') setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-spider-base text-spider-dark font-sans selection:bg-spider-gold selection:text-white flex flex-col overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 bg-spider-base/95 backdrop-blur-md border-b border-spider-sand h-24 transition-all">
         <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center text-center">
            <div className="cursor-pointer flex items-center gap-2 group h-20" onClick={() => navigate('home')}>
               <img src={LOGO_URL} alt="Spiderra" className="h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="hidden md:flex gap-10 text-xs font-bold uppercase tracking-[0.15em] text-spider-dark/60">
               <button onClick={() => navigate('home')} className={`hover:text-spider-dark transition-colors ${activeView === 'home' ? 'text-spider-dark border-b-2 border-spider-gold pb-1' : ''}`}>Start</button>
               <button onClick={() => navigate('shop')} className={`hover:text-spider-dark transition-colors ${activeView === 'shop' ? 'text-spider-dark border-b-2 border-spider-gold pb-1' : ''}`}>Sklep</button>
               <button onClick={() => navigate('stream')} className={`hover:text-spider-dark transition-colors ${activeView === 'stream' ? 'text-spider-dark border-b-2 border-spider-gold pb-1' : ''}`}>Live</button>
               <button onClick={() => navigate('about')} className={`hover:text-spider-dark transition-colors ${activeView === 'about' ? 'text-spider-dark border-b-2 border-spider-gold pb-1' : ''}`}>O mnie</button>
               <button onClick={() => navigate('contact')} className={`hover:text-spider-dark transition-colors ${activeView === 'contact' ? 'text-spider-dark border-b-2 border-spider-gold pb-1' : ''}`}>Kontakt</button>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={() => setIsCartOpen(true)} className="relative p-3 hover:bg-spider-light rounded-full transition-colors group">
                   <Icons.ShoppingCart className="w-6 h-6 text-spider-dark group-hover:scale-110 transition-transform"/>
                   {cart.length > 0 && <span className="absolute top-0 right-0 bg-spider-gold text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold shadow-sm">{cart.reduce((a,b)=>a+b.qty,0)}</span>}
                </button>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden p-3 hover:bg-spider-light rounded-full transition-colors">
                    {isMobileMenuOpen ? <Icons.X className="w-6 h-6"/> : <Icons.Menu className="w-6 h-6"/>}
                </button>
            </div>
         </div>
      </nav>

      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-spider-base pt-28 px-8 animate-fade-in md:hidden">
              <div className="flex flex-col gap-8 text-2xl font-serif text-spider-dark font-bold text-left">
                  <button onClick={() => navigate('home')} className="text-left py-4 border-b border-spider-sand">Start</button>
                  <button onClick={() => navigate('shop')} className="text-left py-4 border-b border-spider-sand">Sklep</button>
                  <button onClick={() => navigate('stream')} className="text-left py-4 border-b border-spider-sand">Transmisje</button>
                  <button onClick={() => navigate('about')} className="text-left py-4 border-b border-spider-sand">O mnie</button>
                  <button onClick={() => navigate('contact')} className="text-left py-4 border-b border-spider-sand">Kontakt</button>
              </div>
          </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end font-sans">
           <div className="absolute inset-0 bg-spider-dark/60 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)}/>
           <div className="relative w-full max-w-md bg-spider-base h-full shadow-2xl flex flex-col animate-slide-in-right">
              <div className="p-8 border-b border-spider-sand flex justify-between items-center bg-white/50">
                 <h2 className="font-serif text-3xl text-spider-dark font-bold">Twój Koszyk</h2>
                 <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform p-2"><Icons.X/></button>
              </div>
              <div className="px-8 py-6 bg-spider-light border-b border-spider-sand text-left">
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-3 text-spider-dark/70">
                    <span>Darmowa dostawa od 250 zł</span>
                    <span>{cartTotal >= 250 ? 'Osiągnięta!' : `Brakuje ${(250 - cartTotal).toFixed(2)} zł`}</span>
                 </div>
                 <div className="h-1.5 bg-spider-sand w-full overflow-hidden rounded-full"><div className={`h-full transition-all duration-1000 ease-out ${cartTotal >= 250 ? 'bg-green-600' : 'bg-spider-primary'}`} style={{width: `${Math.min(100, (cartTotal/250)*100)}%`}}></div></div>
              </div>
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                 {cart.length === 0 ? <p className="text-center opacity-40 mt-20 font-bold uppercase tracking-widest text-sm">Pusto tutaj...</p> : cart.map(item => (
                    <div key={item.id} className="flex gap-6 group animate-fade-in">
                       <div className="w-24 h-32 bg-white border border-spider-sand flex-shrink-0 relative overflow-hidden"><img src={item.image} className="w-full h-full object-cover"/></div>
                       <div className="flex-1 flex flex-col justify-between py-1 text-left">
                          <div><h4 className="font-serif text-lg text-spider-dark leading-none mb-2 font-bold">{item.name}</h4><p className="text-[10px] text-spider-gold uppercase font-bold tracking-widest">{item.latin}</p></div>
                          <div className="flex justify-between items-center mt-4">
                             <div className="flex border border-spider-sand bg-white rounded-sm"><button onClick={() => updateQty(item.id, -1)} className="px-3 py-1 hover:bg-spider-light transition-colors">-</button><span className="px-3 py-1 text-xs font-bold leading-relaxed">{item.qty}</span><button onClick={() => updateQty(item.id, 1)} className="px-3 py-1 hover:bg-spider-light">+</button></div>
                             <span className="font-bold text-sm">{item.price.toFixed(2)} zł</span>
                          </div>
                       </div>
                       <button onClick={() => removeFromCart(item.id)} className="text-spider-sand hover:text-red-500 self-start p-1 transition-colors"><Icons.Trash2 className="w-5 h-5"/></button>
                    </div>
                 ))}
              </div>
              <div className="p-8 border-t border-spider-sand bg-white">
                 {hasLiveAnimals && <div className="text-xs text-amber-700 mb-6 flex items-center gap-3 bg-amber-50 p-4 border border-amber-100 rounded-sm text-left"><Icons.Bug className="w-5 h-5 flex-shrink-0"/> <span className="leading-snug">Koszyk zawiera żywe zwierzęta. <br/>Bezpieczna wysyłka tylko pon-śr.</span></div>}
                 <div className="flex justify-between items-end mb-6 text-left">
                     <span className="text-xs uppercase font-bold tracking-widest text-spider-dark/50">Suma zamówienia</span>
                     <span className="font-serif text-4xl text-spider-dark font-bold">{cartTotal.toFixed(2)} <span className="text-lg font-sans text-spider-dark/40 font-light">PLN</span></span>
                 </div>
                 <button onClick={handleCheckout} className="w-full py-5 bg-spider-dark text-white font-bold uppercase tracking-[0.2em] text-xs hover:bg-spider-gold transition-all shadow-xl flex justify-center items-center gap-3" disabled={cart.length === 0 || checkoutLoading}>
                    {checkoutLoading ? <Icons.Loader className="w-5 h-5 text-white" /> : "PRZEJDŹ DO PŁATNOŚCI"}
                 </button>
              </div>
           </div>
        </div>
      )}

      <main className="pt-24 flex-grow">
         {activeView === 'home' && <HomeView navigateTo={navigate} products={products} onProductClick={openProduct} addToCart={addToCart}/>}
         {activeView === 'shop' && (selectedProduct ? <ProductDetailsView product={selectedProduct} onBack={() => setSelectedProduct(null)} onAddToCart={addToCart} allProducts={products}/> : <ShopView addToCart={addToCart} products={products} onProductClick={openProduct}/>)}
         {activeView === 'about' && <AboutView/>}
         {activeView === 'stream' && <StreamView/>}
         {activeView === 'contact' && (
           <div className="animate-fade-in py-20 px-6 max-w-4xl mx-auto text-center">
             <span className="text-spider-gold font-bold uppercase tracking-[0.25em] text-xs mb-6 block">Bądźmy w kontakcie</span>
             <h2 className="font-serif text-5xl md:text-6xl text-spider-dark mb-12 font-bold">Masz pytania?</h2>
             {/* Existing Contact Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="p-10 bg-white border border-spider-sand">
                     <h3 className="font-serif text-2xl text-spider-dark mb-4">Email</h3>
                     <p className="text-spider-dark/60 font-light mb-6">Odpowiadam zazwyczaj w ciągu 24h.</p>
                     <a href={`mailto:${COMPANY_DATA.email}`} className="text-spider-primary font-bold hover:text-spider-gold transition-colors text-lg border-b border-spider-primary/20 pb-1">{COMPANY_DATA.email}</a>
                 </div>
                 <div className="p-10 bg-white border border-spider-sand">
                     <h3 className="font-serif text-2xl text-spider-dark mb-4">Telefon</h3>
                     <p className="text-spider-dark/60 font-light mb-6">Masz pytania? Zadzwoń.</p>
                     <a href={`tel:${COMPANY_DATA.phone}`} className="text-spider-primary font-bold hover:text-spider-gold transition-colors text-lg border-b border-spider-primary/20 pb-1">{COMPANY_DATA.phone}</a>
                 </div>
             </div>
     
             {/* New Working Hours Grid */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                  <div className="p-10 bg-spider-base border border-spider-sand">
                     <h3 className="font-serif text-2xl text-spider-dark mb-4">Dni Robocze</h3>
                     <p className="text-spider-dark/60 font-light mb-2">Poniedziałek - Piątek</p>
                     <p className="text-xl font-bold text-spider-primary">10:00 - 18:00</p>
                 </div>
                 <div className="p-10 bg-spider-base border border-spider-sand">
                     <h3 className="font-serif text-2xl text-spider-dark mb-4">Weekend</h3>
                     <p className="text-spider-dark/60 font-light mb-2">Sobota - Niedziela</p>
                     <p className="text-xl font-bold text-spider-primary">Nieczynne</p>
                 </div>
             </div>
             <div className="p-10 bg-spider-light border border-spider-sand text-left">
                <p className="font-serif text-xl text-spider-dark mb-1 font-bold">{COMPANY_DATA.name}</p>
                <p className="text-spider-dark/60 font-light mb-1">ul. {COMPANY_DATA.address}</p>
                <p className="text-spider-dark/60 font-light mb-4">{COMPANY_DATA.zip} {COMPANY_DATA.city}</p>
                <p className="text-sm font-bold mb-1">{COMPANY_DATA.email}</p>
                <p className="text-sm font-bold mb-4">{COMPANY_DATA.phone}</p>
                <p className="text-xs text-spider-dark/40 uppercase tracking-widest">NIP: {COMPANY_DATA.nip}</p>
             </div>
           </div>
         )}
         {activeView === 'success' && <SuccessView lastOrder={lastOrder}/>}
         {activeView === 'terms' && <LegalView title="Regulamin Sklepu"><TermsView/></LegalView>}
         {activeView === 'privacy' && <LegalView title="Polityka Prywatności"><PrivacyView/></LegalView>}
         {activeView === 'shipping' && <LegalView title="Wysyłka i Zwroty"><ShippingReturnsView/></LegalView>}
      </main>

      <footer className="bg-spider-dark text-white py-20 border-t border-white/10">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-16 text-left">
            <div className="col-span-1 pr-4">
               <div className="flex items-center gap-4 mb-8 opacity-90 h-16 w-auto">
                  <img src={LOGO_URL2} className="h-full w-auto object-contain"/>
               </div>
            </div>
            <div>
               <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-spider-gold mb-8">Eksploruj</h4>
               <ul className="space-y-4 text-sm text-white/70 font-light">
                  <li><button onClick={() => navigate('shop')} className="hover:text-white transition-all">Ptaszniki</button></li>
                  <li><button onClick={() => navigate('shop')} className="hover:text-white transition-all">Akcesoria</button></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-spider-gold mb-8 font-bold">Informacje</h4>
               <ul className="space-y-4 text-sm text-white/70 font-light">
                  <li><button onClick={() => navigate('terms')} className="hover:text-white transition-all">Regulamin</button></li>
                  <li><button onClick={() => navigate('shipping')} className="hover:text-white transition-all">Wysyłka</button></li>
                  <li><button onClick={() => navigate('privacy')} className="hover:text-white transition-all">Polityka Prywatności</button></li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-spider-gold mb-8 font-bold">Kontakt</h4>
               <p className="text-sm text-white/90 mb-2 font-medium">{COMPANY_DATA.email}</p>
               <div className="flex gap-4 mt-6">
                  <a href={COMPANY_DATA.socials.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-spider-gold transition-all"><Icons.Instagram className="w-5 h-5"/></a>
                  <a href={COMPANY_DATA.socials.tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-spider-gold transition-all"><Icons.TikTok className="w-5 h-5"/></a>
                  <a href={COMPANY_DATA.socials.kick} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-spider-gold transition-all"><Icons.Kick className="w-5 h-5"/></a>
               </div>
            </div>
         </div>
         <div className="max-w-7xl mx-auto px-6 mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/30 uppercase tracking-widest gap-4">
            <p>© 2026 Spiderra. Wszelkie prawa zastrzeżone.</p>
            <div className="flex gap-6 items-center">
                <span className="flex items-center gap-2"><Icons.Lock className="w-3 h-3"/> SSL Secured</span>
                <span className="flex items-center gap-2">Bezpieczne płatności</span>
            </div>
         </div>
      </footer>
      <ScrollToTop/>
      {toast.visible && (
        <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 ${toast.type === 'error' ? 'bg-red-900 text-white' : 'bg-spider-dark text-white'} shadow-2xl rounded-sm transition-all duration-500 flex items-center gap-4 border border-white/10 animate-fade-in`}>
          {toast.type === 'success' ? <div className="p-1 bg-green-500 rounded-full"><Icons.Check className="w-3 h-3 text-white" /></div> : <Icons.X className="w-4 h-4 text-white" />}
          <span className="font-medium text-sm tracking-wide">{toast.message}</span>
        </div>
      )}
      {showCookies && <CookieBanner onAccept={handleAcceptCookies} />}
    </div>
  );
};

export default function App() {
  return <ErrorBoundary><AppContent /></ErrorBoundary>;
}