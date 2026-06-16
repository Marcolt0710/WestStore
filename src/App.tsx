import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { TeamName } from './types';
import KitCard from './components/KitCard';
import VipSection from './components/VipSection';
import AdminPanel from './components/AdminPanel';
import PromoSlider from './components/PromoSlider';
import { loadSiteConfig, loadJerseyCatalog } from './config';
import { 
  Search, 
  Truck, 
  ShieldCheck, 
  Sparkles, 
  Instagram,
  Heart,
  Sun,
  Moon
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

  // Fetch from global backend on mount to ensure real-time synchronization
  const fetchGlobalData = async () => {
    try {
      const configRes = await fetch('/api/site-config');
      if (configRes.ok) {
        const configData = await configRes.json();
        setSiteConfig(configData);
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

  // Filtering states
  const [selectedTeam, setSelectedTeam] = useState<'Todos' | TeamName>('Todos');
  const [selectedType, setSelectedType] = useState<'Todos' | 'Normal' | 'Retrô'>('Todos');

  // Compute filtered jerseys catalog
  const filteredJerseys = useMemo(() => {
    return jerseys.filter((jersey) => {
      // Search matching
      const matchesSearch = 
        jersey.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        jersey.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (jersey.sponsor && jersey.sponsor.toLowerCase().includes(searchQuery.toLowerCase()));

      // Team filter matching
      const matchesTeam = selectedTeam === 'Todos' || jersey.team === selectedTeam;

      // Type filter matching
      const matchesType = 
        selectedType === 'Todos' || 
        (selectedType === 'Retrô' && jersey.isRetro) || 
        (selectedType === 'Normal' && !jersey.isRetro);

      return matchesSearch && matchesTeam && matchesType;
    });
  }, [jerseys, searchQuery, selectedTeam, selectedType]);

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-navy-principal min-h-screen text-branco-texto flex flex-col selection:bg-vermelho-west selection:text-white">
      
      {/* 1. TOP HEADER NAVIGATION */}
      <header className="sticky top-0 z-40 bg-navy-principal/95 backdrop-blur-md border-b border-borda-sutil">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* LOGO */}
          <div className="flex items-center gap-3 select-none">
            {/* Logo triangular wrapper (as requested in Logo variations alternative) */}
            <div className="w-10 h-10 bg-vermelho-west rounded-full flex items-center justify-center relative shadow-md shadow-vermelho-west/15">
              <span className="font-display font-bold text-white text-[12px] tracking-widest relative z-10 leading-none">
                WEST
              </span>
              {/* Triangular reverse details under mask */}
              <div className="absolute inset-0 border border-white/10 rounded-full scale-102 pointer-events-none" />
            </div>
            
            {/* Name next to logo */}
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg text-branco-texto leading-none tracking-wide uppercase">
                West Store
              </span>
              <span className="text-[9px] font-sans font-semibold text-cinza-muted tracking-wider uppercase">
                Varejo e Atacado
              </span>
            </div>
          </div>

          {/* Quick desktop links */}
          <nav className="hidden md:flex items-center gap-6 text-xs uppercase font-sans font-semibold tracking-wider text-cinza-muted">
            <button 
              type="button" 
              onClick={() => scrollToSection('catalogo-secao')}
              className="hover:text-vermelho-ativo transition-colors"
            >
              Camisas Disponíveis
            </button>
            <button 
              type="button" 
              onClick={() => scrollToSection('grupo-vip-secao')}
              className="hover:text-dourado-retro transition-colors flex items-center gap-1"
            >
              Grupo VIP ⭐
            </button>
            <button 
              type="button" 
              onClick={() => scrollToSection('envio-secao')}
              className="hover:text-vermelho-ativo transition-colors"
            >
              Regras e Envio
            </button>
          </nav>

          {/* Header Action panel */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              id="theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              className="p-2 text-cinza-muted hover:text-branco-texto hover:bg-navy-secundario rounded-lg border border-borda-sutil transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title={theme === 'dark' ? 'Alternar para Tema Claro' : 'Alternar para Tema Escuro'}
              aria-label="Alternar tema"
            >
              <motion.div
                animate={{ rotate: themeRotation }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </motion.div>
              <span className="hidden sm:inline text-[11px] font-sans font-bold uppercase tracking-wider">
                {theme === 'dark' ? 'Claro' : 'Escuro'}
              </span>
            </button>

            {/* Instagram shortcut */}
            <a
              id="header-instagram-link"
              href={`https://www.instagram.com/${siteConfig.instagramHandle}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-cinza-muted hover:text-branco-texto hover:bg-navy-secundario rounded-lg border border-borda-sutil transition-all flex items-center justify-center gap-1.5"
              aria-label="Acessar Instagram"
            >
              <Instagram className="w-4 h-4 text-pink-500" />
              <span className="hidden lg:inline text-[11px] font-bold uppercase tracking-wider">@{siteConfig.instagramHandle}</span>
            </a>
          </div>

        </div>
      </header>

      {/* DYNAMIC AUTO-RUN PROMOTIONAL SLIDER BANNER */}
      <PromoSlider 
        onSelectCollection={(type) => {
          if (type === 'retro') {
            setSelectedType('Retrô');
            setSelectedTeam('Todos');
          } else if (type === 'all') {
            setSelectedType('Todos');
            setSelectedTeam('Todos');
          }
        }}
        onScrollToSection={scrollToSection}
        onSelectTeam={(team) => {
          setSelectedTeam(team);
          setSearchQuery('');
        }}
        onSetSearchQuery={(query) => {
          setSelectedTeam('Todos');
          setSearchQuery(query);
        }}
      />

      {/* 2. HERO PRESENTATION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-secundario/80 to-navy-principal py-14 sm:py-20 border-b border-borda-sutil">
        
        {/* Background ambient lighting */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-vermelho-west/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-dourado-retro/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
          
          {/* Eyebrow Label before Hero title */}
          <span className="text-[11px] font-mono font-bold text-vermelho-ativo uppercase tracking-[3px] block mb-3">
            {siteConfig.heroEyebrow}
          </span>

          {/* Hero H1 */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-display font-bold text-branco-texto uppercase tracking-tight leading-none mb-6">
            {siteConfig.heroTitle1} <br />
            <span className="text-vermelho-ativo">{siteConfig.heroTitleAccent}</span>
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-cinza-muted leading-relaxed mb-8">
            {siteConfig.heroSubtitle}
          </p>

          {/* CTA actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              id="cta-buy-now"
              type="button"
              onClick={() => scrollToSection('catalogo-secao')}
              className="w-full sm:w-auto bg-vermelho-west hover:bg-vermelho-ativo text-branco-texto font-sans font-bold text-xs uppercase tracking-widest py-4 px-8 rounded-md transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-vermelho-west/20"
            >
              Explorar Catálogo
            </button>
            <button
              id="cta-join-vip-shortcut"
              type="button"
              onClick={() => scrollToSection('grupo-vip-secao')}
              className="w-full sm:w-auto bg-transparent hover:bg-navy-terciario border border-borda-sutil hover:border-dourado-retro text-branco-texto hover:text-dourado-retro font-sans font-semibold text-xs py-4 px-8 rounded-md uppercase tracking-wider transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Conhecer Plano VIP
            </button>
          </div>

          {/* Highlights Features Ribbon */}
          <div className="mt-14 max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-borda-sutil/60">
            <div className="flex items-center gap-3.5 justify-center sm:justify-start">
              <div className="p-3 bg-navy-secundario rounded-lg border border-borda-sutil">
                <Truck className="w-5 h-5 text-vermelho-ativo" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-display font-bold text-branco-texto uppercase tracking-wider leading-none">Frete Grátis Brasil</h4>
                <span className="text-[11px] text-cinza-muted">Entrega segura em até 30 dias</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 justify-center sm:justify-start">
              <div className="p-3 bg-navy-secundario rounded-lg border border-borda-sutil">
                <ShieldCheck className="w-5 h-5 text-vermelho-ativo" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-display font-bold text-branco-texto uppercase tracking-wider leading-none">Compra Protegida</h4>
                <span className="text-[11px] text-cinza-muted">Pedidos finalizados via WhatsApp</span>
              </div>
            </div>

            <div className="flex items-center gap-3.5 justify-center sm:justify-start">
              <div className="p-3 bg-navy-secundario rounded-lg border border-borda-sutil">
                <Sparkles className="w-5 h-5 text-dourado-retro" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-display font-bold text-branco-texto uppercase tracking-wider leading-none">Seja Membro VIP</h4>
                <span className="text-[11px] text-cinza-muted">Sorteios e trocas facilitadas</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. CORE PRODUCT CATALOG & FILTERING */}
      <main id="catalogo-secao" className="py-12 bg-navy-principal flex-1">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Eyebrow Label before Category header */}
          <span className="text-[11px] font-mono font-bold text-vermelho-ativo uppercase tracking-widest block mb-1.5">
            CONHEÇA NOSSOS MODELOS
          </span>

          {/* Section title */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-branco-texto tracking-wide uppercase">
                CAMISETAS DISPONÍVEIS
              </h2>
              <p className="text-xs text-cinza-muted mt-1 max-w-lg">
                Utilize os filtros abaixo para escolher sua equipe nacional e os modelos oficiais da sua escolha. Atacado ativado ao levar 4 ou mais peças!
              </p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full max-w-xs">
              <input
                id="catalog-search-input"
                type="text"
                placeholder="Buscar camisa, ano, patrocinador..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-navy-secundario border border-borda-sutil focus:border-vermelho-west text-branco-texto text-xs p-3 pl-9 rounded-lg outline-none transition-colors"
              />
              <Search className="w-4 h-4 text-cinza-muted absolute left-3 top-3.5" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-3.5 text-xs text-cinza-muted hover:text-branco-texto"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar Grid */}
          <div className="bg-navy-secundario p-4 rounded-xl border border-borda-sutil mb-8 space-y-4">
            
            {/* 1st row: Team select */}
            <div>
              <span className="text-[10px] font-sans font-bold text-cinza-muted uppercase tracking-wider block mb-2">Filtrar por Equipe:</span>
              <div className="flex flex-wrap gap-2">
                {(['Todos', 'São Paulo FC', 'Flamengo', 'Corinthians'] as const).map((team) => (
                  <button
                    key={team}
                    id={`team-filter-${team.replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => setSelectedTeam(team)}
                    className={`px-4 py-2 rounded-md text-xs font-sans font-semibold border transition-all ${
                      selectedTeam === team
                        ? 'bg-vermelho-west border-vermelho-west text-white font-bold'
                        : 'bg-navy-principal border-borda-sutil text-cinza-muted hover:border-cinza-muted hover:text-branco-texto'
                    }`}
                  >
                    {team}
                  </button>
                ))}
              </div>
            </div>

            {/* 2nd row: Kit Categories Model (Standard / Retro) */}
            <div>
              <span className="text-[10px] font-sans font-bold text-cinza-muted uppercase tracking-wider block mb-2">Categoria de Kit:</span>
              <div className="flex flex-wrap gap-2">
                {(['Todos', 'Normal', 'Retrô'] as const).map((type) => (
                  <button
                    key={type}
                    id={`type-filter-${type}`}
                    type="button"
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-md text-xs font-sans font-semibold border transition-all ${
                      selectedType === type
                        ? 'bg-vermelho-west border-vermelho-west text-white font-bold'
                        : 'bg-navy-principal border-borda-sutil text-cinza-muted hover:border-cinza-muted hover:text-branco-texto'
                    }`}
                  >
                    {type === 'Retrô' ? 'Lendas Retrô 👑' : type === 'Normal' ? 'Temporada Regular' : 'Todos os Modelos'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Catalog grid */}
          {filteredJerseys.length === 0 ? (
            <div className="bg-navy-secundario p-12 text-center rounded-xl border border-borda-sutil">
              <span className="text-3xl block mb-2">🔍</span>
              <h3 className="text-lg font-display text-branco-texto mb-1">Nenhuma camisa encontrada</h3>
              <p className="text-xs text-cinza-muted">
                Não localizamos resultados para "{searchQuery}". Tente pesquisar por outros termos ou redefinir os filtros de times.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTeam('Todos');
                  setSelectedType('Todos');
                }}
                className="mt-4 bg-navy-principal hover:bg-navy-terciario border border-borda-sutil text-xs font-sans font-bold uppercase tracking-wider py-2 px-4 rounded text-branco-texto transition-colors"
              >
                Limpar Todos os Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJerseys.map((jersey, index) => (
                <KitCard
                  key={`${jersey.id}-${selectedTeam}-${selectedType}`}
                  kit={jersey}
                  index={index}
                />
              ))}
            </div>
          )}

        </div>
      </main>

      {/* 4. PREMIUM VIP MEMBERSHIP SECTION */}
      <VipSection />

      {/* 5. RULES, SHIPPING & DISCLOSURES FAQ */}
      <section id="envio-secao" className="py-12 bg-navy-secundario/40 border-t border-b border-borda-sutil">
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Eyebrow label */}
          <span className="text-[11px] font-mono font-bold text-vermelho-ativo uppercase tracking-widest block mb-1.5 text-center">
            REGRAS DE CONVÍVIO E PROCEDIMENTOS
          </span>

          <h2 className="text-3xl font-display font-medium text-branco-texto text-center tracking-wide uppercase mb-8">
            TRANSPARÊNCIA WEST STORE
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Delivery Policy */}
            <div className="bg-navy-principal/40 p-5 rounded-lg border border-borda-sutil">
              <h3 className="text-base font-display font-semibold text-branco-texto tracking-wider uppercase flex items-center gap-2 mb-2">
                <span>📦</span> ENVIOS E PRAZOS DE ENTRREGA
              </h3>
              <p className="text-xs text-cinza-muted leading-relaxed">
                Nós enviamos nossas camisetas para <strong>todo o território nacional (Brasil)</strong>. Devido à importação direta de fabricantes parceiros internacionais para garantir o acabamento premium e todos os selos oficiais, o prazo padrão de entrega é de até <strong>30 dias corridos</strong> após a postagem. O código de rastreamento é fornecido em até 5 dias úteis no seu WhatsApp.
              </p>
            </div>

            {/* Box 2: Wholesale Promotion Rules */}
            <div className="bg-navy-principal/40 p-5 rounded-lg border border-borda-sutil">
              <h3 className="text-base font-display font-semibold text-branco-texto tracking-wider uppercase flex items-center gap-2 mb-2">
                <span>💰</span> VAREJO VS ATACADO (REGRAS)
              </h3>
              <p className="text-xs text-cinza-muted leading-relaxed">
                Nossos preços são extremamente transparentes:
              </p>
              <ul className="text-xs text-cinza-muted list-disc ml-4 mt-2 space-y-1 leading-relaxed">
                <li><strong>Preço Varejo:</strong> R$ 129,90 por peça regular, R$ 159,90 por retrô.</li>
                <li><strong>Preço Atacado (Revendedor):</strong> R$ 119,90 regular e R$ 149,90 retrô.</li>
                <li><strong className="text-dourado-retro">Regra Especial:</strong> O desconto de atacado é aplicado <strong>automaticamente no carrinho</strong> para compras a partir de <strong>4 camisetas</strong>! Compre para a família ou para revender e garanta a economia.</li>
              </ul>
            </div>

            {/* Box 3: Quality Guarantee */}
            <div className="bg-navy-principal/40 p-5 rounded-lg border border-borda-sutil">
              <h3 className="text-base font-display font-semibold text-branco-texto tracking-wider uppercase flex items-center gap-2 mb-2">
                <span>🛡️</span> QUALIDADE SENSACIONAL E REGRAS DE CUIDADO
              </h3>
              <p className="text-xs text-cinza-muted leading-relaxed">
                Trabalhamos estritamente com camisas padrão tailandesa 1:1, apresentando as mesmas costuras, tecidos antissuor e logos bordados de alta definição. Para preservar seus mantos: lave sempre do avesso, evite passar ferro diretamente sobre patrocinadores/números e seque somente à sombra.
              </p>
            </div>

            {/* Box 4: WhatsApp Ordering steps */}
            <div className="bg-navy-principal/40 p-5 rounded-lg border border-borda-sutil">
              <h3 className="text-base font-display font-semibold text-branco-texto tracking-wider uppercase flex items-center gap-2 mb-2">
                <span>📱</span> PASSO A PASSO DA COMPRA-FÁCIL
              </h3>
              <p className="text-xs text-cinza-muted leading-relaxed">
                1. Navegue pelo catálogo e escolha a camisa dos seus sonhos.
                <br />
                2. Selecione o tamanho desejado (P, M, G, GG) e a quantidade ideal para você.
                <br />
                3. O desconto de atacado é ativado automaticamente a partir de 4 peças.
                <br />
                4. Clique em "Fale Conosco" para iniciar a conversa já com seu pedido formatado de forma direta, simples e humanizada no WhatsApp oficial do atendente.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. COMPREHENSIVE BRAND FOOTER */}
      <footer className="bg-navy-principal border-t border-borda-sutil py-12 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-left items-start">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-vermelho-west rounded-full flex items-center justify-center">
                <span className="font-display font-bold text-white text-[10px]">WEST</span>
              </div>
              <span className="font-display font-bold text-base text-branco-texto uppercase tracking-wide">West Store</span>
            </div>
            <p className="text-[11px] text-cinza-muted leading-relaxed max-w-xs">
              A maior e mais confiável loja virtual de camisas de futebol tailandesas premium. Coleções exclusivas, suporte focado e frete grátis nacional.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-display font-semibold text-branco-texto text-xs uppercase tracking-widest">Canais de Contato</h4>
            <div className="space-y-1.5 text-cinza-muted text-[11px]">
              <p>📍 Atendimento Online para todo o Brasil</p>
              <p>💬 WhatsApp Oficial: <strong>{siteConfig.whatsappNumber}</strong></p>
              <p>📸 Instagram: <strong>@{siteConfig.instagramHandle}</strong></p>
              <p>🕒 Segunda a Sábado: 09:00 às 19:00</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-branco-texto text-xs uppercase tracking-widest">Sua Opinião Importa</h4>
            <div className="bg-navy-secundario p-3 rounded border border-borda-sutil text-[11px]">
              <p className="text-cinza-muted">Dúvidas sobre tamanhos ou encomendas especiais fora do catálogo? Fale diretamente:</p>
              <a
                id="footer-direct-wa"
                href={`https://wa.me/${siteConfig.whatsappNumber}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-white bg-vermelho-west hover:bg-vermelho-ativo px-3 py-1.5 rounded font-semibold text-[10px] uppercase tracking-wide transition-colors"
              >
                Conversar Conosco 💬
              </a>
            </div>
          </div>

        </div>

        {/* Legal Disclaimer / Rights */}
        <div className="max-w-7xl mx-auto px-4 mt-8 pt-8 border-t border-borda-sutil/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-cinza-muted text-[10px]">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <p>© 2026 West Store Oficial. Todos os direitos reservados.</p>
            <span className="hidden sm:inline">•</span>
            <button
              onClick={() => setIsAdminOpen(true)}
              className="text-cinza-muted hover:text-white hover:text-vermelho-ativo transition-all cursor-pointer flex items-center gap-1 py-1"
            >
              Painel Administrativo
            </button>
          </div>
          <p className="flex items-center gap-1">
            Desenvolvido com excelência para amantes do futebol.
          </p>
        </div>
      </footer>

      {/* 7. DYNAMIC PORTALS (ADMIN MODAL SHIELD) */}
      {isAdminOpen && (
        <AdminPanel 
          onNotifyChange={handleRefreshAdminData} 
          onClose={() => setIsAdminOpen(false)} 
        />
      )}

      {/* 8. FLOATING WHATSAPP BUTTON (Mandatory on all screens) */}
      <a
        id="floating-whatsapp-ball"
        href={`https://wa.me/${siteConfig.whatsappNumber}`}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 bg-[#25D366] hover:bg-[#20ba59] hover:scale-110 active:scale-95 text-white p-3.5 rounded-full shadow-2xl transition-all flex items-center justify-center group"
        title="Falar no WhatsApp da West Store"
      >
        {/* Animated Ripple Effect */}
        <span className="absolute inset-0 bg-[#25D366] rounded-full scale-100 animate-ping opacity-25 group-hover:scale-110" />
        
        {/* SVG WhatsApp Logo Icon */}
        <svg
          viewBox="0 0 448 512"
          width="24"
          height="24"
          fill="currentColor"
          className="relative z-10"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
        </svg>

        {/* Small tooltip text popped on hover */}
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 font-display text-xs font-bold uppercase tracking-wider relative z-10 transition-all duration-300 whitespace-nowrap">
          Chamar no Whats!
        </span>
      </a>

    </div>
  );
}
