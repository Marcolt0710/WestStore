export type TeamName = 'São Paulo FC' | 'Flamengo' | 'Corinthians' | 'Real Madrid' | 'FC Barcelona' | 'Arsenal' | 'Manchester City';

export type KitType = 'HomeKit' | 'SpecialKit' | 'AwayKit' | 'ThirdKit' | 'RetroKit';

export interface KitDesign {
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  pattern: 'vertical-stripes' | 'horizontal-stripes' | 'solid' | 'special-texture' | 'splatter' | 'diagonal-stripes' | 'retro-lines';
  patternSecondaryColor?: string;
  collarColor: string;
  sleeveColor: string;
  hasCrestText?: string;
  sponsorName?: string;
  sponsorColor?: string;
}

export interface JerseyKit {
  id: string;
  name: string;
  team: string; // broadened for support of custom league teams
  type: KitType;
  season: string;
  priceRetail: number;
  priceWholesale: number;
  promoPrice?: number; // Sets active discount
  isRetro: boolean;
  sponsor?: string;
  design: KitDesign;
  imageUrl?: string;
  championship?: 'Brasileirão' | 'Premier League' | 'Champions' | 'Copa do Mundo' | 'Outros'; // smart filter categories
  popularity?: number; // quantity sold tracker
  views?: number; // view counter for trends
  stock?: {
    P: number;
    M: number;
    G: number;
    GG: number;
  };
}

export interface Coupon {
  code: string;
  discount: string; // e.g. "10%" or "15"
  type: 'Primeira Compra' | 'Indicação' | 'Geral';
  status: string; // "Ativo" | "Inativo"
  validity?: string; // "2026-07-25" 
  limitUsage?: number; // max uses
  usedCount?: number; // current usage
}

export interface OrderItem {
  kitId: string;
  kitName: string;
  team: string;
  size: 'P' | 'M' | 'G' | 'GG';
  quantity: number;
  customName?: string;
  customNumber?: string;
  unitPrice: number;
}

export interface Order {
  id: string; // e.g. "WS-2026-A19"
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  items: OrderItem[];
  status: 'Pendente' | 'Pago' | 'Enviado' | 'Entregue';
  total: number;
  date: string; // ISO 8601 or YYYY-MM-DD
  couponUsed?: string;
}

export interface Review {
  id: string;
  jerseyId?: string; // linked product
  jerseyName?: string;
  clientName: string;
  rating: number; // 1-5
  text: string;
  date: string;
  imageUrl?: string; // photo sent by buyer
  approved: boolean; // moderate tab
  featured: boolean; // homepage show-off
}

export interface CartItem {
  kit: JerseyKit;
  size: 'P' | 'M' | 'G' | 'GG';
  purchaseType: 'Varejo' | 'Atacado';
  customName?: string;
  customNumber?: string;
  quantity: number;
}

export interface SiteConfig {
  heroEyebrow: string;
  heroTitle1: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  whatsappNumber: string;
  instagramHandle: string;
  vipPrice: string;
  vipBenefits: string[];
}

