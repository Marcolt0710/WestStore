import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TeamName, JerseyKit } from './types';
import KitCard from './components/KitCard';
import AdminPanel from './components/AdminPanel';
import { loadSiteConfig, loadJerseyCatalog } from './config';
import { 
  Search, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Instagram,
  Heart,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Check,
  Crown,
  Star,
  MessageSquare,
  ShoppingCart
} from 'lucide-react';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('west_store_theme') as 'dark' | 'light') || 'dark';
  });
  const [themeRotation, setThemeRotation] = useState(0);
  
  // Dynamic site configs & jerseys list
  const [siteConfig, setSiteConfig] = useState(() => loadSiteConfig());
  const [jerseys, setJerseys] = useState(() => loadJerseyCatalog());
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // VIP checkout form fields
  const [vipName, setVipName] = useState('');
  const [vipSubmitting, setVipSubmitting] = useState(false);
  const [vipJoined, setVipJoined] = useState(false);

  // Banner carrossel active index
  const [activeSlide, setActiveSlide] = useState(0);

  // "Ver mais" toggle states for sections
  const [showAllNacionais, setShowAllNacionais] = useState(false);
  const [showAllRetro, setShowAllRetro] = useState(false);
  const [showAllExclusivas, setShowAllExclusivas] = useState(false);

  // Sync themes classes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('west_store_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    setThemeRotation(prev => prev + 360);
  };

  // Fetch real-time DB data on mount
  const fetchGlobalData = async () => {
    try {
      const configRes = await fetch('/api/site-config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setSiteConfig(configData);
        localStorage.setItem('west_store_config', JSON.stringify(configData));
      }
      
      const catalogRes = await fetch('/api/catalog');
      if (catalogRes.ok) {
        const catalogData = await catalogRes.json();
        setJerseys(catalogData);
      }
    } catch (e) {
      console.error("Erro ao sincronizar dados com o servidor:", e);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleRefreshAdminData = () => {
    fetchGlobalData();
  };

  // Scroll to helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Filter lists based on DB values
  const listNacionais = useMemo(() => {
    return jerseys.filter(k => !k.isRetro && (k.type === 'HomeKit' || k.type === 'AwayKit'));
  }, [jerseys]);

  const listRetro = useMemo(() => {
    return jerseys.filter(k => k.isRetro);
  }, [jerseys]);

  const listExclusivas = useMemo(() => {
    return jerseys.filter(k => !k.isRetro && (k.type === 'SpecialKit' || k.type === 'ThirdKit'));
  }, [jerseys]);

  // If search query is active, filter universally
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return jerseys.filter(k => {
      const q = searchQuery.toLowerCase();
      return k.name.toLowerCase().includes(q) || 
             k.team.toLowerCase().includes(q) || 
             (k.sponsor && k.sponsor.toLowerCase().includes(q));
    });
  }, [jerseys, searchQuery]);

  // Carrossel slide timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 3);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  // Instagram Feed images
  const instagramFeed = [
    { id: 1, likes: '4.2k', comments: '128', review: 'Caimento sensacional, manto do SPFC tricolor ficou divino!', image: '/src/assets/images/banner_stadium_1781608018939.jpg' },
    { id: 2, likes: '5.1k', comments: '184', review: 'Qualidade do bordado 1:1 indiscutível. Perfeição!', image: '/src/assets/images/banner_retro_1781608004592.jpg' },
    { id: 3, likes: '6.3k', comments: '220', review: 'Comprei 4 camisas para o atacado e chegou super rápido!', image: '/src/assets/images/banner_fabric_1781608032337.jpg' },
    { id: 4, likes: '3.9k', comments: '85', review: 'A retrô do Flamengo de 1992 veio com todos os patchs!', image: '/src/assets/images/banner_retro_1781608004592.jpg' },
    { id: 5, likes: '4.7k', comments: '112', review: 'Material antissuor perfeito para o futebol do findi', image: '/src/assets/images/banner_fabric_1781608032337.jpg' },
    { id: 6, likes: '5.8k', comments: '190', review: 'O atendimento no WhatsApp foi rápido do início ao fim!', image: '/src/assets/images/banner_stadium_1781608018939.jpg' },
  ];

  const handleJoinVipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipName.trim()) return;
    setVipSubmitting(true);
    setTimeout(() => {
      setVipSubmitting(false);
      setVipJoined(true);
      const textMessage = `Olá West Store! Quero entrar para o Grupo VIP West Store por R$ ${siteConfig.vipPrice}/mês. Meu nome é ${vipName.trim()}`;
      window.open(`https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(textMessage)}`, '_blank');
    }, 1200);
  };

  return (
    <div className="bg-navy-principal min-h-screen text-branco-texto flex flex-col selection:bg-vermelho-west selection:text-white font-sans antialiased">
      
      {/* 1. BARRA DE ANÚNCIO NO TOPO (Marquee Correndo) */}
      <div className="bg-[#8B2523] text-white text-xs py-2 overflow-hidden relative border-b border-white/10 z-50 select-none">
        <div className="flex w-[200%] animate-marquee whitespace-nowrap uppercase tracking-[1px] font-semibold text-[10px] sm:text-[11px]">
          <span className="inline-block px-4">
            🔥 FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS DE ATACADO! • ⭐ COMPRE 4 PEÇAS OU MAIS E COBRE PREÇO DE ATACADO AUTOMATICAMENTE • 👑 NOVO LOTE DE MANTOS RETRÔ DISPONÍVEIS • 💎 PARTICIPE DO GRUPO VIP POR APENAS R$ {siteConfig.vipPrice}/MÊS E GANHE PROMOÇÕES!
          </span>
          <span className="inline-block px-4">
            🔥 FRETE GRÁTIS PARA TODO O BRASIL EM COMPRAS DE ATACADO! • ⭐ COMPRE 4 PEÇAS OU MAIS E COBRE PREÇO DE ATACADO AUTOMATICAMENTE • 👑 NOVO LOTE DE MANTOS RETRÔ DISPONÍVEIS • 💎 PARTICIPE DO GRUPO VIP POR APENAS R$ {siteConfig.vipPrice}/MÊS E GANHE PROMOÇÕES!
          </span>
        </div>
      </div>

      {/* 2. NAV FIXO */}
      <header className="sticky top-0 z-40 bg-navy-principal/95 backdrop-blur-md border-b border-borda-sutil select-none shadow-sm shadow-[#000]/10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          
          {/* Logo Left */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setSearchQuery(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <div className="w-10 h-10 bg-vermelho-west rounded-full flex items-center justify-center relative shadow-sm">
              <span className="font-display font-bold text-white text-[12px] tracking-widest">
                WEST
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-medium text-xl text-branco-texto leading-none tracking-wide">
                WEST STORE
              </span>
              <span className="text-[9px] font-bold text-cinza-muted tracking-wider uppercase leading-none mt-0.5">
                Mantos Premium
              </span>
            </div>
          </div>

          {/* Links de Categorias no Centro */}
          <nav className="hidden md:flex items-center gap-6 text-[11px] uppercase font-bold tracking-[1.5px] text-cinza-muted">
            <button 
              onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection('destaques-nacionais'), 100); }}
              className="hover:text-vermelho-ativo transition-colors"
            >
              Nacionais
            </button>
            <button 
              onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection('colecao-retro'), 100); }}
              className="hover:text-dourado-retro transition-colors"
            >
              Linha Retrô
            </button>
            <button 
              onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection('destaque-exclusivo'), 100); }}
              className="hover:text-vermelho-ativo transition-colors"
            >
              Exclusivas & Reservas
            </button>
            <button 
              onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection('grupo-vip'), 100); }}
              className="hover:text-dourado-retro transition-colors flex items-center gap-1"
            >
              Grupo VIP <Crown className="w-3.5 h-3.5 text-dourado-retro fill-dourado-retro" />
            </button>
          </nav>

          {/* WhatsApp Ícone à Direita (No lugar do carrinho) */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 text-cinza-muted hover:text-branco-texto hover:bg-navy-secundario rounded-md border border-borda-sutil transition-all flex items-center justify-center cursor-pointer"
              title="Alternar tema"
            >
              <motion.div animate={{ rotate: themeRotation }} transition={{ duration: 0.4 }}>
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
              </motion.div>
            </button>

            {/* WhatsApp Link button */}
            <a
              href={`https://wa.me/${siteConfig.whatsappNumber}`}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] hover:bg-[#20ba59] text-white px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-md font-sans font-bold text-[11px] tracking-wide uppercase flex items-center gap-1.5 transition-all shadow-md active:scale-95 whitespace-nowrap"
            >
              <svg viewBox="0 0 448 512" className="w-4 h-4 fill-white">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span> Atendimento
            </a>

          </div>
        </div>
      </header>

      {/* CORE CONTROL: RENDER SEARCH RESULTS INTERFACE OR STANDARD 10-SECTION LANDING PAGE */}
      {searchQuery.trim().length > 0 ? (
        
        /* SEARCH RESULTS SCREEN */
        <main className="max-w-7xl mx-auto px-4 py-12 flex-1 w-full">
          <div className="flex items-center justify-between border-b border-borda-sutil pb-5 mb-8">
            <div>
              <span className="text-[11px] font-mono font-normal uppercase tracking-[2px] text-[#C0392B] block mb-1">
                RESULTADOS DA SUA PESQUISA
              </span>
              <h2 className="text-3xl font-display text-branco-texto tracking-wide leading-none">
                ENCONTRADOS {searchResults.length} MANTOS PARA "{searchQuery.toUpperCase()}"
              </h2>
            </div>
            <button 
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold px-4 py-2 bg-navy-secundario rounded-md border border-borda-sutil hover:border-vermelho-west transition-colors"
            >
              Limpar Busca
            </button>
          </div>

          {searchResults.length === 0 ? (
            <div className="bg-navy-secundario p-14 text-center rounded-xl border border-borda-sutil max-w-2xl mx-auto">
              <p className="text-5xl mb-4">🔍</p>
              <h3 className="text-xl font-display text-branco-texto mb-2">Não encontramos camisas</h3>
              <p className="text-sm text-cinza-muted leading-relaxed">
                Tente redefinir os termos de busca ou utilize as categorias no menu superior para navegar entre os mantos disponíveis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((kit, idx) => (
                <KitCard key={kit.id} kit={kit} index={idx} />
              ))}
            </div>
          )}
        </main>
      ) : (

        /* STANDARD 10-SECTION LANDING PAGE (EXACT BONETI CONFIGURATION) */
        <div id="lander-container">
          
          {/* SEARCH TRIGGER INPUT AND TITLE */}
          <div className="bg-navy-secundario px-4 py-4 select-none border-b border-borda-sutil">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <span className="text-xs text-cinza-muted font-normal max-w-md text-center md:text-left leading-tight">
                Busca Rápida de Mantos: Encontre o seu manto rubro-negro, tricolor, clássico de copas ou lendas!
              </span>
              <div className="relative w-full max-w-sm">
                <input
                  type="text"
                  placeholder="Pesquisar por time, ano ou detalhes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-navy-principal border border-borda-sutil focus:border-[#8B2523] text-[#F2F4F7] placeholder-[#8FA3B1]/40 text-xs py-2.5 pl-9 pr-8 rounded-md outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-cinza-muted/60 absolute left-3 top-3" />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-xs text-cinza-muted hover:text-white">✕</button>
                )}
              </div>
            </div>
          </div>

          {/* 3. HERO EM CARROSSEL */}
          <section className="relative h-[420px] sm:h-[520px] lg:h-[580px] bg-slate-950 overflow-hidden select-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 w-full h-full"
              >
                {/* Background image overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={
                      activeSlide === 0 
                        ? '/src/assets/images/banner_stadium_1781608018939.jpg' 
                        : activeSlide === 1 
                          ? '/src/assets/images/banner_retro_1781608004592.jpg'
                          : '/src/assets/images/banner_fabric_1781608032337.jpg'
                    }
                    alt="Promo Banner"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-35"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-principal via-transparent to-navy-principal/70" />
                </div>

                <div className="absolute inset-0 flex items-center z-10">
                  <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="max-w-xl sm:max-w-2xl text-left space-y-4 sm:space-y-6">
                      
                      {/* Eyebrow */}
                      <span className="text-[11px] font-mono font-normal uppercase tracking-[2px] text-[#C0392B] block">
                        {activeSlide === 0 
                          ? 'COLEÇÃO TEMPORADA 24/25' 
                          : activeSlide === 1 
                            ? 'RARIDADES DE COLECIONADOR' 
                            : 'CONHEÇA A NOSSA QUALIDADE'}
                      </span>

                      {/* Display Header Bebas Neue */}
                      <h1 className="text-5xl sm:text-7xl lg:text-8xl font-display font-normal text-[#F2F4F7] uppercase tracking-tight leading-none">
                        {activeSlide === 0 ? 'MANTOS SACRAMENTADOS DA TEMPORADA' : ''}
                        {activeSlide === 1 ? 'CAMISAS RETRÔ DO SÃO PAULO E FLAMENGO' : ''}
                        {activeSlide === 2 ? 'PADRÃO TAILANDÊS DE VERDADE 1:1' : ''}
                      </h1>

                      <p className="text-sm sm:text-base text-cinza-muted leading-relaxed">
                        {activeSlide === 0 && 'Vista seu manto com orgulho e elegância. Acabamento primoroso com tecidos que repelem o suor das maiores equipes nacionais.'}
                        {activeSlide === 1 && 'Acabamentos e patrocínios históricos recriados cirurgicamente nos tecidos e golas retrô de época.'}
                        {activeSlide === 2 && 'Patches oficiais, escudos bordados em altíssima definição e costura dupla para durar por décadas de glória.'}
                      </p>

                      {/* CTA Buttons */}
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            if (activeSlide === 0) scrollToSection('destaques-nacionais');
                            if (activeSlide === 1) scrollToSection('colecao-retro');
                            if (activeSlide === 2) scrollToSection('destaque-exclusivo');
                          }}
                          className="bg-[#8B2523] hover:bg-[#C0392B] text-white px-7 py-3.5 rounded-[5px] font-sans font-bold text-xs uppercase tracking-widest transition-all shadow-md shadow-[#8B2523]/20"
                        >
                          Conhecer Manto
                        </button>
                        <button
                          onClick={() => scrollToSection('grupo-vip')}
                          className="bg-transparent border border-white/20 hover:border-white text-white px-7 py-3.5 rounded-[5px] font-sans font-bold text-xs uppercase tracking-widest transition-all"
                        >
                          Entrar pro VIP
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel navigation arrows */}
            <button 
              onClick={() => setActiveSlide(prev => (prev - 1 + 3) % 3)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white hover:bg-[#8B2523] hover:border-[#8B2523]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setActiveSlide(prev => (prev + 1) % 3)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full border border-white/10 bg-black/40 flex items-center justify-center text-white hover:bg-[#8B2523] hover:border-[#8B2523]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Slider Dots indicators */}
            <div className="absolute bottom-5 inset-x-0 z-20 flex justify-center gap-2">
              {[0, 1, 2].map(idx => (
                <button
                  key={idx}
                  onClick={() => setActiveSlide(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${activeSlide === idx ? 'w-8 bg-[#8B2523]' : 'bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </section>

          {/* Value Highlights Under Hero */}
          <div className="bg-navy-secundario border-b border-borda-sutil py-6 select-none">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-vermelho-west/10 rounded flex items-center justify-center border border-vermelho-west/20">
                  <Truck className="w-5 h-5 text-vermelho-ativo" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-branco-texto uppercase tracking-wide leading-none">Frete Grátis Brasil</h4>
                  <span className="text-[11px] text-cinza-muted mt-1 block">Rastros por WhatsApp em até 5 dias</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-vermelho-west/10 rounded flex items-center justify-center border border-vermelho-west/20">
                  <ShieldCheck className="w-5 h-5 text-vermelho-ativo" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-branco-texto uppercase tracking-wide leading-none">Compra Protegida</h4>
                  <span className="text-[11px] text-cinza-muted mt-1 block">Fechamento humanizado no WhatsApp</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-vermelho-west/10 rounded flex items-center justify-center border border-vermelho-west/20">
                  <Sparkles className="w-5 h-5 text-dourado-retro" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-branco-texto uppercase tracking-wide leading-none">Membros Exclusivos</h4>
                  <span className="text-[11px] text-cinza-muted mt-1 block">Acesso com cupons dourados e sorteios</span>
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Catalog Section */}
          {jerseys.length > 0 ? (
            <>
              {/* 4. SEÇÃO "COLEÇÕES" (Grid de cards de Categorias) */}
              <section id="colecoes-grid" className="py-12 max-w-7xl mx-auto px-4 select-none">
                <span className="text-[11px] font-mono font-normal uppercase tracking-[2px] text-[#C0392B] block mb-2 text-center">
                  EXPLORE NOSSOS MANTOS
                </span>
                <h2 className="text-3xl sm:text-4xl font-display font-normal text-branco-texto text-center tracking-wide uppercase mb-8">
                  Coleções Oficiais West Store
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Category Card 1 */}
                  <div 
                    onClick={() => scrollToSection('destaques-nacionais')}
                    className="group relative h-48 rounded-[10px] overflow-hidden border border-borda-sutil cursor-pointer bg-gradient-to-br from-navy-secundario to-navy-terciario"
                  >
                    <div className="absolute inset-0 bg-red-950/20 group-hover:bg-red-950/40 transition-colors z-10" />
                    <div className="absolute inset-0 z-0">
                      <img src="/src/assets/images/banner_stadium_1781608018939.jpg" className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                      <span className="text-[9px] font-mono tracking-[2px] text-vermelho-ativo font-bold uppercase">LINHA NACIONAL</span>
                      <div className="space-y-1">
                        <h3 className="font-display text-2xl text-branco-texto uppercase leading-none">MANTOS DE TIME</h3>
                        <p className="text-[10px] text-cinza-muted">Temporada Regular</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Card 2 */}
                  <div 
                    onClick={() => scrollToSection('colecao-retro')}
                    className="group relative h-48 rounded-[10px] overflow-hidden border border-borda-sutil cursor-pointer bg-gradient-to-br from-navy-secundario to-navy-terciario border-dourado-retro/20"
                  >
                    <div className="absolute inset-0 bg-amber-950/10 group-hover:bg-amber-950/30 transition-colors z-10" />
                    <div className="absolute inset-0 z-0">
                      <img src="/src/assets/images/banner_retro_1781608004592.jpg" className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                      <span className="text-[9px] font-mono tracking-[2px] text-dourado-retro font-bold uppercase">RARIDADES DE ÉPOCA</span>
                      <div className="space-y-1">
                        <h3 className="font-display text-2xl text-[#D4A843] uppercase leading-none">LINHA RETRÔ</h3>
                        <p className="text-[10px] text-cinza-muted">Bordados Clássicos</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Card 3 */}
                  <div 
                    onClick={() => scrollToSection('destaque-exclusivo')}
                    className="group relative h-48 rounded-[10px] overflow-hidden border border-borda-sutil cursor-pointer bg-gradient-to-br from-navy-secundario to-navy-terciario"
                  >
                    <div className="absolute inset-0 bg-blue-950/10 group-hover:bg-blue-950/30 transition-colors z-10" />
                    <div className="absolute inset-0 z-0">
                      <img src="/src/assets/images/banner_fabric_1781608032337.jpg" className="w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                      <span className="text-[9px] font-mono tracking-[2px] text-vermelho-ativo font-bold uppercase">EDITIONS ESPECIAIS</span>
                      <div className="space-y-1">
                        <h3 className="font-display text-2xl text-branco-texto uppercase leading-none">ESPECIAIS & RESERVAS</h3>
                        <p className="text-[10px] text-cinza-muted">Mantos Alternativos</p>
                      </div>
                    </div>
                  </div>

                  {/* Category Card 4 */}
                  <div 
                    onClick={() => scrollToSection('grupo-vip')}
                    className="group relative h-48 rounded-[10px] overflow-hidden border border-borda-sutil cursor-pointer bg-gradient-to-br from-navy-secundario to-navy-terciario border-dourado-retro/40"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-dourado-retro" />
                    <div className="absolute inset-0 bg-[#000]/20 group-hover:bg-[#000]/40 transition-colors z-10" />
                    <div className="absolute inset-x-0 top-3 flex items-center justify-end px-3">
                      <Crown className="w-4 h-4 text-dourado-retro fill-dourado-retro" />
                    </div>
                    <div className="absolute inset-0 p-5 flex flex-col justify-between z-20">
                      <span className="text-[9px] font-mono tracking-[2px] text-dourado-retro font-bold uppercase">CLUBE EXCLUSIVO</span>
                      <div className="space-y-1">
                        <h3 className="font-display text-2xl text-[#D4A843] uppercase leading-none">SÓCIOS VIP</h3>
                        <p className="text-[10px] text-cinza-muted">Sorteios e Descontos Gold</p>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* 5. SEÇÃO DE PRODUTOS EM DESTAQUE (Mantos Nacionais / Temporada) */}
              <section id="destaques-nacionais" className="py-12 bg-navy-secundario/30 border-t border-borda-sutil scroll-mt-24">
                <div className="max-w-7xl mx-auto px-4">
                  
                  <div className="mb-8 border-b border-borda-sutil pb-4">
                    <span className="text-[11px] font-mono font-normal uppercase tracking-[2px] text-[#C0392B] block mb-1">
                      CATEGORIA DE DESTAQUE
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-display font-normal text-branco-texto uppercase tracking-wide">
                      Mantos Nacionais de Temporada
                    </h2>
                    <p className="text-xs text-cinza-muted mt-1">
                      Selecione as camisas de jogo de sua escolha. Atacado ativado automaticamente ao levar 4 peças ou mais!
                    </p>
                  </div>

                  {/* Grid Horizontal / Grid layout depending on "VER MAIS" toggle */}
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300`}>
                    {(showAllNacionais ? listNacionais : listNacionais.slice(0, 3)).map((kit, index) => (
                      <KitCard key={kit.id} kit={kit} index={index} />
                    ))}
                  </div>

                  {/* Botão VER MAIS no final */}
                  {listNacionais.length > 3 && (
                    <div className="mt-10 text-center">
                      <button
                        onClick={() => setShowAllNacionais(!showAllNacionais)}
                        className="inline-flex items-center gap-2 border border-borda-sutil bg-transparent text-white px-7 py-3 rounded-[5px] font-sans font-bold text-xs uppercase tracking-widest transition-all hover:bg-vermelho-west hover:border-vermelho-west"
                      >
                        {showAllNacionais ? 'MOSTRAR MENOS' : 'VER MAIS PRODUTOS'}
                      </button>
                    </div>
                  )}

                </div>
              </section>
            </>
          ) : (
            <div className="max-w-2xl mx-auto my-16 p-10 bg-navy-secundario rounded-xl border border-borda-sutil text-center space-y-4 shadow-xl select-none">
              <span className="text-4xl">⚽</span>
              <h3 className="font-display text-2xl text-white uppercase tracking-wide">Mantos em Atualização</h3>
              <p className="text-sm text-cinza-muted leading-relaxed max-w-md mx-auto">
                O estoque e os lançamentos oficiais da nossa loja estão sendo cadastrados pelo administrador. Volte em breve ou entre em contato direto pelo WhatsApp para solicitar o seu manto sob encomenda!
              </p>
              <div className="pt-2 flex justify-center">
                <a
                  href={`https://wa.me/${siteConfig.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white px-6 py-2.5 rounded-md font-sans font-bold text-xs uppercase tracking-wider transition-all"
                >
                  <svg viewBox="0 0 448 512" className="w-4 h-4 fill-white">
                    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
                  </svg>
                  Solicitar Manto por WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* 6. BANNER DO GRUPO VIP (Banner fullwidth centralizado) */}
          <section id="grupo-vip" className="relative py-16 scroll-mt-24 bg-[#14263A] overflow-hidden border-t border-b border-dourado-retro/30 select-none">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-dourado-retro/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-red-600/5 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="max-w-6xl mx-auto px-4 relative z-10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Info block */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-[#D4A843] animate-bounce" />
                    <span className="text-[11px] font-mono font-normal uppercase tracking-[2px] text-[#D4A843]">
                      ACESSO VIP EXCLUSIVO
                    </span>
                  </div>

                  <h2 className="text-4xl sm:text-6xl font-display font-normal text-white uppercase tracking-tight leading-none">
                    GRUPO VIP <span className="text-[#D4A843]">WEST STORE</span>
                  </h2>

                  <p className="text-sm sm:text-base text-cinza-muted leading-relaxed">
                    Participe do nosso clube fechado e tenha acesso a vantagens que ninguém mais tem. Cupom de frete inteiramente fixo, sorteios semanais, prioridade na fila de encomendas sob medida e atendimento direto com nossos gerentes seniores.
                  </p>

                  {/* Benefit items list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div className="flex items-start gap-2 text-xs text-[#F2F4F7]">
                      <Check className="w-4 h-4 text-dourado-retro shrink-0" />
                      <span>Participação garantida em sorteios mensais</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-[#F2F4F7]">
                      <Check className="w-4 h-4 text-dourado-retro shrink-0" />
                      <span>Rifas de mantos com bilhete gratuito</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-[#F2F4F7]">
                      <Check className="w-4 h-4 text-dourado-retro shrink-0" />
                      <span>Cupons adicionais cumulativos</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-[#F2F4F7]">
                      <Check className="w-4 h-4 text-dourado-retro shrink-0" />
                      <span>Trocas agilizadas sem custo extra</span>
                    </div>
                  </div>
                </div>

                {/* Form checkout block */}
                <div className="lg:col-span-5">
                  <div className="bg-navy-terciario p-6 rounded-[10px] border border-borda-sutil relative">
                    <div className="absolute top-0 inset-x-0 h-1 bg-dourado-retro" />
                    
                    {vipJoined ? (
                      <div className="text-center py-6 space-y-3.5">
                        <div className="w-12 h-12 bg-dourado-retro/10 rounded-full flex items-center justify-center mx-auto">
                          <Crown className="w-6 h-6 text-dourado-retro" />
                        </div>
                        <h4 className="text-lg font-display text-white italic uppercase tracking-wide">Inscrição Solicitada!</h4>
                        <p className="text-xs text-cinza-muted">
                          Nós abrimos os detalhes do Pix no seu WhatsApp para você iniciar seu acesso imediato!
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleJoinVipSubmit} className="space-y-4">
                        <div className="text-center pb-2 border-b border-borda-sutil/50">
                          <span className="text-[10px] font-bold text-cinza-muted uppercase block">CLUBE VIP RECORRENTE</span>
                          <span className="text-3xl font-display text-dourado-retro">R$ {siteConfig.vipPrice}</span>
                          <span className="text-[9px] text-cinza-muted uppercase font-semibold block mt-0.5">Sem contratos ou carência</span>
                        </div>

                        <div>
                          <label className="text-[11px] font-sans font-bold text-cinza-muted block mb-1">Seu Nome Completo:</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Gabriel Souza"
                            value={vipName}
                            onChange={(e) => setVipName(e.target.value)}
                            className="w-full bg-navy-principal border border-borda-sutil focus:border-dourado-retro text-branco-texto text-xs py-2.5 px-3 rounded-md outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={vipSubmitting}
                          className="w-full bg-[#8B2523] hover:bg-[#C0392B] text-white py-3 rounded-[5px] font-sans font-bold text-xs uppercase tracking-widest transition-all"
                        >
                          {vipSubmitting ? 'AGUARDE...' : 'ADQUIRIR PLANO VIP NOW ✓'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* 7. SEGUNDA SEÇÃO DE PRODUTOS (Raridades Retrô) */}
          {jerseys.length > 0 && (
            <section id="colecao-retro" className="py-12 scroll-mt-24">
              <div className="max-w-7xl mx-auto px-4">
                
                <div className="mb-8 border-b border-borda-sutil pb-4">
                  <span className="text-[11px] font-mono font-normal uppercase tracking-[2px] text-[#C0392B] block mb-1">
                    COLEÇÃO HISTÓRICA RELEVANTE
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-normal text-[#D4A843] uppercase tracking-wide">
                    Lendas & Mantos Retrô
                  </h2>
                  <p className="text-xs text-cinza-muted mt-1">
                    Reviva as épocas de conquistas icônicas com camisas que marcaram época. Detalhes bordados de alto impacto.
                  </p>
                </div>

                {/* Grid de produtos retrô */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(showAllRetro ? listRetro : listRetro.slice(0, 3)).map((kit, index) => (
                    <KitCard key={kit.id} kit={kit} index={index} />
                  ))}
                </div>

                {/* Botão VER MAIS */}
                {listRetro.length > 3 && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setShowAllRetro(!showAllRetro)}
                      className="inline-flex items-center gap-2 border border-borda-sutil bg-transparent text-white px-7 py-3 rounded-[5px] font-sans font-bold text-xs uppercase tracking-widest transition-all hover:bg-vermelho-west hover:border-vermelho-west"
                    >
                      {showAllRetro ? 'MOSTRAR MENOS' : 'VER MAIS RETRÔS'}
                    </button>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* 8. FEED DO INSTAGRAM (Feed de Fotos carrossel/grid igual ao da Boneti) */}
          <section id="instagram-feed" className="py-12 bg-navy-secundario/30 border-t border-b border-borda-sutil select-none">
            <div className="max-w-7xl mx-auto px-4">
              
              <div className="text-center mb-8">
                <span className="text-[11px] font-mono font-normal uppercase tracking-[2px] text-[#C0392B] block mb-1">
                  SIGA NOSSO TIME NO DIGITAL
                </span>
                <h2 className="text-3xl font-display font-normal text-white uppercase tracking-wide">
                  @WEST_STORE_OFICIAL NO INSTAGRAM
                </h2>
                <p className="text-xs text-cinza-muted mt-1 max-w-md mx-auto">
                  Veja depoimentos de quem já vestiu o manto da West Store e garanta as novidades em tempo real!
                </p>
              </div>

              {/* Horizontally scrollable content feed */}
              <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar scroll-smooth justify-start">
                {instagramFeed.map((post) => (
                  <div 
                    key={post.id}
                    className="w-72 shrink-0 bg-navy-terciario rounded-[10px] border border-borda-sutil overflow-hidden hover:border-[#8B2523]/40 transition-colors group"
                  >
                    <div className="relative h-60 bg-slate-900 overflow-hidden">
                      <img src={post.image} className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white z-10 font-bold text-xs">
                        <span className="flex items-center gap-1"><Heart className="w-4 h-4 fill-white" /> {post.likes}</span>
                        <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {post.comments}</span>
                      </div>
                    </div>
                    <div className="p-3.5 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-[10px] tracking-wide text-vermelho-ativo font-semibold uppercase">
                        <Instagram className="w-3.5 h-3.5" />
                        <span>Manto de Cliente</span>
                      </div>
                      <p className="text-xs text-branco-texto leading-relaxed italic">
                        "{post.review}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <a 
                  href={`https://www.instagram.com/${siteConfig.instagramHandle}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#8B2523] hover:bg-[#C0392B] text-white px-7 py-3 rounded-[5px] font-sans font-bold text-xs uppercase tracking-widest transition-all"
                >
                  <Instagram className="w-4 h-4" /> SEGUIR NO PERFIL
                </a>
              </div>

            </div>
          </section>

          {/* 9. TERCEIRA SEÇÃO DE PRODUTOS (Mais um time ou Edições Especiais) */}
          {jerseys.length > 0 && (
            <section id="destaque-exclusivo" className="py-12 scroll-mt-24">
              <div className="max-w-7xl mx-auto px-4">
                
                <div className="mb-8 border-b border-borda-sutil pb-4">
                  <span className="text-[11px] font-mono font-normal uppercase tracking-[2px] text-[#C0392B] block mb-1">
                    COLEÇÕES ESPECIAIS & TERCEIRO MANTO
                  </span>
                  <h2 className="text-3xl sm:text-4xl font-display font-normal text-branco-texto uppercase tracking-wide">
                    Edições Especiais, Reservas & Thirds
                  </h2>
                  <p className="text-xs text-cinza-muted mt-1">
                    Mantos alternativos, edições comemorativas limitadas e jaquetas oficiais de alta performance.
                  </p>
                </div>

                {/* Grid of special items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(showAllExclusivas ? listExclusivas : listExclusivas.slice(0, 3)).map((kit, index) => (
                    <KitCard key={kit.id} kit={kit} index={index} />
                  ))}
                </div>

                {/* Botão VER MAIS */}
                {listExclusivas.length > 3 && (
                  <div className="mt-10 text-center">
                    <button
                      onClick={() => setShowAllExclusivas(!showAllExclusivas)}
                      className="inline-flex items-center gap-2 border border-borda-sutil bg-transparent text-white px-7 py-3 rounded-[5px] font-sans font-bold text-xs uppercase tracking-widest transition-all hover:bg-vermelho-west hover:border-vermelho-west"
                    >
                      {showAllExclusivas ? 'MOSTRAR MENOS' : 'VER MAIS EDIÇÕES'}
                    </button>
                  </div>
                )}

              </div>
            </section>
          )}

        </div>
      )}

      {/* 10. RODAPÉ */}
      <footer className="bg-navy-secundario border-t border-borda-sutil py-12 text-xs select-none">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-left items-start">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-vermelho-west rounded-full flex items-center justify-center">
                <span className="font-display font-bold text-white text-[10px]">WEST</span>
              </div>
              <span className="font-display font-bold text-lg text-branco-texto uppercase tracking-wide">West Store</span>
            </div>
            <p className="text-[11px] text-[#8FA3B1] leading-relaxed">
              O seu destino definitivo para mantos de futebol nacionais, importados e relíquias clássicas do torcedor raiz.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-zinc-400">Atendimento Humanizado Online</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-normal text-base text-white uppercase tracking-wider">MAPA DO SITE</h4>
            <div className="flex flex-col gap-2 text-[#8FA3B1]">
              <button onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection('destaques-nacionais'), 100); }} className="hover:text-white text-left cursor-pointer">Mantos Nacionais</button>
              <button onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection('colecao-retro'), 100); }} className="hover:text-white text-left cursor-pointer">Linha Retrô Clássica</button>
              <button onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection('destaque-exclusivo'), 100); }} className="hover:text-white text-left cursor-pointer">Edições Especiais</button>
              <button onClick={() => { setSearchQuery(''); setTimeout(() => scrollToSection('grupo-vip'), 100); }} className="hover:text-white text-left cursor-pointer">Clube VIP Dourado</button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-normal text-base text-white uppercase tracking-wider">CONTATOS OFICIAIS</h4>
            <div className="space-y-2 text-[#8FA3B1]">
              <p>📍 Envio direto do importador para todo o Brasil.</p>
              <p>💬 WhatsApp: <strong>{siteConfig.whatsappNumber}</strong></p>
              <p>📸 Insta: <a href={`https://www.instagram.com/${siteConfig.instagramHandle}`} className="hover:text-white">@{siteConfig.instagramHandle}</a></p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-normal text-base text-white uppercase tracking-wider">FALE CONOSCO EXCLUSIVO</h4>
            <div className="bg-navy-terciario p-4 rounded-[10px] border border-borda-sutil space-y-2">
              <p className="text-[10px] text-cinza-muted">Dúvidas sobre o tamanho ideal ou encomendas personalizadas?</p>
              <a
                href={`https://wa.me/${siteConfig.whatsappNumber}?text=Olá! Venho pelo site West Store e gostaria de tirar dúvidas sobre encomendas.`}
                target="_blank"
                rel="noreferrer"
                className="bg-[#8B2523] hover:bg-[#C0392B] text-white py-2 px-4 rounded-[5px] font-sans font-bold text-[10px] uppercase tracking-wider inline-flex items-center gap-1"
              >
                Atendimento Rápido 💬
              </a>
            </div>
          </div>

        </div>

        {/* Copy / Admin Gate / Layout credentials */}
        <div className="max-w-7xl mx-auto px-4 mt-10 pt-6 border-t border-borda-sutil flex flex-col sm:flex-row items-center justify-between gap-4 text-[#8FA3B1] text-[10px]">
          <div>
            <p>© 2026 West Store Oficial. Todos os direitos reservados.</p>
            <p className="text-[9px] text-[#8FA3B1]/40 mt-1">Desenvolvido sob rígido controle de excelência visual.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-[#8FA3B1] hover:text-white text-xs underline decoration-borda-sutil cursor-pointer"
            >
              Painel Administrativo
            </button>
          </div>
        </div>
      </footer>

      {/* DYNAMIC BACKEND LINK (ADMIN MODAL PORTAL) */}
      {isAdminOpen && (
        <AdminPanel 
          onNotifyChange={handleRefreshAdminData} 
          onClose={() => setIsAdminOpen(false)} 
        />
      )}

      {/* FLOATING WHATSAPP ASSISTANT BUTTON BALL */}
      <a
        href={`https://wa.me/${siteConfig.whatsappNumber}?text=Olá West Store! Gostaria de tirar dúvidas sobre os mantos.`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3.5 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 group flex items-center justify-center cursor-pointer"
        title="Falar no WhatsApp"
      >
        <span className="absolute inset-0 bg-[#25D366] rounded-full scale-100 animate-ping opacity-20 pointer-events-none" />
        <svg viewBox="0 0 448 512" className="w-6 h-6 fill-white relative z-10">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>
      </a>

    </div>
  );
}
