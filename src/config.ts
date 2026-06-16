import { SiteConfig, JerseyKit } from './types';
import { JERSEY_CATALOG, VIP_BENEFITS } from './data';

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  heroEyebrow: 'WEST STORE • QUALIDADE E PROCEDÊNCIA',
  heroTitle1: 'SUA CAMISA DO',
  heroTitleAccent: 'TIME FAVORITO',
  heroSubtitle: 'Encontre mantos nacionais, internacionais e relíquias retrô da melhor qualidade. Atendimento especializado para varejo e atacado com frete grátis para todo o Brasil.',
  whatsappNumber: '5512997359828',
  instagramHandle: 'west_store_oficial',
  vipPrice: '7,50',
  vipBenefits: VIP_BENEFITS,
};

// Admin default credentials
export const DEFAULT_ADMIN_PASSWORD = 'admin';

// Load Site Config
export function loadSiteConfig(): SiteConfig {
  const saved = localStorage.getItem('west_store_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading config', e);
    }
  }
  return DEFAULT_SITE_CONFIG;
}

// Save Site Config
export function saveSiteConfig(config: SiteConfig): void {
  localStorage.setItem('west_store_config', JSON.stringify(config));
}

// Load Jerseys Catalog
export function loadJerseyCatalog(): JerseyKit[] {
  const saved = localStorage.getItem('west_store_catalog');
  let catalog: JerseyKit[] = JERSEY_CATALOG;
  if (saved) {
    try {
      catalog = JSON.parse(saved);
    } catch (e) {
      console.error('Error loading catalog', e);
      catalog = JERSEY_CATALOG;
    }
  }
  
  // Ensure every jersey has a stock object defined, to migrate safely
  return catalog.map(item => {
    if (!item.stock) {
      return {
        ...item,
        stock: {
          P: 10,
          M: 10,
          G: 10,
          GG: 10
        }
      };
    }
    return item;
  });
}

// Save Jerseys Catalog
export function saveJerseyCatalog(catalog: JerseyKit[]): void {
  localStorage.setItem('west_store_catalog', JSON.stringify(catalog));
}

// Load / Save Admin Password
export function getAdminPassword(): string {
  const envPassword = (import.meta as any).env?.VITE_ADMIN_PASSWORD;
  return envPassword || localStorage.getItem('west_store_admin_password') || DEFAULT_ADMIN_PASSWORD;
}

export function saveAdminPassword(password: string): void {
  localStorage.setItem('west_store_admin_password', password);
}
