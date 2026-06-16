import { JerseyKit } from './types';

export const JERSEY_CATALOG: JerseyKit[] = [
  // ==================== SÃO PAULO FC ====================
  {
    id: 'spfc-home-24-25',
    name: 'Manto Titular 24/25',
    team: 'São Paulo FC',
    type: 'HomeKit',
    season: '24/25',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'SUPERBET',
    design: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#E74C3C', // Red
      accentColor: '#2C3E50', // Black
      pattern: 'horizontal-stripes', // SPFC chest bands
      patternSecondaryColor: '#2C3E50',
      collarColor: '#E74C3C',
      sleeveColor: '#FFFFFF',
      hasCrestText: 'SPFC',
      sponsorName: 'SUPERBET',
      sponsorColor: '#1A3050'
    }
  },
  {
    id: 'spfc-special-23-24',
    name: 'Manto Especial Black 23/24',
    team: 'São Paulo FC',
    type: 'SpecialKit',
    season: '23/24',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'Sportsbet.io',
    design: {
      primaryColor: '#1A1A1A', // Textured Dark Black
      secondaryColor: '#333333',
      accentColor: '#E74C3C',
      pattern: 'special-texture',
      collarColor: '#2C3E50',
      sleeveColor: '#1A1A1A',
      hasCrestText: 'SPFC',
      sponsorName: 'Sportsbet.io',
      sponsorColor: '#FFFFFF'
    }
  },
  {
    id: 'spfc-away-24-25',
    name: 'Manto Reserva Stripes 24/25',
    team: 'São Paulo FC',
    type: 'AwayKit',
    season: '24/25',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'SUPERBET',
    design: {
      primaryColor: '#E74C3C', // Red base
      secondaryColor: '#FFFFFF',
      accentColor: '#1A1A1A',
      pattern: 'vertical-stripes', // Red, black, white vertical stripes
      patternSecondaryColor: '#1A1A1A',
      collarColor: '#1A1A1A',
      sleeveColor: '#E74C3C',
      hasCrestText: 'SPFC',
      sponsorName: 'SUPERBET',
      sponsorColor: '#FFFFFF'
    }
  },
  {
    id: 'spfc-third-24-25',
    name: 'Terceiro Manto Sagrado 24/25',
    team: 'São Paulo FC',
    type: 'ThirdKit',
    season: '24/25',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'SUPERBET',
    design: {
      primaryColor: '#111111', // Black/dark smoke
      secondaryColor: '#C0392B', // Dark Red splatter
      accentColor: '#E74C3C',
      pattern: 'splatter', // Smoke splatter pattern
      collarColor: '#111111',
      sleeveColor: '#111111',
      hasCrestText: 'SPFC',
      sponsorName: 'SUPERBET',
      sponsorColor: '#FFFFFF'
    }
  },
  {
    id: 'spfc-retro-99-00',
    name: 'Manto Retrô Histórico 99/00',
    team: 'São Paulo FC',
    type: 'RetroKit',
    season: '99/00',
    priceRetail: 159.90,
    priceWholesale: 149.90,
    isRetro: true,
    sponsor: 'MOTOROLA',
    design: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#E74C3C',
      accentColor: '#2C3E50',
      pattern: 'horizontal-stripes',
      collarColor: '#2C3E50',
      sleeveColor: '#FFFFFF',
      hasCrestText: 'SPFC',
      sponsorName: 'MOTOROLA',
      sponsorColor: '#111111'
    }
  },

  // ==================== FLAMENGO ====================
  {
    id: 'fla-home-25-26',
    name: 'Manto Titular Rubro-Negro 25/26',
    team: 'Flamengo',
    type: 'HomeKit',
    season: '25/26',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'PIXBET',
    design: {
      primaryColor: '#111111', // Black
      secondaryColor: '#C0392B', // Red
      accentColor: '#FFFFFF',
      pattern: 'horizontal-stripes', // Thick stripes
      patternSecondaryColor: '#C0392B',
      collarColor: '#111111',
      sleeveColor: '#C0392B',
      hasCrestText: 'CRF',
      sponsorName: 'PIXBET',
      sponsorColor: '#FFFFFF'
    }
  },
  {
    id: 'fla-special-24-25',
    name: 'Edição Especial Premium 24/25',
    team: 'Flamengo',
    type: 'SpecialKit',
    season: '24/25',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'PIXBET',
    design: {
      primaryColor: '#5C4033', // Custom Brown / Beige
      secondaryColor: '#D4A843', // Gold details
      accentColor: '#F2F4F7',
      pattern: 'special-texture',
      collarColor: '#D4A843',
      sleeveColor: '#5C4033',
      hasCrestText: 'CRF',
      sponsorName: 'PIXBET',
      sponsorColor: '#FFFFFF'
    }
  },
  {
    id: 'fla-away-25-26',
    name: 'Manto Reserva Branco 25/26',
    team: 'Flamengo',
    type: 'AwayKit',
    season: '25/26',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'PIXBET',
    design: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#C0392B',
      accentColor: '#111111',
      pattern: 'diagonal-stripes',
      collarColor: '#111111',
      sleeveColor: '#FFFFFF',
      hasCrestText: 'CRF',
      sponsorName: 'PIXBET',
      sponsorColor: '#C0392B'
    }
  },
  {
    id: 'fla-third-24-25',
    name: 'Manto Alternativo Carbono 24/25',
    team: 'Flamengo',
    type: 'ThirdKit',
    season: '24/25',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'PIXBET',
    design: {
      primaryColor: '#2C3E50', // Dark grey/carbon
      secondaryColor: '#1A252F',
      accentColor: '#C0392B',
      pattern: 'splatter', // wavy shadow patterns
      collarColor: '#C0392B',
      sleeveColor: '#2C3E50',
      hasCrestText: 'CRF',
      sponsorName: 'PIXBET',
      sponsorColor: '#E74C3C'
    }
  },
  {
    id: 'fla-retro-92-93',
    name: 'Manto Retrô Lubrax 92/93',
    team: 'Flamengo',
    type: 'RetroKit',
    season: '92/93',
    priceRetail: 159.90,
    priceWholesale: 149.90,
    isRetro: true,
    sponsor: 'LUBRAX',
    design: {
      primaryColor: '#111111',
      secondaryColor: '#C0392B',
      accentColor: '#FFFFFF',
      pattern: 'horizontal-stripes',
      patternSecondaryColor: '#C0392B',
      collarColor: '#FFFFFF',
      sleeveColor: '#C0392B',
      hasCrestText: 'CRF',
      sponsorName: 'LUBRAX',
      sponsorColor: '#FFFFFF'
    }
  },

  // ==================== CORINTHIANS ====================
  {
    id: 'cor-home-25-26',
    name: 'Manto Titular Alvinegro 25/26',
    team: 'Corinthians',
    type: 'HomeKit',
    season: '25/26',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'VAIDEBET',
    design: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#111111', // Black details
      accentColor: '#C0392B',
      pattern: 'solid',
      collarColor: '#111111',
      sleeveColor: '#111111', // Black sleeves
      hasCrestText: 'CP',
      sponsorName: 'VAIDEBET',
      sponsorColor: '#111111'
    }
  },
  {
    id: 'cor-special-23-24',
    name: 'Edição Especial Senna 23/24',
    team: 'Corinthians',
    type: 'SpecialKit',
    season: '23/24',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'VAIDEBET',
    design: {
      primaryColor: '#F5E6D3', // Cream / beige
      secondaryColor: '#111111',
      accentColor: '#111111',
      pattern: 'retro-lines',
      collarColor: '#111111',
      sleeveColor: '#F5E6D3',
      hasCrestText: 'CP',
      sponsorName: 'VAIDEBET',
      sponsorColor: '#111111'
    }
  },
  {
    id: 'cor-away-25-26',
    name: 'Manto Reserva Black 25/26',
    team: 'Corinthians',
    type: 'AwayKit',
    season: '25/26',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'VAIDEBET',
    design: {
      primaryColor: '#111111', // Black
      secondaryColor: '#FFFFFF',
      accentColor: '#FFFFFF',
      pattern: 'solid',
      collarColor: '#FFFFFF',
      sleeveColor: '#111111',
      hasCrestText: 'CP',
      sponsorName: 'VAIDEBET',
      sponsorColor: '#FFFFFF'
    }
  },
  {
    id: 'cor-third-24-25',
    name: 'Manto Alternativo Listrado 24/25',
    team: 'Corinthians',
    type: 'ThirdKit',
    season: '24/25',
    priceRetail: 129.90,
    priceWholesale: 119.90,
    isRetro: false,
    sponsor: 'VAIDEBET',
    design: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#111111',
      accentColor: '#111111',
      pattern: 'vertical-stripes', // Black and white vertical thick stripes
      patternSecondaryColor: '#111111',
      collarColor: '#111111',
      sleeveColor: '#FFFFFF',
      hasCrestText: 'CP',
      sponsorName: 'VAIDEBET',
      sponsorColor: '#111111'
    }
  },
  {
    id: 'cor-retro-12-13',
    name: 'Manto Retrô Libertadores 12/13',
    team: 'Corinthians',
    type: 'RetroKit',
    season: '12/13',
    priceRetail: 159.90,
    priceWholesale: 149.90,
    isRetro: true,
    sponsor: 'CAIXA',
    design: {
      primaryColor: '#FFFFFF',
      secondaryColor: '#DDDDDD',
      accentColor: '#E67E22', // Orange box inside icon
      pattern: 'special-texture', // Grey shadow patterns
      collarColor: '#111111',
      sleeveColor: '#FFFFFF',
      hasCrestText: 'CP',
      sponsorName: 'CAIXA',
      sponsorColor: '#005CA9' // Caixa Blue
    }
  }
];

export const VIP_BENEFITS = [
  'Participação garantida em sorteios mensais de camisas oficiais',
  'Rifas exclusivas com bilhetes pela metade do preço ou grátis',
  'Promoções relâmpago semanais com descontos acumulativos',
  'Brindes personalizados em compras selecionadas (chaveiros, adesivos)',
  'Trocas facilitadas sem burocracia e custos adicionais'
];
