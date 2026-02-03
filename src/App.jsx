import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Menu, 
  Store, 
  Video, 
  Calendar, 
  MapPin, 
  Star, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  Check, 
  Bug,
  VideoOff,
  Facebook,
  Instagram,
  Youtube,
  ArrowRight
} from 'lucide-react';

const productsData = [
  {
    id: 1,
    name: 'Chromatopelma cyaneopubescens',
    latin: 'Greenbottle Blue',
    type: 'spider',
    price: 120.00,
    image: 'https://placehold.co/400x300/e2e8f0/10b981?text=Chromatopelma',
    desc: 'L3/L4. Pięknie wybarwiony, szybki i żarłoczny.'
  },
  {
    id: 2,
    name: 'Caribena versicolor',
    latin: 'Antilles Pinktoe',
    type: 'spider',
    price: 85.00,
    image: 'https://placehold.co/400x300/e2e8f0/a78bfa?text=Versicolor',
    desc: 'L2. Klasyk wśród ptaszników nadrzewnych. Łagodny.'
  },
  {
    id: 3,
    name: 'Brachypelma hamorii',
    latin: 'Mexican Redknee',
    type: 'spider',
    price: 150.00,
    image: 'https://placehold.co/400x300/e2e8f0/f97316?text=Hamorii',
    desc: 'L5. Idealny dla początkujących. Spokojny i naziemny.'
  },
  {
    id: 4,
    name: 'Theraphosa stirmi',
    latin: 'Burgundy Goliath',
    type: 'spider',
    price: 450.00,
    image: 'https://placehold.co/400x300/e2e8f0/991b1b?text=Theraphosa',
    desc: 'L6. Gigant. Tylko dla doświadczonych hodowców.'
  },
  {
    id: 5,
    name: 'Terrarium Szklane',
    latin: '20x20x30 cm',
    type: 'gear',
    price: 90.00,
    image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Terrarium',
    desc: 'Gilotyna, podwójna wentylacja. Idealne dla nadrzewnych.'
  },
  {
    id: 6,
    name: 'Pęseta terrarystyczna',
    latin: 'Stal nierdzewna',
    type: 'gear',
    price: 25.00,
    image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Peseta',
    desc: 'Długa 30cm, prosta. Niezbędna do karmienia.'
  },
  {
    id: 7,
    name: 'Kabel grzewczy',
    latin: '15W',
    type: 'gear',
    price: 45.00,
    image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Ogrzewanie',
    desc: 'Silikonowy, wodoodporny. Zapewnia ciepło w zimne dni.'
  },
  {
    id: 8,
    name: 'Włókno kokosowe',
    latin: 'Podłoże prasowane',
    type: 'gear',
    price: 12.00,
    image: 'https://placehold.co/400x300/f1f5f9/64748b?text=Podloze',
    desc: 'Brykiet 650g. Po namoczeniu daje 8-9L podłoża.'
  }
];

export default function App() {
  const [activeView, setActiveView] = useState('home'); // State for routing: home, stream, shop, about
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [toastVisible, setToastVisible] = useState(false);

  // Filter products logic
  const filteredProducts = filter === 'all' 
    ? productsData 
    : productsData.filter(p => p.type === filter);

  // Cart logic
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
    showToast();
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Toast logic
  const showToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  // Helper to change view and close mobile menu
  const navigateTo = (view) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Inline SVG for Kick logo
  const KickIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12.9 16.7l-4.2-4.2 4.2-4.2h-3.8L5.9 11.6v-3.3H2.5v7.5h3.4v-3.3l3.2 3.3h3.8zM16.5 7.4h-3.4v9.3h3.4V7.4zM21.5 7.4h-3.4v9.3h3.4V7.4z"/>
    </svg>
  );

  // --- Views Components ---

  const HomeView = () => (
    <div className="bg-white rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] border border-gray-100 relative overflow-hidden min-h-[80vh] flex items-center justify-center">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50 transform -translate-x-1/4 translate-y-1/4"></div>

      <div className="relative z-10 text-center px-4 py-10 lg:py-20 max-w-4xl mx-auto">
        <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-7xl mb-8">
          <span className="block">Egzotyka w Twoim Domu</span>
          <span className="block text-gradient mt-4">Podróże na Twoim Ekranie</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-500 leading-relaxed">
          Spiderra to nowoczesna przestrzeń dla fanów terrarystyki. Kupuj wyselekcjonowane gatunki, dobieraj akcesoria i oglądaj relacje z wypraw w najdziksze zakątki świata.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-5">
          <button 
            onClick={() => navigateTo('shop')}
            className="flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-2xl text-white bg-[#10b981] hover:bg-[#059669] transition shadow-lg shadow-emerald-200 hover:-translate-y-1"
          >
            <Store className="mr-2 w-6 h-6" /> Zobacz Sklep
          </button>
          <button 
            onClick={() => navigateTo('stream')}
            className="flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-lg font-bold rounded-2xl text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300 transition hover:-translate-y-1"
          >
            <Video className="mr-2 w-6 h-6" /> Oglądaj LIVE
          </button>
        </div>
        
        {/* Quick Links Teaser */}
        <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
           <div 
             onClick={() => navigateTo('stream')} 
             className="cursor-pointer group hover:bg-gray-50 p-4 rounded-xl transition"
           >
             <h3 className="font-bold text-gray-900 flex items-center gap-2 group-hover:text-[#10b981]">
               Streamy <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
             </h3>
             <p className="text-sm text-gray-500 mt-1">Transmisje z wypraw i Q&A.</p>
           </div>
           <div 
             onClick={() => navigateTo('shop')} 
             className="cursor-pointer group hover:bg-gray-50 p-4 rounded-xl transition"
           >
             <h3 className="font-bold text-gray-900 flex items-center gap-2 group-hover:text-[#10b981]">
               Sklep <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
             </h3>
             <p className="text-sm text-gray-500 mt-1">Ptaszniki i akcesoria.</p>
           </div>
           <div 
             onClick={() => navigateTo('about')} 
             className="cursor-pointer group hover:bg-gray-50 p-4 rounded-xl transition"
           >
             <h3 className="font-bold text-gray-900 flex items-center gap-2 group-hover:text-[#10b981]">
               O Mnie <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
             </h3>
             <p className="text-sm text-gray-500 mt-1">Historia mojej pasji.</p>
           </div>
        </div>
      </div>
    </div>
  );

  const StreamView = () => (
    <div className="bg-white rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-gray-100 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 pb-8 border-b border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-3 h-3 bg-red-500 rounded-full live-pulse inline-block"></span>
            Centrum Transmisji
          </h2>
          <p className="text-gray-500 mt-2">Śledź wyprawy i Q&A na żywo na Kick.com</p>
        </div>
        <a 
          href="https://kick.com" 
          target="_blank" 
          rel="noreferrer"
          className="mt-4 md:mt-0 bg-black text-[#53FC18] font-bold py-2 px-6 rounded-lg hover:bg-gray-800 transition flex items-center gap-2 shadow-md"
        >
          <KickIcon /> Zaobserwuj
        </a>
      </div>

      <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl group">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-6">
            <VideoOff className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-white font-semibold">Aktualnie Offline</h3>
            <p className="text-gray-400">Sprawdź harmonogram poniżej.</p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <p className="text-white font-bold">Ostatni live: Wyprawa do Wenezueli</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Calendar className="text-[#10b981] w-5 h-5" /> Następny Stream
          </h4>
          <p className="text-gray-600 text-sm">Piątek, 20:00</p>
          <p className="text-gray-400 text-xs mt-1">Temat: Karmienie ptaszników</p>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <MapPin className="text-purple-500 w-5 h-5" /> Ostatnia Wyprawa
          </h4>
          <p className="text-gray-600 text-sm">Wenezuela</p>
          <p className="text-gray-400 text-xs mt-1">Cel: Chromatopelma</p>
        </div>
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Star className="text-yellow-500 w-5 h-5" /> Subskrypcja
          </h4>
          <p className="text-gray-600 text-sm">Dołącz do grupy VIP.</p>
        </div>
      </div>
    </div>
  );

  const ShopView = () => (
    <div className="bg-white rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-gray-100 animate-fade-in">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">Sklep Terrarystyczny</h2>
        <p className="text-gray-500 max-w-2xl mx-auto">Zdrowe osobniki z legalnych hodowli i sprawdzone akcesoria.</p>
        
        <div className="mt-8 inline-flex bg-gray-100 rounded-lg p-1">
          {[
            { id: 'all', label: 'Wszystko' },
            { id: 'spider', label: 'Ptaszniki' },
            { id: 'gear', label: 'Akcesoria' }
          ].map((f) => (
            <button 
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-6 py-2 rounded-md text-sm font-medium transition ${
                filter === f.id 
                ? 'bg-[#10b981] text-white shadow-md' 
                : 'bg-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 border border-gray-100 flex flex-col group">
            <div className="relative overflow-hidden h-48 bg-gray-50">
              <img src={product.image} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
              {product.type === 'spider' && (
                <span className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs text-gray-800 px-2 py-1 rounded-md font-bold shadow-sm">
                  Żywe zwierzę
                </span>
              )}
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-lg font-bold text-gray-900 leading-tight">{product.name}</h3>
              <p className="text-xs font-semibold text-[#10b981] uppercase tracking-wide mb-2 mt-1">{product.latin}</p>
              <p className="text-gray-500 text-sm mb-4 flex-1 leading-relaxed">{product.desc}</p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                <span className="text-xl font-bold text-gray-900">{product.price.toFixed(2)} zł</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-gray-900 hover:bg-[#10b981] text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-lg transform active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AboutView = () => (
    <div className="bg-white rounded-3xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] p-8 md:p-12 border border-gray-100 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-12 items-start">
        <div className="w-full md:w-1/3 flex flex-col items-center">
          <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-gray-50 shadow-lg mb-6 group">
            <img 
              src="https://placehold.co/400x400/1f2937/10b981?text=Ja" 
              alt="Właściciel Spiderra" 
              className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
            />
          </div>
          <div className="flex space-x-4">
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-[#53FC18] hover:text-black transition shadow-sm transform hover:scale-110 hover:-translate-y-1">
              <KickIcon />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-pink-600 hover:text-white transition shadow-sm transform hover:scale-110 hover:-translate-y-1">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-blue-600 hover:text-white transition shadow-sm transform hover:scale-110 hover:-translate-y-1">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-red-600 hover:text-white transition shadow-sm transform hover:scale-110 hover:-translate-y-1">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Bug className="text-[#10b981] w-8 h-8" /> 
            O Mnie
          </h2>
          <h3 className="text-xl text-[#10b981] font-medium mb-6">Pasjonat, Hodowca, Podróżnik</h3>
          
          <div className="prose prose-gray text-gray-600 leading-relaxed mb-8">
            <p className="mb-4">
              Cześć! Nazywam się <strong>Kacper</strong> i jestem twórcą projektu <strong>Spiderra</strong>. Wszystko zaczęło się od jednego małego pająka, który całkowicie zmienił moje spojrzenie na świat przyrody. To, co zaczęło się jako ciekawość, przerodziło się w życiową pasję.
            </p>
            <p className="mb-4">
              Dzisiaj moja działalność to nie tylko hodowla w domu. Regularnie pakuję plecak i wyruszam w najdalsze zakątki świata – od wilgotnych lasów Amazonii po pustynne tereny Afryki – aby obserwować ptaszniki w ich naturalnym środowisku. Te wyprawy możecie śledzić na moich streamach na Kicku!
            </p>
            <p>
              Stworzyłem to miejsce, aby dzielić się wiedzą, oferować Wam zdrowe, zadbane zwierzęta z legalnych źródeł oraz sprzęt, którego sam używam każdego dnia. Dzięki, że jesteście częścią tej dzikiej społeczności!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Sklep</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#10b981] transition">Regulamin</a></li>
                <li><a href="#" className="hover:text-[#10b981] transition">Dostawa i Płatności</a></li>
                <li><a href="#" className="hover:text-[#10b981] transition">Zwroty</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">Współpraca</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-[#10b981] transition">Dla Hodowców</a></li>
                <li><a href="#" className="hover:text-[#10b981] transition">Reklama</a></li>
                <li><a href="#" className="hover:text-[#10b981] transition">Kontakt</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-xs flex flex-col md:flex-row justify-between items-center">
         <span>&copy; {new Date().getFullYear()} Spiderra. Wszelkie prawa zastrzeżone.</span>
         <span className="mt-2 md:mt-0 flex items-center gap-1">Designed with <Star className="w-3 h-3 text-[#10b981]" fill="#10b981"/> for nature.</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[#f3f4f6] text-[#1f2937] min-h-screen font-sans selection:bg-[#10b981] selection:text-white">
      {/* Global Styles for animations and scrollbars */}
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #10b981; }
        
        @keyframes pulse-red {
          0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
        }
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .live-pulse { animation: pulse-red 2s infinite; }
        .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
        .text-gradient {
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-image: linear-gradient(to right, #1f2937, #10b981);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center cursor-pointer" onClick={() => navigateTo('home')}>
              <span className="text-3xl font-bold text-gray-900 tracking-wider flex items-center gap-2">
                <Bug className="text-[#10b981] w-8 h-8" />
                SPIDERRA
              </span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                {[
                  { id: 'home', label: 'Start' },
                  { id: 'stream', label: 'Streamy' },
                  { id: 'shop', label: 'Sklep' },
                  { id: 'about', label: 'O mnie' }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                      activeView === item.id 
                        ? 'text-[#10b981] bg-gray-50' 
                        : 'text-gray-600 hover:text-[#10b981] hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-600 hover:text-[#10b981] transition">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#10b981] rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
              <button 
                className="md:hidden p-2 text-gray-600 hover:text-gray-900"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 pb-4 shadow-lg">
            {[
              { id: 'home', label: 'Start' },
              { id: 'stream', label: 'Streamy' },
              { id: 'shop', label: 'Sklep' },
              { id: 'about', label: 'O mnie' }
            ].map((item) => (
              <button 
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`block w-full text-left px-4 py-3 hover:bg-gray-50 ${
                   activeView === item.id ? 'text-[#10b981] font-bold' : 'text-gray-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        {activeView === 'home' && <HomeView />}
        {activeView === 'stream' && <StreamView />}
        {activeView === 'shop' && <ShopView />}
        {activeView === 'about' && <AboutView />}
      </div>

      {/* Shopping Cart Sidebar (Same as before) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60]">
          <div 
            className="absolute inset-0 bg-gray-900 bg-opacity-20 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          ></div>
          <div className="absolute top-0 right-0 max-w-md w-full h-full bg-white shadow-2xl flex flex-col animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Koszyk</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gray-200" />
                  <p>Twój koszyk jest pusty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex items-center gap-4 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">{item.price.toFixed(2)} zł / szt.</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button 
                          onClick={() => updateQty(item.id, -1)} 
                          className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-xs hover:border-gray-400 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-mono text-gray-700 font-bold">{item.qty}</span>
                        <button 
                          onClick={() => updateQty(item.id, 1)} 
                          className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-xs hover:border-gray-400 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="text-gray-400 hover:text-red-500 transition p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <p>Razem</p>
                <p>{cartTotal.toFixed(2)} PLN</p>
              </div>
              <button 
                onClick={() => { if(cart.length > 0) alert('Przekierowanie do płatności...'); }}
                className={`w-full flex justify-center items-center px-6 py-4 rounded-xl text-base font-bold text-white transition shadow-lg ${
                  cart.length > 0 
                  ? 'bg-[#10b981] hover:bg-[#059669] shadow-emerald-200 cursor-pointer' 
                  : 'bg-gray-300 cursor-not-allowed'
                }`}
                disabled={cart.length === 0}
              >
                Przejdź do kasy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      <div 
        className={`fixed bottom-8 right-8 bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl transform transition-all duration-300 z-[70] flex items-center gap-3 ${
          toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'
        }`}
      >
        <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-xs text-white">
          <Check className="w-4 h-4" />
        </div>
        <span className="font-medium">Dodano do koszyka!</span>
      </div>
    </div>
  );
}