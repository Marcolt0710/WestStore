export type TeamName = 'São Paulo FC' | 'Flamengo' | 'Corinthians';

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
  team: TeamName;
  type: KitType;
  season: string;
  priceRetail: number;
  priceWholesale: number;
  isRetro: boolean;
  sponsor?: string;
  design: KitDesign;
  imageUrl?: string;
  stock?: {
    P: number;
    M: number;
    G: number;
    GG: number;
  };
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

