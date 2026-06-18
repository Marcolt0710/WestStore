import React, { useState, useEffect } from 'react';
import { JerseyKit, CartItem } from '../types';
import JerseyVisual from './JerseyVisual';
import { loadSiteConfig } from '../config';
import { Star, Shield, HelpCircle, FileText, CheckCircle, Clock } from 'lucide-react';

interface KitCardProps {
  key?: string;
  kit: JerseyKit;
  index?: number;
}

export default function KitCard({ kit, index = 0 }: KitCardProps) {
  const [selectedSize, setSelectedSize] = useState<'P' | 'M' | 'G' | 'GG'>(() => {
    const sizes = ['P', 'M', 'G', 'GG'] as const;
    return sizes.find(s => (kit.stock ? kit.stock[s] : 10) > 0) || 'G';
  });
  const [quantity, setQuantity] = useState(1);
  const [customName, setCustomName] = useState('');
  const [customNumber, setCustomNumber] = useState('');
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showSizeTable, setShowSizeTable] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscountPercent, setCouponDiscountPercent] = useState<number>(0);
  const [couponTypeUsed, setCouponTypeUsed] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<string>('');

  // Urgency Timer for Flash Deals
  const [timeLeft, setTimeLeft] = useState({
    hours: '02',
    minutes: '15',
    seconds: '34'
  });

  useEffect(() => {
    // Generate static but ticking dynamic countdown that runs continuously
    const interval = setInterval(() => {
      const now = new Date();
      // Target midnight tonight
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);
      
      setTimeLeft({
        hours: hours.toString().padStart(2, '0'),
        minutes: mins.toString().padStart(2, '0'),
        seconds: secs.toString().padStart(2, '0')
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const siteConfig = loadSiteConfig();

  // Price Calculation Logic
  const hasPromo = !!kit.promoPrice;
  const priceVarejo = hasPromo ? kit.promoPrice! : (kit.priceRetail || (kit.isRetro ? 159.90 : 129.90));
  const priceAtacado = kit.priceWholesale || (kit.isRetro ? 149.90 : 119.90);

  // Track page view event on detail expansion
  const handleInteraction = async () => {
    try {
      await fetch(`/api/catalog/view/${kit.id}`, { method: 'POST' });
    } catch (e) {
      console.warn("View tracking failed:", e);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch('/api/coupons');
      if (res.ok) {
        const coupons = await res.json();
        const found = coupons.find((c: any) => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.status === 'Ativo');
        if (found) {
          // Check limits and validity
          if (found.limitUsage && found.usedCount >= found.limitUsage) {
            setCouponFeedback('❌ Cupom esgotado!');
            setCouponDiscountPercent(0);
            return;
          }
          if (found.validity) {
            const expDate = new Date(found.validity);
            if (new Date() > expDate) {
              setCouponFeedback('❌ Cupom expirado!');
              setCouponDiscountPercent(0);
              return;
            }
          }
          
          let pct = 0;
          if (found.discount.includes('%')) {
            pct = parseInt(found.discount.replace('%', ''), 10);
          } else {
            // Flat cash discount, converted loosely to 10% representation
            pct = 12;
          }
          setCouponDiscountPercent(pct);
          setCouponTypeUsed(found.type);
          setCouponFeedback(`✅ Cupom aplicado: ${found.discount} de desconto! (${found.type})`);
        } else {
          setCouponFeedback('❌ Cupom inválido ou inativo');
          setCouponDiscountPercent(0);
        }
      }
    } catch (e) {
      setCouponFeedback('Erro ao validar cupom');
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;
    setOrderSubmitting(true);

    const isWholesale = quantity >= 4;
    const basePrice = isWholesale ? priceAtacado : priceVarejo;
    const discountFactor = (100 - couponDiscountPercent) / 100;
    const finalPrice = basePrice * discountFactor;
    const total = finalPrice * quantity;
    const stockVal = kit.stock ? kit.stock[selectedSize] : 10;
    const isOutOfStock = stockVal <= 0;

    // 1. REGISTER THE REAL ORDER IN OUR BACKEND DATABASE FILE
    const orderData = {
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      items: [{
        kitId: kit.id,
        kitName: kit.name,
        team: kit.team,
        size: selectedSize,
        quantity: quantity,
        customName: customName.trim() || undefined,
        customNumber: customNumber.trim() || undefined,
        unitPrice: finalPrice
      }],
      status: "Pendente",
      total: total,
      couponUsed: couponCode.trim() || undefined
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
      });
      if (res.ok) {
        console.log("Pedido registrado no backend com sucesso!");
      }
    } catch (err) {
      console.error("Falha ao persistir pedido na West Store:", err);
    }

    setOrderSubmitting(false);
    setShowCheckoutModal(false);

    // 2. LAUNCH WHATSAPP CONVERSATION WITH INTENT DATA
    let message = `Olá West Store! Gostaria de finalizar minha encomenda:\n\n`;
    message += `📋 *DADOS DO CLIENTE:*\n`;
    message += `- *Nome:* ${clientName.trim()}\n`;
    message += `- *Telefone:* ${clientPhone.trim()}\n\n`;
    
    message += `👕 *DETALHES DO MANTO:*\n`;
    message += `- *Time:* ${kit.team}\n`;
    message += `- *Modelo:* ${kit.name} (${kit.season})\n`;
    message += `- *Tamanho:* ${selectedSize} ${isOutOfStock ? '(Pedido de Encomenda sob Demanda)' : '(Em Estoque)'}\n`;
    message += `- *Quantidade:* ${quantity} unidade(s)\n`;
    
    if (customName.trim() || customNumber.trim()) {
      message += `🖌️ *PERSONALIZAÇÃO:*\n`;
      if (customName.trim()) message += `- *Nome na Camisa:* ${customName.toUpperCase()}\n`;
      if (customNumber.trim()) message += `- *Número:* ${customNumber}\n`;
    }

    if (couponCode.trim() && couponDiscountPercent > 0) {
      message += `🎟️ *CUPOM APLICADO:* ${couponCode.toUpperCase()} (${couponDiscountPercent}% OFF)\n`;
    }

    message += `\n💰 *VALOR TOTAL:* R$ ${total.toFixed(2).replace('.', ',')}\n`;
    message += `- *Preço unitário:* R$ ${finalPrice.toFixed(2).replace('.', ',')} (${isWholesale ? 'Preço de Atacado' : 'Preço de Varejo'})\n\n`;
    message += `Estou no WhatsApp para efetuar o Pix e receber o código de rastreamento!`;

    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getTeamBadgeColor = () => {
    const t = kit.team.toLowerCase();
    if (t.includes('são paulo') || t.includes('spfc')) {
      return 'bg-white/10 text-white border-white/20';
    } else if (t.includes('flamengo')) {
      return 'bg-vermelho-west/10 text-vermelho-ativo border-vermelho-west/30';
    } else if (t.includes('corinthians')) {
      return 'bg-gray-800 text-gray-200 border-gray-700';
    } else if (t.includes('madrid') || t.includes('chelsea') || t.includes('city') || t.includes('barcelona')) {
      return 'bg-blue-900/10 text-blue-400 border-blue-900/30';
    }
    return 'bg-navy-terciario text-branco-texto';
  };

  return (
    <div
      id={`kit-card-${kit.id}`}
      style={{ animationDelay: `${index * 40}ms` }}
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
      className="group relative flex flex-col bg-navy-terciario rounded-[10px] border border-borda-sutil overflow-hidden transition-all duration-300 hover:border-[#8B2523]/50 hover:-translate-y-[3px] focus-within:border-[#8B2523]/50 animate-fade-in-scale opacity-0"
    >
      {/* Team sticker & Season sticker */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 items-center select-none">
        <span className={`px-2.5 py-0.5 text-[10px] font-sans font-extrabold tracking-wider uppercase rounded border ${getTeamBadgeColor()}`}>
          {kit.team}
        </span>
        <span className="px-2 py-0.5 text-[9px] font-sans font-bold bg-navy-principal text-cinza-muted rounded border border-borda-sutil">
          {kit.season}
        </span>
      </div>

      {/* Retro sticker or discount tag */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5 items-end select-none">
        {kit.isRetro && (
          <span className="px-2.5 py-0.5 text-[10px] font-sans font-black tracking-widest text-dourado-retro bg-dourado-retro/15 border border-dourado-retro/40 rounded-full uppercase">
            Retrô 👑
          </span>
        )}
        {hasPromo && (
          <span className="px-2 py-0.5 text-[10px] font-sans font-black tracking-wider text-white bg-vermelho-west border border-vermelho-west rounded uppercase animate-pulse">
            OFERTA!
          </span>
        )}
      </div>

      {/* Stage Visual Jersey Preview Stage (210px height ) */}
      <div className="relative h-[210px] bg-navy-terciario/60 flex items-center justify-center p-4 overflow-hidden border-b border-borda-sutil group-hover:bg-navy-terciario/80 transition-colors">
        <div className="absolute inset-0 bg-radial-gradient from-transparent to-navy-secundario/40 pointer-events-none" />
        {kit.imageUrl ? (
          <img
            src={kit.imageUrl}
            alt={kit.name}
            referrerPolicy="no-referrer"
            className="h-full w-auto max-h-[170px] max-w-[90%] object-contain drop-shadow-[0_12px_20px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <JerseyVisual
            design={kit.design}
            size="md"
          />
        )}
      </div>

      {/* E-commerce product properties block */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating stars & Category League */}
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono tracking-[1.5px] text-[#C0392B] uppercase">
              {kit.championship ? `${kit.championship} • ` : ''}{kit.isRetro ? 'Coleção Lendas' : 'Kit Oficial'}
            </span>
            <div className="flex items-center gap-0.5 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <Star className="w-3 h-3 fill-amber-400" />
              <Star className="w-3 h-3 fill-amber-400" />
              <Star className="w-3 h-3 fill-amber-400" />
              <Star className="w-3 h-3 fill-amber-400" />
              <span className="text-[10px] font-bold text-cinza-muted ml-1">5.0</span>
            </div>
          </div>

          <h3 className="text-lg font-display font-medium text-branco-texto tracking-wide group-hover:text-vermelho-ativo transition-colors mb-2">
            {kit.name}
          </h3>

          {/* Pricing Grid */}
          <div className="space-y-1 bg-navy-principal/40 p-2.5 rounded border border-borda-sutil/50 mb-4 select-none">
            <div className="flex justify-between items-center text-sm">
              <span className="text-cinza-muted text-xs">Varejo:</span>
              <div className="flex items-center gap-2">
                {hasPromo && (
                  <span className="text-xs text-cinza-muted line-through">
                    R$ {kit.priceRetail.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="font-display font-bold text-branco-texto text-base">
                  R$ {priceVarejo.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-cinza-muted text-xs flex items-center gap-1">
                Atacado <span className="text-[9px] bg-red-950/40 text-[#D4A843] px-1 rounded font-bold">4+ un</span>:
              </span>
              <span className="font-display font-medium text-[#D4A843] text-sm">
                R$ {priceAtacado.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* SIZES MATRIX SELECTOR & MEASUREMENTS SHEET LINK */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-sans font-bold text-cinza-muted uppercase tracking-wider block">
                Tamanho do Manto:
              </span>
              <button
                type="button"
                onClick={() => setShowSizeTable(!showSizeTable)}
                className="text-[10px] text-dourado-retro hover:underline flex items-center gap-1 font-bold bg-transparent border-0 cursor-pointer"
              >
                Tabela de Medidas 📏
              </button>
            </div>

            {/* Sizes Box toggler */}
            <div className="grid grid-cols-4 gap-2">
              {(['P', 'M', 'G', 'GG'] as const).map((size) => {
                const stockVal = kit.stock ? kit.stock[size] : 10;
                const isOutOfStock = stockVal <= 0;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-1 text-xs font-semibold rounded transition-all relative ${
                      isOutOfStock
                        ? 'bg-navy-principal/40 border-borda-sutil/45 text-cinza-muted/30 cursor-not-allowed line-through'
                        : selectedSize === size
                          ? 'bg-[#8B2523] border-[#8B2523] text-white font-black shadow-md shadow-[#8B2523]/30'
                          : 'bg-navy-principal border-borda-sutil text-cinza-muted hover:border-cinza-muted hover:text-white'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {/* Live Stock Indicators */}
            {(() => {
              const stockVal = kit.stock ? kit.stock[selectedSize] : 10;
              if (stockVal > 3) {
                return (
                  <span className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                    Manto disponível em estoque ({stockVal} un)
                  </span>
                );
              } else if (stockVal > 0) {
                return (
                  <span className="mt-2 text-[10px] text-amber-500 font-semibold flex items-center gap-1 animate-pulse">
                    ⚠️ Poucas unidades em estoque ({stockVal} restantes!)
                  </span>
                );
              } else {
                return (
                  <span className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1">
                    📦 Encomenda personalizada (Aguarde 6-12 dias úteis)
                  </span>
                );
              }
            })()}
          </div>

          {/* GORGEOUS COUNTDOWN TIMER FOR FOMO DEALS */}
          {hasPromo && (
            <div className="mt-3.5 bg-red-950/20 border border-vermelho-west/20 p-2 rounded flex items-center justify-between text-xs animate-pulse">
              <span className="text-vermelho-ativo font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> FOCO! Oferta do Dia:
              </span>
              <span className="font-mono text-white text-[11px] font-black tracking-wider bg-navy-principal px-2 py-0.5 rounded border border-white/10 uppercase">
                Termina em {timeLeft.hours}:{timeLeft.minutes}:{timeLeft.seconds}
              </span>
            </div>
          )}

          {/* CUSTOMIZER EXPANDABLE FOR CUSTOM SQUAD NAMES & NUMBERS */}
          <div className="mt-4 border-t border-borda-sutil/60 pt-3">
            <button
              type="button"
              onClick={() => setShowCustomizer(!showCustomizer)}
              className={`w-full text-center py-2 text-[10px] uppercase font-bold tracking-[1.5px] rounded border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                showCustomizer
                  ? 'bg-navy-principal border-vermelho-west text-vermelho-ativo'
                  : 'bg-navy-principal/40 border-borda-sutil text-cinza-muted hover:border-cinza-muted hover:text-white'
              }`}
            >
              🎨 {showCustomizer ? 'Fechar Personalização' : 'Personalizar Nome e Número (Grátis!)'}
            </button>

            {showCustomizer && (
              <div className="mt-3 space-y-2.5 p-3 bg-navy-principal/50 rounded border border-borda-sutil">
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-8">
                    <label className="text-[9px] text-cinza-muted uppercase font-bold block mb-1">NOME DA CAMISA:</label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="Ex: CALLERI"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value.toUpperCase())}
                      className="w-full bg-navy-principal border border-borda-sutil focus:border-vermelho-west text-white text-xs py-1.5 px-2.5 rounded outline-none font-display uppercase tracking-wider"
                    />
                  </div>
                  <div className="col-span-4">
                    <label className="text-[9px] text-cinza-muted uppercase font-bold block mb-1">NÚMERO:</label>
                    <input
                      type="text"
                      maxLength={3}
                      placeholder="Ex: 9"
                      value={customNumber}
                      onChange={(e) => setCustomNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-navy-principal border border-borda-sutil focus:border-vermelho-west text-white text-xs py-1.5 px-2 rounded outline-none text-center font-display"
                    />
                  </div>
                </div>
                <span className="text-[9px] leading-tight text-cinza-muted block">
                  🛡️ Adicionamos os patchs oficiais da liga correspondente nas mangas do seu manto!
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Action Button & Qty Control */}
        <div className="mt-5 flex items-center gap-2">
          {/* Quantity selector */}
          <div className="flex items-center bg-navy-principal border border-borda-sutil rounded-md select-none">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2.5 py-2 text-xs text-cinza-muted hover:text-branco-texto font-bold transition-colors cursor-pointer"
            >
              -
            </button>
            <span className="font-display font-medium text-xs px-1 text-branco-texto min-w-[18px] text-center">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-2.5 py-2 text-xs text-cinza-muted hover:text-branco-texto font-bold transition-colors cursor-pointer"
            >
              +
            </button>
          </div>

          {/* Trigger checkout modal */}
          <button
            type="button"
            onClick={() => setShowCheckoutModal(true)}
            className="flex-1 text-xs font-sans font-black py-2.5 px-2 rounded transition-all duration-300 transform bg-[#25D366] hover:bg-[#20ba59] text-white hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1 uppercase tracking-wide cursor-pointer"
          >
            <svg viewBox="0 0 448 512" width="14" height="14" fill="currentColor">
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
            <span>Fechar no WhatsApp</span>
          </button>
        </div>
      </div>

      {/* MODAL 1: REAL SIZE MEASUREMENTS TABLE */}
      {showSizeTable && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-navy-secundario text-white w-full max-w-md p-6 rounded-xl border border-borda-sutil relative shadow-2xl animate-fade-in">
            <button
              type="button"
              onClick={() => setShowSizeTable(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold cursor-pointer text-sm"
            >
              ✕
            </button>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-dourado-retro" />
              <h4 className="text-lg font-display text-white uppercase tracking-wide">
                Tabela de Medidas Reais
              </h4>
            </div>
            <p className="text-[11px] text-[#8FA3B1] leading-relaxed mb-4">
              Evite devoluções! Nossas camisas de padrão tailandês 1:1 seguem as medidas industriais abaixo com tolerância máxima de 1,5 cm.
            </p>
            
            <div className="overflow-hidden rounded-lg border border-borda-sutil">
              <table className="w-full text-left text-xs text-white">
                <thead className="bg-navy-principal font-semibold text-[10px] uppercase text-[#C0392B] border-b border-borda-sutil">
                  <tr>
                    <th className="p-3">Tamanho</th>
                    <th className="p-3">Gola p/ Barra (cm)</th>
                    <th className="p-3">Largura Peito (cm)</th>
                    <th className="p-3">Sugestão de Altura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borda-sutil bg-navy-terciario">
                  <tr className="hover:bg-navy-secundario transition-colors">
                    <td className="p-3 font-bold text-dourado-retro">P (Small)</td>
                    <td className="p-3 font-mono">68 - 70 cm</td>
                    <td className="p-3 font-mono">48 - 50 cm</td>
                    <td className="p-3">1,60m - 1,70m</td>
                  </tr>
                  <tr className="hover:bg-navy-secundario transition-colors">
                    <td className="p-3 font-bold text-dourado-retro">M (Medium)</td>
                    <td className="p-3 font-mono">71 - 73 cm</td>
                    <td className="p-3 font-mono">51 - 53 cm</td>
                    <td className="p-3">1,70m - 1,78m</td>
                  </tr>
                  <tr className="hover:bg-navy-secundario transition-colors">
                    <td className="p-3 font-bold text-dourado-retro">G (Large)</td>
                    <td className="p-3 font-mono">74 - 76 cm</td>
                    <td className="p-3 font-mono">54 - 56 cm</td>
                    <td className="p-3">1,78m - 1,85m</td>
                  </tr>
                  <tr className="hover:bg-navy-secundario transition-colors">
                    <td className="p-3 font-bold text-dourado-retro">GG (X-Large)</td>
                    <td className="p-3 font-mono">77 - 79 cm</td>
                    <td className="p-3 font-mono">57 - 59 cm</td>
                    <td className="p-3">1,85m - 1,95m</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center gap-2 text-[10px] text-zinc-400 bg-navy-principal p-2.5 rounded border border-borda-sutil">
              <Shield className="w-4 h-4 text-[#D4A843] shrink-0" />
              <span>Dica: Caso goste de caimento mais solto (oversized), recomendamos escolher um tamanho acima do seu padrão de roupas de marca regular!</span>
            </div>

            <button
              onClick={() => setShowSizeTable(false)}
              className="mt-5 w-full bg-[#8B2523] text-white py-2 rounded text-xs font-bold uppercase tracking-wider"
            >
              OK, ENTENDIDO ✓
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: INTERACTIVE CHECKOUT & COUPONS MODAL IN CLIENT VIEW */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-navy-secundario text-white w-full max-w-lg p-6 rounded-xl border border-borda-sutil relative shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setShowCheckoutModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white font-bold cursor-pointer text-sm"
            >
              ✕
            </button>
            
            <div className="flex items-center gap-2 mb-4 border-b border-borda-sutil pb-3">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-base font-display text-white uppercase tracking-wider">
                  Finalizar Encomenda West Store
                </h4>
                <p className="text-[10px] text-cinza-muted uppercase tracking-widest mt-0.5">Falta pouquíssimo para seu manto!</p>
              </div>
            </div>

            {/* Pricing calculations */}
            <div className="bg-navy-principal/80 p-3 rounded border border-borda-sutil mb-4 text-xs space-y-2">
              <div className="flex justify-between text-zinc-400">
                <span>Manto:</span>
                <span className="text-white font-semibold">{kit.name} ({selectedSize})</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Quantidade:</span>
                <span className="text-white font-mono font-bold">{quantity} un</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Preço Unitário:</span>
                <span className="text-white font-semibold">
                  R$ {(quantity >= 4 ? priceAtacado : priceVarejo).toFixed(2).replace('.', ',')}
                </span>
              </div>
              {couponDiscountPercent > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Desconto Cupom ({couponCode.toUpperCase()}):</span>
                  <span>-{couponDiscountPercent}% ({couponTypeUsed})</span>
                </div>
              )}
              <div className="border-t border-borda-sutil/60 pt-2 flex justify-between text-sm font-bold text-white">
                <span>TOTAL ESTIMADO:</span>
                <span className="text-emerald-400 font-display font-black text-base">
                  R$ {((quantity >= 4 ? priceAtacado : priceVarejo) * quantity * ((100 - couponDiscountPercent)/100)).toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>

            {/* Coupon Entry Trigger Box */}
            <div className="bg-navy-terciario p-3 rounded-lg border border-borda-sutil mb-4">
              <label className="text-[10px] font-bold text-cinza-muted uppercase block mb-1">
                Cupom de Desconto (Primeira Compra ou Indicação!):
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="BEMVINDO10, INDICA15, etc."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 bg-navy-principal border border-borda-sutil focus:border-vermelho-west text-white text-xs py-2 px-3 rounded outline-none uppercase font-mono tracking-wider"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  className="bg-[#8B2523] px-3.5 py-1.5 rounded text-xs font-bold uppercase transition-colors hover:bg-red-700"
                >
                  Aplicar
                </button>
              </div>
              {couponFeedback && (
                <p className={`text-[10px] uppercase font-bold mt-1 tracking-wider ${couponFeedback.includes('✅') ? 'text-emerald-400' : 'text-vermelho-ativo'}`}>
                  {couponFeedback}
                </p>
              )}
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span onClick={() => { setCouponCode('WEST10'); setCouponFeedback(''); }} className="text-[9px] bg-navy-principal px-1.5 py-0.5 rounded cursor-pointer border border-borda-sutil/40 text-cinza-muted hover:text-white uppercase font-mono">1ª COMPRA: WEST10</span>
                <span onClick={() => { setCouponCode('INDICA15'); setCouponFeedback(''); }} className="text-[9px] bg-navy-principal px-1.5 py-0.5 rounded cursor-pointer border border-borda-sutil/40 text-cinza-muted hover:text-white uppercase font-mono">INDICAÇÃO: INDICA15</span>
              </div>
            </div>

            {/* Client Registration Fields for CRM persistence */}
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] font-sans font-bold text-cinza-muted block mb-1 uppercase tracking-wider">Seu Nome Completo:</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marco Latapiat"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-navy-principal border border-borda-sutil focus:border-emerald-400 text-branco-texto text-xs py-2.5 px-3 rounded-md outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-sans font-bold text-cinza-muted block mb-1 uppercase tracking-wider">Seu WhatsApp de Contato:</label>
                <input
                  type="tel"
                  required
                  placeholder="Ex: 5512997359828"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-navy-principal border border-borda-sutil focus:border-emerald-400 text-branco-texto text-xs py-2.5 px-3 rounded-md outline-none font-mono"
                />
                <span className="text-[8px] text-[#8FA3B1] leading-none mt-1 block uppercase">Insira DDD e número (Apenas dígitos)</span>
              </div>

              <button
                type="submit"
                disabled={orderSubmitting}
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white py-3 rounded font-sans font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {orderSubmitting ? 'REGISTRANDO ENCOMENDA...' : 'GERAR ENCOMENDA E ENVIAR MENSAGEM ✓'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
