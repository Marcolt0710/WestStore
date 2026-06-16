import React, { useState } from 'react';
import { JerseyKit, CartItem } from '../types';
import JerseyVisual from './JerseyVisual';
import { loadSiteConfig } from '../config';

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
  const siteConfig = loadSiteConfig();

  // Prices based on type, dynamically using custom set values if available
  const priceVarejo = kit.priceRetail || (kit.isRetro ? 159.90 : 129.90);
  const priceAtacado = kit.priceWholesale || (kit.isRetro ? 149.90 : 119.90);

  const handleContact = () => {
    const price = quantity >= 4 ? priceAtacado : priceVarejo;
    const total = price * quantity;
    const isWholesale = quantity >= 4;
    const stockVal = kit.stock ? kit.stock[selectedSize] : 10;
    const isOutOfStock = stockVal <= 0;

    let message = `Olá West Store! Gostaria de encomendar a seguinte camisa:\n\n`;
    message += `👕 *DETALHES DA CAMISA:*\n`;
    message += `- *Time:* ${kit.team}\n`;
    message += `- *Modelo:* ${kit.name} (${kit.season})\n`;
    message += `- *Tamanho:* ${selectedSize} ${isOutOfStock ? '(Pedido de Encomenda sob Demanda)' : '(Em Estoque)'}\n`;
    message += `- *Quantidade:* ${quantity} un\n`;

    message += `\n💰 *VALOR ESTIMADO:* R$ ${total.toFixed(2).replace('.', ',')}\n`;
    message += `- *Preço unitário:* R$ ${price.toFixed(2).replace('.', ',')} (${isWholesale ? 'Preço de Atacado' : 'Preço de Varejo'})\n\n`;
    message += `No aguardo para receber as informações de pagamento e finalizar meu pedido!`;

    const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Badge styles based on team
  const getTeamBadgeColor = () => {
    switch (kit.team) {
      case 'São Paulo FC':
        return 'bg-white/10 text-white border-white/20';
      case 'Flamengo':
        return 'bg-vermelho-west/10 text-vermelho-ativo border-vermelho-west/30';
      case 'Corinthians':
        return 'bg-gray-800 text-gray-200 border-gray-700';
      default:
        return 'bg-navy-terciario text-branco-texto';
    }
  };

  return (
    <div
      id={`kit-card-${kit.id}`}
      style={{ animationDelay: `${index * 40}ms` }}
      className="group relative flex flex-col bg-navy-secundario rounded-xl border border-borda-sutil overflow-hidden transition-all duration-300 hover:border-vermelho-west/50 hover:scale-[1.02] hover:-translate-y-1.5 focus-within:border-vermelho-west/50 animate-fade-in-scale opacity-0"
    >
      {/* Team sticker & Season */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 items-center">
        <span className={`px-2.5 py-0.5 text-[11px] font-sans font-semibold tracking-wider uppercase rounded border ${getTeamBadgeColor()}`}>
          {kit.team}
        </span>
        <span className="px-2 py-0.5 text-[10px] font-sans font-bold bg-navy-principal text-cinza-muted rounded border border-borda-sutil">
          {kit.season}
        </span>
      </div>

      {/* Retro/VIP tag if applicable */}
      {kit.isRetro && (
        <div className="absolute top-3 right-3 z-10">
          <span className="px-2.5 py-0.5 text-[11px] font-sans font-bold tracking-widest text-dourado-retro bg-dourado-retro/10 border border-dourado-retro/40 rounded-full uppercase">
            Retrô 👑
          </span>
        </div>
      )}

      {/* Visual Jersey Preview Stage (180px height slightly lighter bg) */}
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

      {/* Product Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Eyebrow Label */}
          <span className="text-[10px] font-mono font-semibold text-vermelho-ativo uppercase tracking-widest block mb-1">
            {kit.isRetro ? 'Coleção Lendas' : 'Kit Oficial'}
          </span>
          {/* Title */}
          <h3 className="text-xl font-display font-medium text-branco-texto tracking-wide group-hover:text-vermelho-ativo transition-colors">
            {kit.name}
          </h3>

          {/* Pricing Model Displays */}
          <div className="mt-2.5 space-y-1 bg-navy-principal/40 p-2.5 rounded border border-borda-sutil/50">
            <div className="flex justify-between items-center text-sm">
              <span className="text-cinza-muted text-xs">Preço Varejo:</span>
              <span className="font-display font-bold text-branco-texto text-base">
                R$ {priceVarejo.toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-cinza-muted text-xs flex items-center gap-1">
                Preço Atacado:
                <span className="text-[9px] bg-vermelho-west/20 text-dourado-retro px-1 rounded font-bold">4+ un</span>
              </span>
              <span className={`font-display font-bold ${kit.isRetro ? 'text-dourado-retro' : 'text-branco-texto'} text-base`}>
                R$ {priceAtacado.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="mt-4">
            <span className="text-[11px] font-sans font-bold text-cinza-muted uppercase tracking-wider block mb-1.5">
              Tamanho disponível:
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['P', 'M', 'G', 'GG'] as const).map((size) => {
                const stockVal = kit.stock ? kit.stock[size] : 10;
                const isOutOfStock = stockVal <= 0;
                return (
                  <button
                    key={size}
                    id={`size-btn-${kit.id}-${size}`}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`py-1 text-xs font-semibold rounded-md border transition-all relative ${
                      isOutOfStock
                        ? 'bg-navy-principal/40 border-borda-sutil/40 text-cinza-muted/30 cursor-not-allowed line-through'
                        : selectedSize === size
                          ? 'bg-vermelho-west border-vermelho-west text-branco-texto font-bold shadow-md shadow-vermelho-west/20'
                          : 'bg-navy-principal border-borda-sutil text-cinza-muted hover:border-cinza-muted hover:text-branco-texto'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            
            {/* Live Stock Display Indicator */}
            {(() => {
              const stockVal = kit.stock ? kit.stock[selectedSize] : 10;
              if (stockVal > 3) {
                return (
                  <div className="mt-2 text-[10px] text-zinc-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse inline-block"></span>
                    <span>Disponível em Estoque: <strong className="text-branco-texto font-mono">{stockVal} unidades</strong></span>
                  </div>
                );
              } else if (stockVal > 0) {
                return (
                  <div className="mt-2 text-[10px] text-amber-400 flex items-center gap-1.5 animate-pulse">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full inline-block"></span>
                    <span>Poucas unidades: <strong className="font-mono text-white">{stockVal} restantes!</strong></span>
                  </div>
                );
              } else {
                return (
                  <div className="mt-2 text-[10px] text-vermelho-ativo flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full inline-block"></span>
                    <span>Sem Estoque Imediato (Encomende sob Demanda)</span>
                  </div>
                );
              }
            })()}
          </div>
        </div>

        {/* Action button */}
        <div className="mt-5 flex items-center gap-2">
          {/* Quantity Selector */}
          <div className="flex items-center bg-navy-principal border border-borda-sutil rounded-md">
            <button
              id={`qty-minus-${kit.id}`}
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-2.5 py-2 text-xs text-cinza-muted hover:text-branco-texto font-bold transition-colors"
            >
              -
            </button>
            <span className="font-display font-medium text-xs px-2 text-branco-texto min-w-[20px] text-center">
              {quantity}
            </span>
            <button
              id={`qty-plus-${kit.id}`}
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-2.5 py-2 text-xs text-cinza-muted hover:text-branco-texto font-bold transition-colors"
            >
              +
            </button>
          </div>

          <button
            id={`contact-us-btn-${kit.id}`}
            type="button"
            onClick={handleContact}
            className="flex-1 text-sm font-sans font-semibold py-2.5 px-3 rounded-md transition-all duration-300 transform bg-[#25D366] hover:bg-[#20ba59] text-white hover:-translate-y-0.5 active:translate-y-0 hover:shadow-lg hover:shadow-[#25D366]/15 flex items-center justify-center gap-2"
          >
            {/* SVG WhatsApp Icon */}
            <svg
              viewBox="0 0 448 512"
              width="16"
              height="16"
              fill="currentColor"
            >
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L3 480l117.7-30.9c32.4 17.7 68.9 27 106.2 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
            </svg>
            <span>💬 Fale Conosco</span>
          </button>
        </div>
      </div>
    </div>
  );
}
