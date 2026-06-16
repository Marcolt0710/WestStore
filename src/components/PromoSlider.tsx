import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  ShoppingBag, 
  ArrowRight, 
  Percent, 
  Crown,
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  Award,
  Plus
} from 'lucide-react';
import JerseyVisual from './JerseyVisual';
import { TeamName } from '../types';

interface PromoSliderProps {
  onSelectCollection: (type: 'all' | 'retro' | 'national' | 'international') => void;
  onScrollToSection: (id: string) => void;
  onSelectTeam?: (team: 'Todos' | TeamName) => void;
  onSetSearchQuery?: (query: string) => void;
  isVipClient?: boolean;
}

interface SlideItem {
  id: number;
  image?: string;
  isCustomHtml?: boolean;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  ctaText: string;
  actionType: 'retro' | 'atacado' | 'vip';
}

export default function PromoSlider({ 
  onSelectCollection, 
  onScrollToSection,
  onSelectTeam,
  onSetSearchQuery
}: PromoSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Slides configuration (Slide 1 is custom HTML layout matching the uploaded image!)
  const slides: SlideItem[] = [
    {
      id: 1,
      isCustomHtml: true,
      badge: 'VISTA SUA PAIXÃO',
      badgeColor: 'bg-vermelho-west/10 text-vermelho-ativo border-vermelho-west/20',
      title: 'Mantos Titulares',
      subtitle: 'As camisas dos maiores times com a qualidade que você merece!',
      ctaText: 'CONFIRA OS LANÇAMENTOS',
      actionType: 'atacado'
    },
    {
      id: 2,
      image: '/src/assets/images/banner_retro_1781608004592.jpg',
      badge: 'Relíquias Históricas',
      badgeColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      title: 'Mantos Retrô Exclusivos',
      subtitle: 'Reviva as eras de ouro do futebol com camisetas históricas de acabamento bordado impecável e detalhes dourados.',
      ctaText: 'VER LINHA RETRÔ',
      actionType: 'retro'
    },
    {
      id: 3,
      image: '/src/assets/images/banner_fabric_1781608032337.jpg',
      badge: 'Clube Exclusivo',
      badgeColor: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20',
      title: 'Acesso VIP West Store',
      subtitle: 'Participe do nosso grupo privado por apenas R$ 7,50 para cupons exclusivos de atacado e mimos no canal oficial.',
      ctaText: 'SER MEMBRO VIP',
      actionType: 'vip'
    }
  ];

  // Team Selection Circles List (exact match to the mockup bottom row)
  const teamCircles = [
    { name: 'Flamengo', type: 'filter', team: 'Flamengo' as TeamName, colorClass: 'bg-gradient-to-br from-red-600 to-black text-white border-red-500/50', brandText: 'CRF' },
    { name: 'Palmeiras', type: 'search', searchQuery: 'Palmeiras', colorClass: 'bg-emerald-800 text-white border-emerald-500/50', brandText: 'P' },
    { name: 'Corinthians', type: 'filter', team: 'Corinthians' as TeamName, colorClass: 'bg-neutral-100 text-black border-neutral-300', brandText: 'CP' },
    { name: 'São Paulo FC', type: 'filter', team: 'São Paulo FC' as TeamName, colorClass: 'bg-gradient-to-r from-red-600 via-white to-neutral-900 text-white border-red-500/30', brandText: 'SPFC' },
    { name: 'Santos', type: 'search', searchQuery: 'Santos', colorClass: 'bg-white text-black border-neutral-400', brandText: 'S' },
    { name: 'Grêmio', type: 'search', searchQuery: 'Grêmio', colorClass: 'bg-sky-600 text-white border-sky-400/40', brandText: 'G' },
    { name: 'Internacional', type: 'search', searchQuery: 'Internacional', colorClass: 'bg-red-600 text-white border-red-400/50', brandText: 'I' },
    { name: 'Cruzeiro', type: 'search', searchQuery: 'Cruzeiro', colorClass: 'bg-blue-700 text-white border-blue-500/30', brandText: 'C' },
    { name: 'Atlético-MG', type: 'search', searchQuery: 'Atlético Mineiro', colorClass: 'bg-neutral-900 text-white border-white/20', brandText: 'CAM' },
    { name: 'Botafogo', type: 'search', searchQuery: 'Botafogo', colorClass: 'bg-black text-white border-white/30', brandText: '★' },
    { name: 'Vasco', type: 'search', searchQuery: 'Vasco', colorClass: 'bg-zinc-900 text-red-500 border-zinc-700', brandText: '✠' }
  ];

  const startAutoPlay = () => {
    stopAutoPlay();
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8500); // 8.5s for detailed visualization
  };

  const stopAutoPlay = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  useEffect(() => {
    if (!isHovered) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isHovered]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleCtaClick = (type: 'retro' | 'atacado' | 'vip') => {
    if (type === 'retro') {
      onSelectCollection('retro');
      onScrollToSection('catalogo-secao');
    } else if (type === 'atacado') {
      onSelectCollection('all');
      onScrollToSection('catalogo-secao');
    } else if (type === 'vip') {
      onScrollToSection('grupo-vip-secao');
    }
  };

  const handleCircleClick = (circle: typeof teamCircles[0]) => {
    if (circle.type === 'filter' && circle.team) {
      if (onSelectTeam) onSelectTeam(circle.team);
    } else if (circle.type === 'search' && circle.searchQuery) {
      if (onSetSearchQuery) onSetSearchQuery(circle.searchQuery);
    }
    onScrollToSection('catalogo-secao');
  };

  return (
    <div 
      id="complete-banner-wrapper" 
      className="relative w-full bg-[#05080f] text-branco-texto border-b border-borda-sutil select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      {/* MOCKUP TOP HEADER BAR (Shield / Diamond / Envio) */}
      <div className="bg-[#03060a] border-b border-borda-sutil/60 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 md:gap-16 text-[10px] md:text-[11px] font-sans font-bold tracking-wider text-cinza-muted mr-1.5 uppercase">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-vermelho-west" />
            <span className="text-branco-texto">PRODUTOS OFICIAIS</span>
            <span className="text-cinza-muted/60">E LICENCIADOS</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-vermelho-west/40" />
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-vermelho-west" />
            <span className="text-branco-texto">QUALIDADE</span>
            <span className="text-cinza-muted/60">PREMIUM</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-vermelho-west/40" />
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-vermelho-west" />
            <span className="text-branco-texto">ENVIO RÁPIDO</span>
            <span className="text-cinza-muted/60">PARA TODO BRASIL</span>
          </div>
        </div>
      </div>

      {/* CORE CAROUSEL SLIDE STAGE */}
      <div className="relative w-full h-[390px] sm:h-[480px] lg:h-[530px] overflow-hidden">
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.01 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="absolute inset-0 w-full h-full"
          >
            {/* RENDER CURRENT SLIDE */}
            {slides[currentSlide].isCustomHtml ? (
              
              /* HIGH-FIDELITY SLIDE: PIXEL-PERFECT CLONE FROM CUSTOMER PHOTO */
              <div className="absolute inset-0 w-full h-full bg-[#070c14] overflow-hidden">
                
                {/* Background stadium glows and geometric slash accents */}
                <div className="absolute top-[10%] right-[-10%] w-[680px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
                <div className="absolute top-[30%] left-[-10%] w-[450px] h-[450px] bg-red-800/5 rounded-full blur-[120px] pointer-events-none" />
                
                {/* Visual red brush streak accentuating behind jerseys */}
                <div className="absolute right-[5%] bottom-[12%] w-[50%] h-[30%] bg-gradient-to-r from-red-600/15 to-transparent skew-y-[-11deg] blur-2xl pointer-events-none hidden md:block" />

                {/* Content columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-full max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 items-center">
                  
                  {/* Left Column Text details */}
                  <div className="col-span-1 md:col-span-6 flex flex-col justify-center text-center md:text-left h-full space-y-4 sm:space-y-6 lg:space-y-8 z-10 relative">
                    
                    <div className="space-y-0.5">
                      <motion.h3 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="text-2xl sm:text-3xl lg:text-4xl font-display font-medium text-branco-texto tracking-wider uppercase leading-none drop-shadow-md"
                      >
                        VISTA SUA
                      </motion.h3>
                      
                      {/* Distressed massive visual "PAIXÃO" */}
                      <motion.h1 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25, type: 'spring' }}
                        className="text-6xl sm:text-8xl lg:text-9xl font-display font-black text-white italic tracking-tighter leading-none transform -skew-x-6 select-none inline-block relative pr-2"
                      >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-700 drop-shadow-[0_4px_12px_rgba(220,38,38,0.55)]">
                          PAIXÃO
                        </span>
                      </motion.h1>
                    </div>

                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="max-w-md mx-auto md:mx-0 text-sm sm:text-base lg:text-lg text-cinza-muted leading-relaxed"
                    >
                      As camisas dos maiores times com os mínimos detalhes e a <span className="text-white font-bold underline decoration-vermelho-west underline-offset-4">qualidade</span> que você merece!
                    </motion.p>

                    <motion.div 
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.45 }}
                      className="pt-2 self-center md:self-start"
                    >
                      <button
                        type="button"
                        onClick={() => handleCtaClick('atacado')}
                        className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-vermelho-west hover:bg-vermelho-ativo text-white font-sans font-bold text-xs uppercase tracking-widest rounded-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl hover:shadow-vermelho-west/40 shadow-lg shadow-vermelho-west/15 text-center active:translate-y-0 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>CONFIRA OS LANÇAMENTOS</span>
                        <ChevronRight className="w-4 h-4 ml-0.5" />
                      </button>
                    </motion.div>

                  </div>

                  {/* Right Column: Beautiful Layered Jerseys Stack mirroring customer mockup exactly */}
                  <div className="col-span-1 md:col-span-6 hidden md:flex items-center justify-center relative h-full">
                    <div className="relative w-full max-w-[380px] lg:max-w-[450px] h-[340px] md:h-[420px] lg:h-[460px] flex items-center justify-center">
                      
                      {/* Jersey 1: Botafogo (Behind Far Left) */}
                      <div className="absolute left-[3%] bottom-[12%] rotate-[-12deg] scale-[0.80] opacity-85 z-10 filter brightness-[0.85] transition-all duration-300 hover:scale-[0.86] hover:brightness-100 hover:z-40">
                        <JerseyVisual design={{
                          primaryColor: '#ffffff',
                          secondaryColor: '#171717',
                          pattern: 'vertical-stripes',
                          patternSecondaryColor: '#171717',
                          collarColor: '#171717',
                          sleeveColor: '#171717',
                          hasCrestText: 'SPFC', // Custom star representation
                          sponsorName: '',
                        }} size="md" />
                      </div>

                      {/* Jersey 3: Palmeiras (Behind Right) */}
                      <div className="absolute right-[12%] bottom-[10%] rotate-[7deg] scale-[0.89] opacity-90 z-20 transition-all duration-300 hover:scale-[0.95] hover:brightness-[1.05] hover:z-40">
                        <JerseyVisual design={{
                          primaryColor: '#064e43',
                          secondaryColor: '#063e35',
                          pattern: 'solid',
                          collarColor: '#ffffff',
                          sleeveColor: '#064e43',
                          hasCrestText: 'CRF',
                          sponsorName: 'refisa',
                          sponsorColor: '#ffffff'
                        }} size="md" />
                      </div>

                      {/* Jersey 4: Corinthians (Behind Far Right) */}
                      <div className="absolute right-[-4%] bottom-[8%] rotate-[14deg] scale-[0.79] opacity-80 z-10 filter brightness-[0.9] transition-all duration-300 hover:scale-[0.84] hover:brightness-100 hover:z-40">
                        <JerseyVisual design={{
                          primaryColor: '#ffffff',
                          secondaryColor: '#ffffff',
                          pattern: 'solid',
                          collarColor: '#111111',
                          sleeveColor: '#ffffff',
                          hasCrestText: 'CP',
                          sponsorName: ''
                        }} size="md" />
                      </div>

                      {/* Jersey 2: Flamengo (Main Front Center-Left) */}
                      <div className="absolute left-[15%] bottom-[5%] rotate-[-3deg] scale-[1.07] z-30 drop-shadow-[0_25px_35px_rgba(0,0,0,0.7)] transition-all duration-300 hover:scale-[1.12] hover:rotate-[0deg] hover:z-40">
                        <JerseyVisual design={{
                          primaryColor: '#111111',
                          secondaryColor: '#dc2626',
                          pattern: 'horizontal-stripes',
                          patternSecondaryColor: '#dc2626',
                          collarColor: '#111111',
                          sleeveColor: '#111111',
                          hasCrestText: 'CRF',
                          sponsorName: '',
                        }} size="md" />
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            ) : (
              
              /* STANDARD PROMOTIONAL MULTI-SLIDES (Fade/Scale visuals) */
              <div className="absolute inset-0 w-full h-full">
                
                {/* Image Background */}
                <div className="absolute inset-0 w-full h-full">
                  {slides[currentSlide].image && (
                    <img
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center opacity-65 transform scale-100 hover:scale-[1.01] transition-transform duration-[6000ms]"
                    />
                  )}
                  {/* Cinematic darkening shading overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#05080f] via-[#05080f]/50 to-[#030509]/75" />
                  <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#05080f]/80 to-transparent hidden md:block" />
                  <div className="absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-[#05080f]/80 to-transparent hidden md:block" />
                </div>

                {/* Text overlay contents */}
                <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 lg:p-12">
                  <div className="max-w-4xl w-full text-center space-y-4 sm:space-y-6 z-10">
                    
                    {/* Badge */}
                    <div className="inline-flex justify-center">
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold tracking-wider uppercase border shadow-md ${slides[currentSlide].badgeColor}`}>
                        {currentSlide === 1 ? <Percent className="w-3.5 h-3.5 text-amber-400" /> : <Crown className="w-3.5 h-3.5 text-yellow-500 animate-bounce" />}
                        {slides[currentSlide].badge}
                      </span>
                    </div>

                    {/* Slide main header */}
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-medium text-branco-texto tracking-tight uppercase leading-none drop-shadow-2xl">
                      {slides[currentSlide].title}
                    </h2>

                    {/* Description text */}
                    <p className="max-w-2xl mx-auto text-xs sm:text-sm lg:text-base text-cinza-muted leading-relaxed drop-shadow-md">
                      {slides[currentSlide].subtitle}
                    </p>

                    {/* Slide Click Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => handleCtaClick(slides[currentSlide].actionType)}
                        className="inline-flex items-center gap-2 px-6 py-3 sm:px-8 sm:py-3.5 bg-vermelho-west hover:bg-vermelho-ativo text-white font-sans font-bold text-xs uppercase tracking-widest rounded-md transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg shadow-vermelho-west/20 hover:shadow-vermelho-west/40 cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>{slides[currentSlide].ctaText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>

              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Slide navigation controls */}
        <button
          onClick={handlePrev}
          type="button"
          className="absolute left-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full border border-white/5 bg-navy-principal/40 hover:bg-vermelho-west text-white hover:border-vermelho-west transition-all duration-200 backdrop-blur-sm opacity-50 hover:opacity-100 cursor-pointer z-35"
          title="Slide Anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={handleNext}
          type="button"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 rounded-full border border-white/5 bg-navy-principal/40 hover:bg-vermelho-west text-white hover:border-vermelho-west transition-all duration-200 backdrop-blur-sm opacity-50 hover:opacity-100 cursor-pointer z-35"
          title="Próximo Slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Carousel indicators dots */}
        <div className="absolute bottom-5 inset-x-0 flex justify-center gap-2.5 z-35">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                currentSlide === idx ? 'w-8 bg-vermelho-west' : 'w-2.5 bg-white/20 hover:bg-white/45'
              }`}
              title={`Ir para slide ${idx + 1}`}
            />
          ))}
        </div>

      </div>

      {/* MOCKUP 4 SECURITY/SERVICE VALUE CARDS ROW */}
      <div className="bg-[#03060a] border-t border-b border-borda-sutil/70 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center md:text-left">
          
          {/* Card 1 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 bg-[#070c14] border border-borda-sutil/40 p-4 rounded-lg transform shadow-sm hover:border-vermelho-west/30 transition-all duration-200">
            <div className="p-2 sm:p-2.5 bg-red-600/10 rounded text-vermelho-west shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-cinza-muted font-bold block uppercase tracking-wider">PARCELE EM ATÉ</span>
              <h4 className="text-sm font-sans font-black text-white uppercase tracking-tight leading-none">12x SEM JUROS</h4>
              <p className="text-[10px] text-cinza-muted/80 ml-0.5">Facilidades sem tarifa</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 bg-[#070c14] border border-borda-sutil/40 p-4 rounded-lg transform shadow-sm hover:border-vermelho-west/30 transition-all duration-200">
            <div className="p-2 sm:p-2.5 bg-red-600/10 rounded text-vermelho-west shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-cinza-muted font-bold block uppercase tracking-wider">COMPRA 100%</span>
              <h4 className="text-sm font-sans font-black text-white uppercase tracking-tight leading-none">SEGURA & ENCRIP</h4>
              <p className="text-[10px] text-cinza-muted/80 ml-0.5">Proteção avançada de dados</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 bg-[#070c14] border border-borda-sutil/40 p-4 rounded-lg transform shadow-sm hover:border-vermelho-west/30 transition-all duration-200">
            <div className="p-2 sm:p-2.5 bg-red-600/10 rounded text-vermelho-west shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-cinza-muted font-bold block uppercase tracking-wider">GARANTIA DE</span>
              <h4 className="text-sm font-sans font-black text-white uppercase tracking-tight leading-none">QUALIDADE PREMIUM</h4>
              <p className="text-[10px] text-cinza-muted/80 ml-0.5">Ou seu dinheiro de volta</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-3 bg-[#070c14] border border-borda-sutil/40 p-4 rounded-lg transform shadow-sm hover:border-vermelho-west/30 transition-all duration-200">
            <div className="p-2 sm:p-2.5 bg-red-600/10 rounded text-vermelho-west shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <span className="text-[10px] text-cinza-muted font-bold block uppercase tracking-wider">TROCA FÁCIL</span>
              <h4 className="text-sm font-sans font-black text-white uppercase tracking-tight leading-none">E 100% GRÁTIS</h4>
              <p className="text-[10px] text-cinza-muted/80 ml-0.5">Até 7 dias após o recebimento</p>
            </div>
          </div>

        </div>
      </div>

      {/* MOCKUP TEAM SELECTION CIRCLES ROW ("ENCONTRE A CAMISA DO SEU TIME!") */}
      <div className="bg-[#05090f] border-b border-borda-sutil/80 py-4.5 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          
          {/* Label Title Left */}
          <div className="flex flex-row items-center gap-2 select-none md:shrink-0 text-center md:text-left">
            <span className="text-[11px] font-sans font-black text-[#E51E2B] uppercase tracking-widest">
              ENCONTRE A CAMISA
            </span>
            <span className="text-[11px] font-display font-bold text-branco-texto uppercase tracking-wide">
              DO SEU TIME!
            </span>
          </div>

          {/* Horizontally scrollable team lists with circular badges */}
          <div className="w-full overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-4 px-1 py-1.5 justify-start md:justify-end">
            {teamCircles.map((circle) => (
              <button
                key={circle.name}
                type="button"
                onClick={() => handleCircleClick(circle)}
                className="group flex flex-col items-center gap-1.5 focus:outline-none focus:ring-1 focus:ring-vermelho-west/50 rounded-lg shrink-0 cursor-pointer"
                title={`Ver camisas do ${circle.name}`}
              >
                {/* Visual circle mimicry matches high quality badge mockups */}
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-display font-black text-[10px] tracking-tighter uppercase shadow-md transition-all duration-300 transform group-hover:scale-[1.14] group-hover:shadow-lg border ${circle.colorClass}`}>
                  {circle.brandText}
                </div>
                <span className="text-[9px] font-sans font-bold text-cinza-muted group-hover:text-branco-texto transition-colors text-center max-w-[55px] truncate">
                  {circle.name}
                </span>
              </button>
            ))}

            {/* Plus icon ending - matches mockup "+ E MUITO MAIS!" */}
            <button
              type="button"
              onClick={() => {
                if (onSetSearchQuery) onSetSearchQuery('');
                onScrollToSection('catalogo-secao');
              }}
              className="group flex flex-col items-center gap-1.5 focus:outline-none shrink-0 cursor-pointer"
              title="Mostrar todos"
            >
              <div className="w-11 h-11 rounded-full bg-navy-secundario border border-vermelho-west/40 flex items-center justify-center text-vermelho-west text-sm font-bold shadow-md transition-all duration-300 transform group-hover:scale-[1.12] group-hover:bg-[#E51E2B] group-hover:text-white">
                +
              </div>
              <span className="text-[9px] font-sans font-black text-vermelho-west group-hover:text-white transition-colors text-center whitespace-nowrap">
                E MAIS!
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Bottom subtle banner branding tag as requested by customer photo */}
      <div className="text-[10px] font-sans font-bold text-center text-cinza-muted/40 tracking-widest uppercase py-1.5 border-t border-borda-sutil/10 select-none bg-[#030509]">
        🛡️ <span className="text-white">WEST STORE</span> | A LOJA DO <span className="text-red-500">TORCEDOR RAIZ!</span>
      </div>

    </div>
  );
}
