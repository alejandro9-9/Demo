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

function asRecord(value: unknown, field: string) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error(`La sección “${field}” no es válida.`);
  return value as Record<string, unknown>;
}

function requiredText(value: unknown, field: string, maxLength: number) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`Completa el campo “${field}”.`);
  if (value.length > maxLength) throw new Error(`El campo “${field}” supera el límite permitido.`);
}

function validUrl(value: unknown, field: string, allowRelative = false) {
  requiredText(value, field, 1000);
  const text = value as string;
  if (allowRelative && text.startsWith('/')) return;
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
  } catch {
    throw new Error(`Ingresa una URL válida en “${field}”.`);
  }
}

function validateList(value: unknown, field: string, maxItems: number, validateItem: (item: unknown, index: number) => void) {
  if (!Array.isArray(value)) throw new Error(`La lista “${field}” no es válida.`);
  if (value.length > maxItems) throw new Error(`La lista “${field}” supera el máximo de ${maxItems} elementos.`);
  value.forEach(validateItem);
}

export function sanitizeContent(input: unknown): SiteContent {
  const root = asRecord(input, 'contenido');
  const business = asRecord(root.business, 'Contacto y marca');
  const hero = asRecord(root.hero, 'Portada y carrusel');
  const location = asRecord(root.location, 'Ubicación y mapa');
  const about = asRecord(root.about, 'Información institucional');
  const social = asRecord(root.social, 'Redes sociales');
  const seo = asRecord(root.seo, 'SEO');

  requiredText(business.name, 'Nombre de la empresa', 80);
  requiredText(business.eyebrow, 'Texto corto', 100);
  requiredText(business.description, 'Descripción de la empresa', 500);
  requiredText(business.phone, 'Teléfono', 24);
  if (typeof business.phone !== 'string' || !/^[+0-9 ()-]{7,24}$/.test(business.phone)) throw new Error('Ingresa un teléfono válido.');
  requiredText(business.whatsapp, 'WhatsApp', 15);
  if (typeof business.whatsapp !== 'string' || !/^\d{8,15}$/.test(business.whatsapp)) throw new Error('WhatsApp debe contener entre 8 y 15 números, sin espacios.');
  requiredText(business.whatsappMessage, 'Mensaje inicial de WhatsApp', 250);
  requiredText(business.email, 'Correo electrónico', 254);
  if (typeof business.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.email)) throw new Error('Ingresa un correo electrónico válido.');
  requiredText(business.address, 'Dirección visible', 120);
  requiredText(business.hours, 'Horario', 80);

  requiredText(hero.title, 'Titular', 140);
  requiredText(hero.subtitle, 'Subtítulo', 400);
  requiredText(hero.image, 'Imagen principal', 1000);
  validUrl(hero.image, 'Imagen principal', true);
  requiredText(hero.imageAlt, 'Texto alternativo principal', 160);
  requiredText(hero.primaryCta, 'Botón principal', 50);
  requiredText(hero.secondaryCta, 'Botón secundario', 50);
  if (hero.slides !== undefined) {
    validateList(hero.slides, 'Imágenes rotativas', 8, (item, index) => {
      const slide = asRecord(item, `Imagen rotativa ${index + 1}`);
      requiredText(slide.image, `URL de imagen ${index + 1}`, 1000);
      validUrl(slide.image, `URL de imagen ${index + 1}`, true);
      requiredText(slide.imageAlt, `Texto alternativo de imagen ${index + 1}`, 160);
      requiredText(slide.label, `Etiqueta de imagen ${index + 1}`, 80);
    });
  }

  validateList(root.stats, 'Cifras destacadas', 12, (item, index) => {
    const stat = asRecord(item, `Cifra ${index + 1}`);
    requiredText(stat.value, `Valor de cifra ${index + 1}`, 20);
    requiredText(stat.label, `Texto de cifra ${index + 1}`, 100);
  });
  validateList(root.services, 'Servicios', 12, (item, index) => {
    const service = asRecord(item, `Servicio ${index + 1}`);
    requiredText(service.number, `Número de servicio ${index + 1}`, 3);
    if (typeof service.number !== 'string' || !/^\d{1,3}$/.test(service.number)) throw new Error(`El número del servicio ${index + 1} debe tener entre 1 y 3 dígitos.`);
    requiredText(service.title, `Título de servicio ${index + 1}`, 100);
    requiredText(service.description, `Descripción de servicio ${index + 1}`, 400);
  });
  validateList(root.featuredProperties, 'Propiedades', 24, (item, index) => {
    const property = asRecord(item, `Propiedad ${index + 1}`);
    requiredText(property.id, `ID de propiedad ${index + 1}`, 120);
    requiredText(property.tag, `Etiqueta de propiedad ${index + 1}`, 80);
    requiredText(property.title, `Título de propiedad ${index + 1}`, 100);
    requiredText(property.location, `Ubicación de propiedad ${index + 1}`, 120);
    requiredText(property.price, `Precio de propiedad ${index + 1}`, 40);
    if (typeof property.price !== 'string' || property.price.includes('-')) throw new Error(`El precio de la propiedad ${index + 1} no puede ser negativo.`);
    requiredText(property.details, `Detalles de propiedad ${index + 1}`, 120);
    requiredText(property.description, `Descripción de propiedad ${index + 1}`, 600);
    requiredText(property.image, `Imagen de propiedad ${index + 1}`, 1000);
    validUrl(property.image, `Imagen de propiedad ${index + 1}`, true);
    requiredText(property.imageAlt, `Texto alternativo de propiedad ${index + 1}`, 160);
  });

  requiredText(about.eyebrow, 'Antetítulo institucional', 100);
  requiredText(about.title, 'Título institucional', 140);
  requiredText(about.description, 'Descripción institucional', 600);
  requiredText(about.image, 'Imagen institucional', 1000);
  validUrl(about.image, 'Imagen institucional', true);
  requiredText(about.imageAlt, 'Texto alternativo institucional', 160);
  requiredText(about.quote, 'Cita institucional', 300);

  validateList(root.gallery, 'Galería', 24, (item, index) => {
    const galleryItem = asRecord(item, `Foto ${index + 1}`);
    requiredText(galleryItem.image, `URL de foto ${index + 1}`, 1000);
    validUrl(galleryItem.image, `URL de foto ${index + 1}`, true);
    requiredText(galleryItem.alt, `Texto alternativo de foto ${index + 1}`, 160);
  });
  requiredText(location.title, 'Título de ubicación', 120);
  requiredText(location.description, 'Descripción de ubicación', 500);
  requiredText(location.mapQuery, 'Dirección de búsqueda en Maps', 180);
  validUrl(location.mapUrl, 'URL del mapa embebido');
  validUrl(social.facebook, 'Facebook');
  validUrl(social.instagram, 'Instagram');
  validUrl(social.tiktok, 'TikTok');
  requiredText(seo.title, 'Título SEO', 160);
  requiredText(seo.description, 'Descripción SEO', 320);
  requiredText(root.demoNotice, 'Aviso superior', 180);

  if (JSON.stringify(input).length > 180_000) throw new Error('El contenido supera el límite permitido.');
  return normalizeUploadPaths(input) as SiteContent;
}
