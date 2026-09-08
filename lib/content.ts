import contentJson from '@/data/content.json';

export type Stat = { value: string; label: string };
export type Service = { number: string; title: string; description: string };
export type Property = { id: string; tag: string; title: string; location: string; price: string; details: string; description: string; image: string; imageAlt: string };
export type HeroSlide = { image: string; imageAlt: string; label: string };

export type SiteContent = {
  business: { name: string; eyebrow: string; description: string; phone: string; whatsapp: string; whatsappMessage: string; email: string; address: string; hours: string };
  hero: { title: string; subtitle: string; image: string; imageAlt: string; slides?: HeroSlide[]; primaryCta: string; secondaryCta: string };
  stats: Stat[];
  services: Service[];
  featuredProperties: Property[];
  about: { eyebrow: string; title: string; description: string; image: string; imageAlt: string; quote: string };
  gallery: Array<{ image: string; alt: string }>;
  location: { title: string; description: string; mapQuery: string; mapUrl: string };
  social: { facebook: string; instagram: string; tiktok: string };
  seo: { title: string; description: string };
  demoNotice: string;
};

export const siteContent = contentJson as SiteContent;

function normalizeUploadPaths(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizeUploadPaths);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, nestedValue]) => [key, normalizeUploadPaths(nestedValue)]));
  }
  if (typeof value === 'string') return value.replace(/^\/public\/uploads\//, '/uploads/');
  return value;
}

export function sanitizeContent(input: unknown): SiteContent {
  if (!input || typeof input !== 'object') throw new Error('El contenido debe ser un objeto válido.');
  const candidate = input as Partial<SiteContent>;
  if (!candidate.business?.name || !candidate.hero?.title || !candidate.location?.mapUrl) throw new Error('Faltan campos obligatorios para publicar el contenido.');
  if (JSON.stringify(input).length > 180_000) throw new Error('El contenido supera el límite permitido.');
  return normalizeUploadPaths(input) as SiteContent;
}
