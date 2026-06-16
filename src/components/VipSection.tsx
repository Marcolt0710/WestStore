import React, { useState } from 'react';
import { VIP_BENEFITS } from '../data';
import { loadSiteConfig } from '../config';
import { Crown, Check, ShieldCheck } from 'lucide-react';

export default function VipSection() {
  const [isJoined, setIsJoined] = useState(false);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(false);

  const siteConfig = loadSiteConfig();

  const handleJoinVip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setLoading(true);
    // Simulate payment loading
    setTimeout(() => {
      setLoading(false);
      setIsJoined(true);
      
      const message = `Olá West Store! Quero entrar para o Grupo VIP West Store e garantir benefícios exclusivos por R$${siteConfig.vipPrice}/mês. Meu nome é: ${userName.trim()}`;
      const whatsappUrl = `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }, 1500);
  };

  return (
    <section id="grupo-vip-secao" className="py-12 px-4 max-w-7xl mx-auto">
      {/* Eyebrow Label */}
      <span className="text-[11px] font-mono font-bold text-vermelho-ativo uppercase tracking-widest block mb-1.5 text-center">
        EXCLUSIVIDADE É PARA POUCOS
      </span>

      {/* Header */}
      <h2 className="text-3xl sm:text-4xl font-display font-bold text-branco-texto text-center tracking-wide uppercase mb-8">
        GRUPO VIP <span className="text-dourado-retro">WEST STORE</span>
      </h2>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Card: Value Proposition and Details (8 Columns) */}
        <div className="lg:col-span-7 bg-navy-secundario rounded-xl p-6 sm:p-8 border border-dourado-retro/40 shadow-xl shadow-dourado-retro/5 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-dourado-retro/10 to-transparent rounded-full blur-2xl pointer-events-none" />
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-dourado-retro" />
              <span className="text-xs font-mono font-bold text-dourado-retro bg-dourado-retro/10 border border-dourado-retro/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Comunidade Seleta
              </span>
            </div>

            <p className="text-lg font-sans text-branco-texto mb-6 leading-relaxed">
              Participe do nosso clube fechado e tenha acesso a vantagens que <span className="text-dourado-retro font-semibold">ninguém mais tem</span>. Por apenas <strong className="text-dourado-retro font-display text-2xl ml-1">R$ {siteConfig.vipPrice} <span className="text-xs font-sans text-cinza-muted uppercase font-normal">/ mês</span></strong>.
            </p>

            {/* List of Benefits */}
            <div className="space-y-3.5 mb-8">
              {VIP_BENEFITS.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-dourado-retro shrink-0 mt-1" />
                  <p className="text-sm font-sans text-cinza-muted leading-relaxed">
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-borda-sutil pt-4 flex flex-wrap gap-4 items-center justify-between">
            <span className="text-xs font-mono text-cinza-muted uppercase tracking-wider">
              Assinatura recorrente • Cancele quando quiser
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <span className="text-[11px] font-sans text-green-400 font-semibold uppercase">
                128 membros ativos hoje
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Dynamic Checkout Form (5 Columns) */}
        <div className="lg:col-span-5 bg-navy-secundario rounded-xl p-6 border border-borda-sutil flex flex-col justify-between relative">
          <div className="absolute inset-x-0 top-0 h-1.5 bg-vermelho-west" />
          
          {isJoined ? (
            <div className="text-center py-12 px-4 my-auto anim-fadeIn space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-dourado-retro to-amber-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-dourado-retro/20">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold text-dourado-retro uppercase tracking-wide">
                Você é VIP agora!
              </h3>
              <p className="text-xs text-cinza-muted leading-relaxed">
                Nós enviamos seu formulário de inscrição para o WhatsApp da West Store. Conclua o pix de <strong>R$ {siteConfig.vipPrice}</strong> enviado pelo atendente e receba seu link exclusivo para o grupo exclusivo!
              </p>
              <div className="bg-navy-principal p-3.5 rounded border border-borda-sutil">
                <p className="text-[10px] font-mono font-semibold uppercase text-vermelho-ativo tracking-widest mb-1">Status do Ingresso</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-branco-texto">Aguardando Envio Pix / Confirmação</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full justify-between gap-6">
              <div>
                <h3 className="text-xl font-display font-semibold text-branco-texto tracking-wide uppercase mb-2">
                  Adquira seu Acesso VIP
                </h3>
                <p className="text-xs text-cinza-muted leading-relaxed">
                  Digite seu nome e realize sua inscrição instantaneamente. Você será direcionado para liberar seu acesso e iniciar sua economia de benefícios imediatamente.
                </p>

                <form onSubmit={handleJoinVip} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="vip-name-input" className="text-xs font-semibold text-cinza-muted block mb-1.5">Seu Nome *</label>
                    <input
                      id="vip-name-input"
                      type="text"
                      required
                      placeholder="Ex: Marco Latapiat"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      className="w-full bg-navy-principal border border-borda-sutil focus:border-dourado-retro text-branco-texto text-xs rounded p-2.5 outline-none font-sans"
                    />
                  </div>

                  <div className="bg-navy-principal p-3 text-xs rounded border border-borda-sutil text-center">
                    <p className="text-cinza-muted">Valor da mensalidade:</p>
                    <p className="text-2xl font-display font-bold text-dourado-retro mt-0.5">R$ {siteConfig.vipPrice}</p>
                    <p className="text-[9px] text-cinza-muted mt-1 uppercase font-semibold">Sem fidelidade - pause quando preferir</p>
                  </div>

                  <button
                    id="join-vip-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full bg-vermelho-west hover:bg-vermelho-ativo text-branco-texto py-3 px-4 rounded font-sans font-bold text-xs uppercase tracking-widest transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5"
                  >
                    {loading ? 'Processando Inscrição...' : '✓ Desbloquear Meu Acesso VIP'}
                  </button>
                </form>
              </div>

              {/* Security info disclaimer */}
              <div className="mt-4 pt-3 border-t border-borda-sutil flex items-center gap-2.5 text-[10px] text-cinza-muted leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-cinza-muted shrink-0" />
                <span>Garantia de felicidade West Store. Descontos de até R$ 20,00 adicionais na primeira compra já amortizam o valor do ano inteiro!</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
