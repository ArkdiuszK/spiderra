import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';

// --- KONFIGURACJA API ---
// WAŻNE: Upewnij się, że plik w folderze 'netlify/functions' nazywa się dokładnie 'create-checkout-session.js'
const isProduction = window.location.hostname !== 'localhost';
// Jeśli testujesz lokalnie bez 'netlify dev', upewnij się, że masz włączony server.js na porcie 4242.
// Jeśli używasz 'netlify dev', endpointy będą dostępne pod /.netlify/functions również lokalnie.
const API_URL = isProduction ? '/.netlify/functions' : 'http://localhost:4242';

// --- KONFIGURACJA DANYCH FIRMY ---
const COMPANY_DATA = {
  name: "Arkadiusz Kołacki Spiderra Lab",
  address: "Lisów 88",
  zip: "26-660",
  city: "Lisów",
  email: "kontakt@spiderra.pl",
  phone: "+48 514 729 121",
  nip: "0000000000",
  regon: "000000000",
  bankAccount: "00 0000 0000 0000 0000 0000 0000"
};

const LOGO_URL = "/zdjecia/logo.png";

// --- PRZYŚPIESZONE ŁADOWANIE TAILWINDA ---
if (typeof document !== 'undefined' && !document.getElementById('tailwind-cdn')) {
  const script = document.createElement('script');
  script.id = 'tailwind-cdn';
  script.src = "https://cdn.tailwindcss.com";
  document.head.appendChild(script);
}

// --- IKONY ---
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
  FileText: (p) => <IconBase {...p}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></IconBase>,
  Lock: (p) => <IconBase {...p}><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></IconBase>,
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

const MOCK_PRODUCTS_DATA = [];

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

// --- WIDOKI ---

const HomeView = memo(({ navigateTo }) => (
  <div className="relative min-h-[70vh] flex items-center justify-center animate-fade-in overflow-hidden rounded-3xl">
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-blue-50 -z-10"></div>
    <div className="text-center px-4 max-w-4xl mx-auto relative">
      <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wide text-emerald-700 uppercase bg-emerald-100 rounded-full">
        Nowości już dostępne!
      </div>
      <h1 className="text-5xl md:text-8xl font-black text-gray-900 mb-8 leading-[1.1]">
        Egzotyka na <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Wyciągnięcie Ręki</span>
      </h1>
      <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed"> Spiderra to Twoje okno na świat terrarystyki. Wyselekcjonowane gatunki i profesjonalny sprzęt w zasięgu ręki. </p>
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
        <img src="/zdjecia/arek.png" alt="Arkadiusz Kołacki" className="rounded-3xl shadow-xl w-full aspect-square object-cover" />
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-4xl font-black mb-6 text-gray-900">Cześć, jestem <span className="text-emerald-500">Arek</span></h2>
        <p className="text-gray-600 leading-relaxed mb-4">Witaj w Spiderra! Moja przygoda z ptasznikami zaczęła się w 2020 roku od małej Chromki. Dziś to pasja, którą dzielę się z Wami, oferując ptaszniki z różnych regionów świata oraz transmitując to jak żyją w naturze.</p>
        <p className="text-gray-600 leading-relaxed mb-4">Każdy pająk który jest w mojej ofercie jest wybrany tak aby zarówno początkujący jak i zaawansowany hodowca znalazł coś dla siebie. Dbam o to, abyś mógł/mogła cieszyć się swoim małym zwierzakiem.</p>
        <div className="flex gap-6 pt-4">
          <div><p className="text-2xl font-black">20+</p><p className="text-xs text-emerald-600 uppercase font-bold tracking-widest">Gatunków</p></div>
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
                  <img src={LOGO_URL} alt="Logo" className="w-8 h-8 object-contain" />
                </div>
              </div>
              <div>
                <p className="text-white font-bold">Następna transmisja...</p>
                <p className="text-gray-500 text-xs">Jordania 08/02</p>
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

// --- KOMPONENTY: REGULAMIN I POLITYKA ---

const TermsView = memo(() => (
  <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-16 animate-fade-in shadow-sm max-w-4xl mx-auto">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><Icons.FileText className="w-8 h-8" /></div>
      <h2 className="text-3xl font-black text-gray-900">Regulamin Sklepu</h2>
    </div>
    <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8 text-sm">
      
      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">I. Postanowienia ogólne</h3>
        <p>Niniejszy Regulamin określa ogólne warunki, sposób świadczenia Usług drogą elektroniczną i sprzedaży prowadzonej za pośrednictwem Sklepu Internetowego www.spiderra.netlify.app. Sklep prowadzi {COMPANY_DATA.name}, wpisany do rejestru przedsiębiorców Centralnej Ewidencji i Informacji o Działalności Gospodarczej prowadzonej przez ministra właściwego ds. gospodarki pod adresem {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city}, NIP {COMPANY_DATA.nip}, REGON {COMPANY_DATA.regon}, zwany dalej Sprzedawcą.</p>
        <p className="mt-2">Kontakt ze Sprzedawcą odbywa się poprzez:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>adres poczty elektronicznej: {COMPANY_DATA.email};</li>
          <li>pod numerem telefonu: {COMPANY_DATA.phone};</li>
          <li>formularz kontaktowy dostępny na stronach Sklepu Internetowego.</li>
        </ul>
        <p className="mt-2">Niniejszy Regulamin jest nieprzerwanie dostępny w witrynie internetowej, w sposób umożliwiający jego pozyskanie, odtwarzanie i utrwalanie jego treści poprzez wydrukowanie lub zapisanie na nośniku w każdej chwili.</p>
        <p className="mt-2">Sprzedawca informuje, że korzystanie z Usług świadczonych drogą elektroniczną może wiązać się z zagrożeniem po stronie każdego użytkownika sieci Internet, polegającym na możliwości wprowadzenia do systemu teleinformatycznego Klienta szkodliwego oprogramowania oraz pozyskania i modyfikacji jego danych przez osoby nieuprawnione. By uniknąć ryzyka wystąpienia zagrożeń w/w Klient powinien stosować właściwe środki techniczne, które zminimalizują ich wystąpienie, a w szczególności programy antywirusowe i zaporę sieciową typu firewall.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">II. Definicje</h3>
        <p>Użyte w Regulaminie pojęcia oznaczają:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li><strong>Dni robocze</strong> – są to dni od poniedziałku do piątku z wyłączeniem dni ustawowo wolnych od pracy;</li>
          <li><strong>Klient</strong> – osoba fizyczna, która posiada pełną zdolność do czynności prawnych, osoba fizyczna prowadząca działalność gospodarczą, osoba prawna lub jednostka organizacyjna nie będącą osobą prawną, której przepisy szczególne przyznają zdolność prawną, która dokonuje Zamówienia w ramach Sklepu Internetowego lub korzysta z innych Usług dostępnych w Sklepie Internetowym;</li>
          <li><strong>Kodeks Cywilny</strong> – ustawa z dnia 23 kwietnia 1964 r. (Dz. U. Nr 16, poz. 93 ze zm.);</li>
          <li><strong>Konsument</strong> – Klient będący konsumentem w rozumieniu art. 22[1] Kodeksu cywilnego;</li>
          <li><strong>Przedsiębiorca</strong> – Klient będący przedsiębiorcą w rozumieniu art. 43[1] Kodeksu cywilnego;</li>
          <li><strong>Regulamin</strong> – niniejszy dokument;</li>
          <li><strong>Towar</strong> – produkt prezentowany w Sklepie Internetowym, którego opis jest dostępny przy każdym z prezentowanych produktów;</li>
          <li><strong>Umowa sprzedaży</strong> – Umowa sprzedaży Towarów w rozumieniu Kodeksu Cywilnego, zawarta pomiędzy Sprzedawcą a Klientem;</li>
          <li><strong>Usługi</strong> – usługi świadczone przez Sprzedawcę na rzecz Klientów drogą elektroniczną w rozumieniu przepisów ustawy z dnia 18 lipca 2002 roku o świadczeniu usług drogą elektroniczną (Dz.U. nr 144, poz. 1204 ze zm.);</li>
          <li><strong>Ustawa o prawach konsumenta</strong> – ustawa z dnia 30 maja 2014 r. o prawach konsumenta (Dz. U. 2014, Nr 827);</li>
          <li><strong>Ustawa o świadczeniu usług drogą elektroniczną</strong> – ustawa z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną (Dz. U. Nr 144, poz. 1204 ze zm.);</li>
          <li><strong>Zamówienie</strong> – oświadczenie woli Klienta, zmierzające bezpośrednio do zawarcia Umowy sprzedaży, określające w szczególności rodzaj i liczbę Towaru.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">III. Zasady korzystania ze Sklepu Internetowego</h3>
        <p>Korzystanie ze Sklepu Internetowego jest możliwe pod warunkiem spełnienia przez system teleinformatyczny, z którego korzysta Klient, następujących minimalnych wymagań technicznych:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>komputer lub urządzenie mobilne z dostępem do Internetu,</li>
          <li>dostęp do poczty elektronicznej,</li>
          <li>przeglądarka internetowa Internet Explorer w wersji 11 lub nowszej, Firefox w wersji 28.0 lub nowszej, Chrome w wersji 32 lub nowszej, Opera w wersji 12.17 lub nowszej, Safari w wersji 1.1. lub nowszej,</li>
          <li>włączenie w przeglądarce internetowej Cookies oraz Javascript.</li>
        </ul>
        <p className="mt-2">Korzystanie ze Sklepu Internetowego oznacza każdą czynność Klienta, która prowadzi do zapoznania się przez niego z treściami zawartymi w Sklepie.</p>
        <p className="mt-2">Klient zobowiązany jest w szczególności do:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>niedostarczania i nieprzekazywania treści zabronionych przez przepisy prawa, np. treści propagujących przemoc, zniesławiających lub naruszających dobra osobiste i inne prawa osób trzecich,</li>
          <li>korzystania ze Sklepu Internetowego w sposób niezakłócający jego funkcjonowania, w szczególności poprzez użycie określonego oprogramowania lub urządzeń,</li>
          <li>niepodejmowania działań takich jak: rozsyłanie lub umieszczanie w ramach Sklepu Internetowego niezamówionej informacji handlowej (spam),</li>
          <li>korzystania ze Sklepu Internetowego w sposób nieuciążliwy dla innych Klientów oraz dla Sprzedawcy,</li>
          <li>korzystania z wszelkich treści zamieszczonych w ramach Sklepu Internetowego jedynie w zakresie własnego użytku osobistego,</li>
          <li>korzystania ze Sklepu Internetowego w sposób zgodny z przepisami obowiązującego na terytorium Rzeczypospolitej Polskiej prawa, postanowieniami Regulaminu, a także z ogólnymi zasadami korzystania z sieci Internet.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">IV. Usługi</h3>
        <p>Sprzedawca umożliwia za pośrednictwem Sklepu Internetowego korzystanie z bezpłatnych Usług, które są świadczone przez Sprzedawcę 24 godziny na dobę, 7 dni w tygodniu.</p>
        <p>Klient ma możliwość wysyłania za pomocą formularza kontaktowego wiadomości do Sprzedawcy. Umowa o świadczenie Usługi polegającej na udostępnianiu interaktywnego formularza umożliwiającego Klientom kontakt ze Sprzedawcą jest zawierana na czas oznaczony i ulega rozwiązaniu z chwilą wysłania wiadomości przez Klienta.</p>
        <p>Sprzedawca ma prawo do organizowania okazjonalnych konkursów i promocji, których warunki każdorazowo zostaną podane na stronach internetowych Sklepu. Promocje w Sklepie Internetowym nie podlegają łączeniu, o ile Regulamin danej promocji nie stanowi inaczej.</p>
        <p>W przypadku naruszenia przez Klienta postanowień niniejszego Regulaminu, Sprzedawca po uprzednim bezskutecznym wezwaniu do zaprzestania lub usunięcia naruszeń, z wyznaczeniem stosownego terminu, może rozwiązać umowę o świadczenie Usług z zachowaniem 14-dniowego terminu wypowiedzenia.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">V. Procedura zawarcia Umowy sprzedaży</h3>
        <p>Informacje o Towarach podane na stronach internetowych Sklepu, w szczególności ich opisy, parametry techniczne i użytkowe oraz ceny, stanowią zaproszenie do zawarcia Umowy, w rozumieniu art. 71 Kodeksu Cywilnego.</p>
        <p>Wszystkie Towary dostępne w Sklepie Internetowym są fabrycznie nowe (lub stanowią zdrowe, żywe zwierzęta) i zostały legalnie wprowadzone na rynek polski.</p>
        <p>Warunkiem złożenia Zamówienia jest posiadanie aktywnego konta poczty elektronicznej.</p>
        <p>W przypadku składania Zamówienia poprzez formularz Zamówienia dostępny na stronie internetowej Sklepu Internetowego, Zamówienie zostaje złożone Sprzedawcy przez Klienta w formie elektronicznej i stanowi ofertę zawarcia Umowy sprzedaży Towarów będących przedmiotem Zamówienia. Oferta złożona w postaci elektronicznej wiąże Klienta, jeżeli na podany przez Klienta adres poczty elektronicznej Sprzedawca prześle potwierdzenie przyjęcia do realizacji Zamówienia, które stanowi oświadczenie Sprzedawcy o przyjęciu oferty Klienta i z chwilą jej otrzymania przez Klienta zawarta zostaje Umowa sprzedaży.</p>
        <p>Złożenie Zamówienia w Sklepie Internetowym za pośrednictwem telefonu, poprzez przesłanie wiadomości elektronicznej lub poprzez przesłanie wiadomości za pośrednictwem formularza kontaktowego następuje w Dniach roboczych oraz godzinach wskazanych na stronie internetowej Sklepu Internetowego.</p>
        <p>Umowa sprzedaży zawierana jest w języku polskim, o treści zgodnej z Regulaminem.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">VI. Dostawa</h3>
        <p>Dostawa Towarów jest ograniczona do terytorium Unii Europejskiej oraz jest realizowana na adres wskazany przez Klienta w trakcie składania Zamówienia.</p>
        <p>Klient może wybrać następujące formy dostawy zamówionych Towarów:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>za pośrednictwem firmy kurierskiej;</li>
          <li>za pośrednictwem operatora pocztowego;</li>
          <li>odbiór własny w punkcie odbioru osobistego Sprzedawcy.</li>
        </ul>
        <p>Sprzedawca na stronach internetowych Sklepu w opisie Towaru informuje Klienta o liczbie Dni roboczych potrzebnych do realizacji Zamówienia i jego dostawy, a także o wysokości opłat za dostawę Towaru.</p>
        <p>Sprzedawca dostarcza Klientowi dowód zakupu.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">VII. Ceny i metody płatności</h3>
        <p>Ceny Towarów podawane są w złotych polskich i zawierają wszystkie składniki, w tym cła oraz inne opłaty.</p>
        <p>Klient może wybrać następujące metody płatności:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>przelew bankowy na rachunek bankowy Sprzedawcy;</li>
          <li>gotówką przy odbiorze osobistym;</li>
          <li>płatności elektroniczne (Stripe, BLIK, karta płatnicza).</li>
        </ul>
        <p>Sprzedawca na stronach internetowych Sklepu informuje Klienta o terminie w jakim jest on zobowiązany dokonać płatności za Zamówienie. W przypadku braku płatności przez Klienta w terminie, o którym mowa, Sprzedawca po uprzednim bezskutecznym wezwaniu do zapłaty z wyznaczeniem stosownego terminu może odstąpić od Umowy na podstawie art. 491 Kodeksu Cywilnego.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">VIII. Uprawnienie do odstąpienia od Umowy</h3>
        <p>Klient będący Konsumentem może odstąpić od Umowy bez podania przyczyny poprzez złożenie stosownego oświadczenia w terminie 14 dni. Do zachowania tego terminu wystarczy wysłanie oświadczenia przed jego upływem.</p>
        <p>Prawo do odstąpienia od Umowy przez Konsumenta jest wyłączone w przypadku m.in.:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Umowy, w której przedmiotem świadczenia jest Towar ulegający szybkiemu zepsuciu lub mający krótki termin przydatności do użycia (w tym żywe zwierzęta, jeśli specyfika ich utrzymania na to wskazuje);</li>
          <li>Umowy, w której przedmiotem świadczenia jest Towar dostarczany w zapieczętowanym opakowaniu, którego po otwarciu opakowania nie można zwrócić ze względu na ochronę zdrowia lub ze względów higienicznych, jeżeli opakowanie zostało otwarte po dostarczeniu.</li>
        </ul>
        <p>W przypadku odstąpienia od Umowy zawartej na odległość, Umowa jest uważana za niezawartą. To, co strony świadczyły, ulega zwrotowi w stanie niezmienionym, chyba że zmiana była konieczna w celu stwierdzenia charakteru, cech i funkcjonalności Towaru. Zwrot powinien nastąpić niezwłocznie, nie później niż w terminie 14 dni. Zakupiony Towar należy zwrócić na adres Sprzedawcy.</p>
        <p>Sprzedawca niezwłocznie, jednak nie później niż w terminie 14 dni od dnia otrzymania oświadczenia Konsumenta o odstąpieniu od Umowy zwróci Konsumentowi wszystkie dokonane przez niego płatności, w tym koszty dostarczenia Towaru (z wyjątkiem dodatkowych kosztów wynikających z wybranego przez Konsumenta sposobu dostarczenia innego niż najtańszy zwykły sposób dostarczenia oferowany przez Sprzedawcę). Sprzedawca dokonuje zwrotu płatności przy użyciu takiego samego sposobu zapłaty, jakiego użył Konsument, chyba że Konsument wyraźnie zgodził się na inny sposób zwrotu, który nie wiąże się dla niego z żadnymi kosztami.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">IX. Reklamacje dotyczące Towarów z tytułu rękojmi</h3>
        <p>Sprzedawca zobowiązuje się dostarczyć Towar bez wad.</p>
        <p>Sprzedawca odpowiada wobec Klienta będącego Konsumentem z tytułu rękojmi za wady na zasadach określonych w art. 556 – 576 Kodeksu Cywilnego.</p>
        <p>Reklamacje, wynikające z naruszenia praw Klienta gwarantowanych prawnie lub na podstawie niniejszego Regulaminu, należy kierować na adres {COMPANY_DATA.name}, {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city}, na adres poczty elektronicznej: {COMPANY_DATA.email} lub numer telefonu {COMPANY_DATA.phone}.</p>
        <p>Celem rozpatrzenia reklamacji Klient powinien przesłać lub dostarczyć reklamowany Towar, jeżeli jest to możliwe dołączając do niego dowód zakupu.</p>
        <p>Sprzedawca zobowiązuje się do rozpatrzenia każdej reklamacji w terminie do 14 dni.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">X. Reklamacje w zakresie świadczenia usług drogą elektroniczną</h3>
        <p>Klient może zgłaszać Sprzedawcy reklamacje w związku z funkcjonowaniem Sklepu i korzystaniem z Usług. Reklamacje można zgłaszać pisemnie na adres Sprzedawcy lub elektronicznie.</p>
        <p>W reklamacji Klient powinien podać swoje imię i nazwisko, adres do korespondencji, rodzaj i opis zaistniałego problemu.</p>
        <p>Sprzedawca zobowiązuje się do rozpatrzenia każdej reklamacji w terminie do 14 dni.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">XI. Gwarancje</h3>
        <p>Towary mogą posiadać gwarancję Sprzedawcy. W przypadku żywych zwierząt, gwarancja obejmuje tzw. "Live Arrival Guarantee" (Gwarancja żywej dostawy), pod warunkiem odbioru przesyłki w dniu doręczenia i udokumentowania stanu przesyłki (film z otwierania paczki).</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">XII. Pozasądowe sposoby rozstrzygania reklamacji i dochodzenia roszczeń</h3>
        <p>Klient będący Konsumentem posiada m.in. następujące możliwości skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>zwrócenie się do stałego polubownego sądu konsumenckiego działającego przy Inspekcji Handlowej;</li>
          <li>zwrócenie się do wojewódzkiego inspektora Inspekcji Handlowej z wnioskiem o wszczęcie postępowania mediacyjnego;</li>
          <li>skorzystanie z pomocy powiatowego (miejskiego) rzecznika konsumentów lub organizacji społecznej;</li>
          <li>złożenie skargi za pośrednictwem unijnej platformy internetowej ODR: <a href="http://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">http://ec.europa.eu/consumers/odr/</a>.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">XIII. Ochrona danych osobowych</h3>
        <p>Podane przez Klientów dane osobowe Sprzedawca zbiera i przetwarza zgodnie z obowiązującymi przepisami prawa oraz zgodnie z Polityką Prywatności, dostępną na stronie Sklepu.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">XIV. Postanowienia końcowe</h3>
        <p>Wszelkie prawa do Sklepu Internetowego, w tym majątkowe prawa autorskie, prawa własności intelektualnej do jego nazwy, domeny internetowej, strony internetowej Sklepu Internetowego, a także do formularzy, logotypów należą do Sprzedawcy.</p>
        <p>W sprawach nieuregulowanych w niniejszym Regulaminie mają zastosowanie przepisy Kodeksu Cywilnego, przepisy Ustawy o świadczeniu usług drogą elektroniczną, przepisy Ustawy o prawach Konsumenta oraz inne właściwe przepisy prawa polskiego.</p>
      </section>

    </div>
  </div>
));

const PrivacyView = memo(() => (
  <div className="bg-white rounded-3xl border border-gray-100 p-8 md:p-16 animate-fade-in shadow-sm max-w-4xl mx-auto">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600"><Icons.Lock className="w-8 h-8" /></div>
      <h2 className="text-3xl font-black text-gray-900">Polityka Prywatności</h2>
    </div>
    <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed space-y-8 text-sm">
      
      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">CZYM JEST POLITYKA PRYWATNOŚCI?</h3>
        <p>Chcielibyśmy zapoznać Cię ze szczegółami przetwarzania przez nas Twoich danych osobowych, aby dać Ci pełną wiedzę i komfort w korzystaniu z naszej strony internetowej.</p>
        <p className="mt-2">W związku z tym, że sami działamy w branży internetowej, wiemy jak ważna jest ochrona Twoich danych osobowych. Dlatego dokładamy szczególnych starań, aby chronić Twoją prywatność i informacje, które nam przekazujesz.</p>
        <p className="mt-2">Starannie dobieramy i stosujemy odpowiednie środki techniczne, w szczególności te o charakterze programistycznym i organizacyjnym, zapewniające ochronę przetwarzanych danych osobowych. Nasza strona używa szyfrowanej transmisji danych (SSL), co zapewnia ochronę identyfikujących Cię danych.</p>
        <p className="mt-2">W naszej Polityce prywatności znajdziesz wszystkie najważniejsze informacje odnośnie przetwarzania przez nas Twoich danych osobowych. Prosimy Cię o jej przeczytanie i obiecujemy, że nie zajmie Ci to więcej niż kilka minut.</p>
        <p className="mt-4 font-bold">Kto jest administratorem strony internetowej?</p>
        <p>Administratorem strony internetowej jest {COMPANY_DATA.name}, wpisany do rejestru przedsiębiorców Centralnej Ewidencji i Informacji o Działalności Gospodarczej prowadzonej przez ministra właściwego ds. gospodarki pod adresem {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city}, NIP {COMPANY_DATA.nip}, REGON {COMPANY_DATA.regon} (czyli: my).</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">DANE OSOBOWE</h3>
        <p className="font-bold">Jaki akt prawny reguluje przetwarzanie Twoich danych osobowych?</p>
        <p>Twoje dane osobowe są przez nas zbierane i przetwarzane zgodnie z przepisami Rozporządzenia Parlamentu Europejskiego i Rady (UE) 2016/679 z 27.04.2016 r. w sprawie ochrony osób fizycznych w związku z przetwarzaniem danych osobowych i w sprawie swobodnego przepływu takich danych oraz uchylenia dyrektywy 95/46/WE (ogólne rozporządzenie o ochronie danych) (Dz.Urz. UE L 119, s. 1), zwanego powszechnie: RODO. W zakresie nieuregulowanym przez RODO przetwarzanie danych osobowych jest regulowane przez Ustawę o ochronie danych osobowych z dnia 10 maja 2018 r.</p>
        
        <p className="font-bold mt-4">Kto jest administratorem Twoich danych osobowych?</p>
        <p>Administratorem Twoich danych osobowych jest {COMPANY_DATA.name}, wpisany do rejestru przedsiębiorców CEIDG pod adresem {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city}, NIP {COMPANY_DATA.nip}, REGON {COMPANY_DATA.regon}.</p>
        <p className="mt-2">W sprawie swoich danych osobowych możesz skontaktować się z nami za pomocą:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>poczty elektronicznej: {COMPANY_DATA.email},</li>
          <li>poczty tradycyjnej: {COMPANY_DATA.address}, {COMPANY_DATA.zip} {COMPANY_DATA.city},</li>
          <li>telefonu: {COMPANY_DATA.phone}.</li>
        </ul>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">JAK PRZETWARZAMY TWOJE DANE OSOBOWE?</h3>
        <p className="font-bold mb-2">Cele przetwarzania i podstawa prawna:</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 border-b font-bold">Cel</th>
                <th className="p-3 border-b font-bold">Dane osobowe</th>
                <th className="p-3 border-b font-bold">Podstawa prawna</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="p-3">Zawarcie i wykonanie umowy</td>
                <td className="p-3">Imię, nazwisko, adres, NIP, e-mail, telefon</td>
                <td className="p-3">Art. 6 ust. 1 lit. b) RODO (niezbędność do umowy)</td>
              </tr>
              <tr>
                <td className="p-3">Formularz kontaktowy</td>
                <td className="p-3">Imię, nazwisko, e-mail</td>
                <td className="p-3">Art. 6 ust. 1 lit. f) RODO (prawnie uzasadniony interes)</td>
              </tr>
              <tr>
                <td className="p-3">Obowiązki prawne (podatkowe)</td>
                <td className="p-3">Imię, nazwisko, dane firmy, dane transakcji</td>
                <td className="p-3">Art. 6 ust. 1 lit. c) RODO (obowiązek prawny)</td>
              </tr>
              <tr>
                <td className="p-3">Analiza ruchu na stronie</td>
                <td className="p-3">Dane analityczne, IP</td>
                <td className="p-3">Art. 6 ust. 1 lit. f) RODO (prawnie uzasadniony interes)</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <p className="mt-4"><span className="font-bold">Dobrowolność podania danych:</span> Podanie danych jest dobrowolne, ale niezbędne do skorzystania z usług (np. złożenia zamówienia).</p>
        
        <p className="mt-4"><span className="font-bold">Odbiorcy danych:</span> Twoje dane mogą być przekazywane podmiotom przetwarzającym je na nasze zlecenie, np. dostawcom usług IT, biuru księgowemu, firmom kurierskim (w celu dostawy), operatorom płatności (Stripe, imoje).</p>
        
        <p className="mt-4"><span className="font-bold">Przekazywanie poza EOG:</span> W związku z korzystaniem z narzędzi takich jak Google Analytics, Facebook Pixel czy Stripe, Twoje dane mogą być przekazywane do USA. Podmioty te zapewniają odpowiedni poziom ochrony danych zgodnie z wymogami RODO.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">TWOJE PRAWA (RODO)</h3>
        <p>Przysługuje Ci prawo do:</p>
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>dostępu do swoich danych,</li>
          <li>sprostowania danych,</li>
          <li>usunięcia danych ("prawo do bycia zapomnianym"),</li>
          <li>ograniczenia przetwarzania,</li>
          <li>przenoszenia danych,</li>
          <li>wniesienia sprzeciwu wobec przetwarzania.</li>
        </ul>
        <p className="mt-2">W celu realizacji swoich praw skontaktuj się z nami pod adresem: {COMPANY_DATA.email}.</p>
        <p className="mt-2">Masz również prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych, jeśli uznasz, że przetwarzanie Twoich danych narusza przepisy RODO.</p>
      </section>

      <section>
        <h3 className="font-bold text-gray-900 text-lg mb-3">PLIKI COOKIES</h3>
        <p>Nasza strona wykorzystuje pliki cookies (ciasteczka) w celu zapewnienia jej poprawnego działania, analizy ruchu oraz w celach marketingowych.</p>
        <p className="mt-2"><span className="font-bold">Rodzaje cookies:</span> Stosujemy cookies sesyjne (usuwane po zamknięciu przeglądarki) oraz trwałe (przechowywane przez określony czas).</p>
        <p className="mt-2"><span className="font-bold">Zarządzanie cookies:</span> Możesz w każdym momencie zmienić ustawienia dotyczące plików cookies w swojej przeglądarce internetowej.</p>
      </section>

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
  
  const { cart, isCartOpen, setIsCartOpen, toast, addToCart, removeFromCart, updateQty, cartTotal, cartCount, showToast } = useCart();

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
    setCheckoutLoading(true);
    try {
      const endpoint = `${API_URL}/create-checkout-session`; // Upewnij się, że plik w netlify/functions nazywa się create-checkout-session.js
      console.log("Wysyłanie żądania do:", endpoint);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      if (!res.ok) {
        // Próba odczytania błędu z serwera
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
    } finally {
      setCheckoutLoading(false);
    }
  };

  const navigate = useCallback((view) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!isTailwindReady) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif', backgroundColor: '#ffffff' }}>
        <img src={LOGO_URL} alt="Spiderra" style={{ height: '80px', width: 'auto' }} />
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
          <div className="cursor-pointer flex items-center" onClick={() => navigate('home')}>
            <img src={LOGO_URL} alt="Spiderra" className="h-16 w-auto object-contain" />
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
            <button onClick={() => navigate('terms')} className="text-gray-500">Regulamin</button>
            <button onClick={() => navigate('privacy')} className="text-gray-500">Polityka Prywatności</button>
          </div>
        </div>
      )}

      {/* Widok Główny */}
      <main className="max-w-7xl mx-auto px-6 pt-32 pb-20 min-h-[80vh]">
        {activeView === 'home' && <HomeView navigateTo={navigate} />}
        {activeView === 'about' && <AboutView />}
        {activeView === 'stream' && <StreamView />}
        {activeView === 'shop' && <ShopView addToCart={addToCart} products={products} loading={loading} />}
        {activeView === 'terms' && <TermsView />}
        {activeView === 'privacy' && <PrivacyView />}
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
              <div className="mb-6 flex items-center">
                <img src={LOGO_URL} alt="Spiderra" className="h-12 w-auto object-contain" />
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
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500 text-left">Ptaszniki</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500 text-left">Terraria</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500 text-left">Nowości</button></li>
                <li><button onClick={() => navigate('shop')} className="hover:text-emerald-500 text-left">Bestsellery</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-6">Pomoc i Info</h4>
              <ul className="space-y-4 text-sm font-bold text-gray-500">
                <li><button onClick={() => navigate('terms')} className="hover:text-emerald-500 text-left">Regulamin</button></li>
                <li><button onClick={() => navigate('privacy')} className="hover:text-emerald-500 text-left">Polityka Prywatności</button></li>
                <li><button onClick={() => navigate('terms')} className="hover:text-emerald-500 text-left">Wysyłka i Zwroty</button></li>
                <li><button onClick={() => navigate('terms')} className="hover:text-emerald-500 text-left">FAQ</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-6">Kontakt</h4>
              <p className="text-sm font-bold text-gray-500 mb-2">{COMPANY_DATA.email}</p>
              <p className="text-sm font-bold text-gray-500 mb-6">{COMPANY_DATA.phone}</p>
              <p className="text-xs text-gray-400">{COMPANY_DATA.name}<br/>ul. {COMPANY_DATA.address}<br/>{COMPANY_DATA.zip} {COMPANY_DATA.city}</p>
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