'use client';

import { ReactNode, useState } from 'react';
import Image from 'next/image';
import type { HeroSlide, Property, Service, SiteContent, Stat } from '@/lib/content';

export type EditorSectionId = 'contact' | 'hero' | 'properties' | 'gallery' | 'services' | 'stats' | 'about' | 'location' | 'details';
export type GalleryItem = SiteContent['gallery'][number];
export type EditableHeroField = Exclude<keyof SiteContent['hero'], 'slides'>;

export const editorSections: Array<{ id: EditorSectionId; number: string; label: string; description: string }> = [
  { id: 'contact', number: '01', label: 'Contacto y marca', description: 'Datos comerciales, WhatsApp y descripción.' },
  { id: 'hero', number: '02', label: 'Portada y carrusel', description: 'Titular, botones e imágenes principales.' },
  { id: 'properties', number: '03', label: 'Propiedades', description: 'Catálogo, precios y fichas detalladas.' },
  { id: 'gallery', number: '04', label: 'Catálogo fotográfico', description: 'Galería de imágenes del sitio.' },
  { id: 'services', number: '05', label: 'Servicios', description: 'Cómo ayudas a tus clientes.' },
  { id: 'stats', number: '06', label: 'Cifras destacadas', description: 'Datos breves de confianza.' },
  { id: 'about', number: '07', label: 'Nosotros', description: 'Historia, imagen y filosofía.' },
  { id: 'location', number: '08', label: 'Ubicación y mapa', description: 'Dirección, Maps y descripción.' },
  { id: 'details', number: '09', label: 'Redes, SEO y aviso', description: 'Visibilidad y comunicación del sitio.' },
];

type FieldProps = { label: string; children: ReactNode; full?: boolean; help?: string };

function Field({ label, children, full = false, help }: FieldProps) {
  return (
    <label className={full ? 'admin-field--full' : undefined}>
      <span>{label}</span>
      {children}
      {help ? <small className="admin-field-help">{help}</small> : null}
    </label>
  );
}

function EditorCard({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="admin-card" aria-label={label}>
      <div className="admin-card__heading">
        <p className="admin-card__label">{label}</p>
        {action}
      </div>
      {children}
    </section>
  );
}

function MediaPreview({ src, alt }: { src: string; alt: string }) {
  return <div className="admin-media-preview">{src ? <Image src={src} alt={alt} width={440} height={300} unoptimized /> : <span>Sin imagen</span>}</div>;
}

function UploadButton({ label, onUpload, disabled = false }: { label: string; onUpload: (file: File) => void; disabled?: boolean }) {
  return (
    <label className={`admin-upload-button${disabled ? ' admin-upload-button--disabled' : ''}`}>
      <span>{label}</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        disabled={disabled}
        aria-label={label}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onUpload(file);
          event.currentTarget.value = '';
        }}
      />
    </label>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <p className="admin-empty-state">{children}</p>;
}

function ContactEditor({ content, update }: { content: SiteContent; update: EditorActions['updateBusiness'] }) {
  return (
    <EditorCard label="01 · Contacto y marca">
      <div className="admin-fields admin-fields--two">
        <Field label="Nombre de la empresa">
          <input required maxLength={80} value={content.business.name} onChange={(event) => update('name', event.target.value)} />
        </Field>
        <Field label="Texto corto">
          <input required maxLength={100} value={content.business.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} />
        </Field>
        <Field label="Descripción de la empresa" full>
          <textarea required maxLength={500} value={content.business.description} onChange={(event) => update('description', event.target.value)} rows={3} />
        </Field>
        <Field label="Teléfono" help="Puedes usar +, espacios, paréntesis y guiones.">
          <input type="tel" inputMode="tel" autoComplete="tel" required maxLength={24} pattern="[+0-9 ()-]{7,24}" title="Ingresa un teléfono válido." value={content.business.phone} onChange={(event) => update('phone', event.target.value.replace(/[^0-9+ ()-]/g, ''))} />
        </Field>
        <Field label="WhatsApp sin espacios" help="Solo números, con código de país si corresponde.">
          <input type="tel" inputMode="numeric" required minLength={8} maxLength={15} pattern="[0-9]{8,15}" title="Ingresa entre 8 y 15 números, sin espacios." value={content.business.whatsapp} onChange={(event) => update('whatsapp', event.target.value.replace(/\D/g, ''))} />
        </Field>
        <Field label="Mensaje inicial de WhatsApp">
          <input required maxLength={250} value={content.business.whatsappMessage} onChange={(event) => update('whatsappMessage', event.target.value)} />
        </Field>
        <Field label="Correo electrónico">
          <input type="email" inputMode="email" autoComplete="email" required maxLength={254} value={content.business.email} onChange={(event) => update('email', event.target.value)} />
        </Field>
        <Field label="Dirección visible">
          <input required maxLength={120} value={content.business.address} onChange={(event) => update('address', event.target.value)} />
        </Field>
        <Field label="Horario">
          <input required maxLength={80} value={content.business.hours} onChange={(event) => update('hours', event.target.value)} />
        </Field>
      </div>
    </EditorCard>
  );
}

function HeroEditor({ content, busy, update, updateSlide, upload }: { content: SiteContent; busy: boolean; update: EditorActions['updateHero']; updateSlide: EditorActions['updateHeroSlide']; upload: EditorActions['uploadHero'] }) {
  const slides = content.hero.slides?.length ? content.hero.slides : [{ image: content.hero.image, imageAlt: content.hero.imageAlt, label: 'Una mirada más humana' }];

  return (
    <EditorCard label="02 · Portada y carrusel">
      <div className="admin-fields admin-fields--two">
        <Field label="Titular" full>
          <textarea required maxLength={140} value={content.hero.title} onChange={(event) => update('title', event.target.value)} rows={2} />
        </Field>
        <Field label="Subtítulo" full>
          <textarea required maxLength={400} value={content.hero.subtitle} onChange={(event) => update('subtitle', event.target.value)} rows={3} />
        </Field>
        <Field label="Texto del botón principal">
          <input required maxLength={50} value={content.hero.primaryCta} onChange={(event) => update('primaryCta', event.target.value)} />
        </Field>
        <Field label="Texto del botón secundario">
          <input required maxLength={50} value={content.hero.secondaryCta} onChange={(event) => update('secondaryCta', event.target.value)} />
        </Field>
      </div>
      <div className="admin-subsection">
        <div className="admin-card__heading">
          <p className="admin-card__label">Imágenes rotativas · {slides.length} configuradas</p>
          <span className="admin-helper">Cambian cada 3.5 segundos</span>
        </div>
        <div className="admin-media-list">
          {slides.map((slide, index) => (
            <div className="admin-media-item" key={`${slide.image}-${index}`}>
              <MediaPreview src={slide.image} alt={slide.imageAlt} />
              <div className="admin-fields">
                <Field label={`Imagen ${String(index + 1).padStart(2, '0')} · URL`} help="Acepta una URL https:// o una ruta /uploads/.">
                  <input required maxLength={500} inputMode="url" value={slide.image} onChange={(event) => updateSlide(index, 'image', event.target.value)} />
                </Field>
                <Field label="Etiqueta">
                  <input required maxLength={80} value={slide.label} onChange={(event) => updateSlide(index, 'label', event.target.value)} />
                </Field>
                <Field label="Texto alternativo">
                  <input required maxLength={160} value={slide.imageAlt} onChange={(event) => updateSlide(index, 'imageAlt', event.target.value)} />
                </Field>
                <UploadButton label={busy ? 'Subiendo…' : 'Subir reemplazo'} disabled={busy} onUpload={(file) => upload(index, file)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </EditorCard>
  );
}

const PROPERTY_PAGE_SIZE = 3;

function Pagination({ page, pageCount, onPageChange }: { page: number; pageCount: number; onPageChange: (page: number) => void }) {
  if (pageCount < 2) return null;

  return (
    <nav className="admin-pagination" aria-label="Paginación del catálogo de propiedades">
      <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Anterior</button>
      <span aria-live="polite">Página {page} de {pageCount}</span>
      <button type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Siguiente</button>
    </nav>
  );
}

function PropertyEditor({ content, busy, update, add, remove, upload }: { content: SiteContent; busy: boolean; update: EditorActions['updateProperty']; add: EditorActions['addProperty']; remove: EditorActions['removeProperty']; upload: EditorActions['uploadProperty'] }) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(content.featuredProperties.length / PROPERTY_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleProperties = content.featuredProperties.slice((currentPage - 1) * PROPERTY_PAGE_SIZE, currentPage * PROPERTY_PAGE_SIZE);

  return (
    <EditorCard label="03 · Catálogo de propiedades" action={<button className="admin-small-button" type="button" onClick={add}>+ Agregar propiedad</button>}>
      {content.featuredProperties.length ? (
        <>
          <div className="admin-catalog-summary">Mostrando {((currentPage - 1) * PROPERTY_PAGE_SIZE) + 1}–{Math.min(currentPage * PROPERTY_PAGE_SIZE, content.featuredProperties.length)} de {content.featuredProperties.length} propiedades</div>
          <div className="admin-property-list">
          {visibleProperties.map((property, index) => {
            const propertyIndex = ((currentPage - 1) * PROPERTY_PAGE_SIZE) + index;
            return (
            <div className="admin-property" key={property.id}>
              <div className="admin-property__top">
                <strong>{String(propertyIndex + 1).padStart(2, '0')}</strong>
                <button className="admin-remove-button" type="button" onClick={() => remove(propertyIndex)}>Eliminar</button>
              </div>
              <div className="admin-property-editor">
                <MediaPreview src={property.image} alt={property.imageAlt} />
                <div className="admin-fields admin-fields--two">
                  <Field label="Título"><input required maxLength={100} value={property.title} onChange={(event) => update(propertyIndex, 'title', event.target.value)} /></Field>
                  <Field label="Etiqueta"><input required maxLength={80} value={property.tag} onChange={(event) => update(propertyIndex, 'tag', event.target.value)} /></Field>
                  <Field label="Ubicación"><input required maxLength={120} value={property.location} onChange={(event) => update(propertyIndex, 'location', event.target.value)} /></Field>
                  <Field label="Precio" help="Ejemplo: US$ 485,000 o S/ 10,000."><input required maxLength={40} inputMode="decimal" pattern="[^-]+" title="El precio no puede ser negativo." value={property.price} onChange={(event) => update(propertyIndex, 'price', event.target.value)} /></Field>
                  <Field label="Detalles"><input required maxLength={120} value={property.details} onChange={(event) => update(propertyIndex, 'details', event.target.value)} /></Field>
                  <Field label="Imagen · URL"><input required maxLength={500} inputMode="url" value={property.image} onChange={(event) => update(propertyIndex, 'image', event.target.value)} /></Field>
                  <Field label="Descripción" full><textarea required maxLength={600} value={property.description} onChange={(event) => update(propertyIndex, 'description', event.target.value)} rows={3} /></Field>
                  <Field label="Texto alternativo" full><input required maxLength={160} value={property.imageAlt} onChange={(event) => update(propertyIndex, 'imageAlt', event.target.value)} /></Field>
                  <UploadButton label={busy ? 'Subiendo…' : 'Subir foto'} disabled={busy} onUpload={(file) => upload(propertyIndex, file)} />
                </div>
              </div>
            </div>
            );
          })}
          </div>
          <Pagination page={currentPage} pageCount={pageCount} onPageChange={setPage} />
        </>
      ) : <EmptyState>No hay propiedades. Usa “Agregar propiedad” para crear la primera.</EmptyState>}
    </EditorCard>
  );
}

function GalleryEditor({ content, busy, update, add, remove, upload }: { content: SiteContent; busy: boolean; update: EditorActions['updateGallery']; add: EditorActions['addGallery']; remove: EditorActions['removeGallery']; upload: EditorActions['uploadGallery'] }) {
  return (
    <EditorCard label="04 · Catálogo fotográfico" action={<button className="admin-small-button" type="button" onClick={add}>+ Agregar foto</button>}>
      <p className="admin-helper admin-helper--lead">Estas imágenes se muestran en la sección “Espacios para mirar despacio”. Puedes reemplazarlas por archivos propios o pegar URLs.</p>
      {content.gallery.length ? (
        <div className="admin-gallery-list">
          {content.gallery.map((item, index) => (
            <div className="admin-gallery-item" key={`${item.image}-${index}`}>
              <div className="admin-property__top">
                <strong>Foto {String(index + 1).padStart(2, '0')}</strong>
                <button className="admin-remove-button" type="button" onClick={() => remove(index)}>Eliminar</button>
              </div>
              <div className="admin-property-editor">
                <MediaPreview src={item.image} alt={item.alt} />
                <div className="admin-fields">
                  <Field label="URL de la imagen" help="Acepta una URL https:// o una ruta /uploads/."><input required maxLength={500} inputMode="url" value={item.image} onChange={(event) => update(index, 'image', event.target.value)} /></Field>
                  <Field label="Texto alternativo"><input required maxLength={160} value={item.alt} onChange={(event) => update(index, 'alt', event.target.value)} /></Field>
                  <UploadButton label={busy ? 'Subiendo…' : 'Subir foto'} disabled={busy} onUpload={(file) => upload(index, file)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState>No hay fotos. Usa “Agregar foto” para crear la primera.</EmptyState>}
    </EditorCard>
  );
}

function ServicesEditor({ content, update, add, remove }: { content: SiteContent; update: EditorActions['updateService']; add: EditorActions['addService']; remove: EditorActions['removeService'] }) {
  return (
    <EditorCard label="05 · Servicios" action={<button className="admin-small-button" type="button" onClick={add}>+ Agregar servicio</button>}>
      {content.services.length ? (
        <div className="admin-property-list">
          {content.services.map((service, index) => (
            <div className="admin-property" key={`${service.number}-${index}`}>
              <div className="admin-property__top">
                <strong>{service.number}</strong>
                <button className="admin-remove-button" type="button" onClick={() => remove(index)}>Eliminar</button>
              </div>
              <div className="admin-fields admin-fields--two">
                <Field label="Número"><input required inputMode="numeric" maxLength={3} pattern="[0-9]{1,3}" title="Usa entre 1 y 3 números." value={service.number} onChange={(event) => update(index, 'number', event.target.value.replace(/\D/g, ''))} /></Field>
                <Field label="Título"><input required maxLength={100} value={service.title} onChange={(event) => update(index, 'title', event.target.value)} /></Field>
                <Field label="Descripción" full><textarea required maxLength={400} value={service.description} onChange={(event) => update(index, 'description', event.target.value)} rows={2} /></Field>
              </div>
            </div>
          ))}
        </div>
      ) : <EmptyState>No hay servicios configurados. Usa “Agregar servicio” para crear uno.</EmptyState>}
    </EditorCard>
  );
}

function StatsEditor({ content, update }: { content: SiteContent; update: EditorActions['updateStat'] }) {
  return (
    <EditorCard label="06 · Cifras destacadas">
      <div className="admin-stats-intro">
        <span className="admin-stats-intro__mark" aria-hidden="true">✦</span>
        <div>
          <p className="admin-stats-intro__title">Datos que hablan por tu experiencia.</p>
          <p className="admin-stats-intro__copy">Edita el valor y la frase breve que aparecerán en la portada.</p>
        </div>
      </div>
      <div className="admin-stats-grid">
        {content.stats.map((stat, index) => (
          <article className="admin-stat-editor" key={`${stat.label}-${index}`}>
            <div className="admin-stat-editor__top">
              <span className="admin-stat-editor__index">{String(index + 1).padStart(2, '0')}</span>
              <span className="admin-stat-editor__tag">Dato destacado</span>
            </div>
            <div className="admin-stat-editor__preview" aria-live="polite">
              <strong>{stat.value || '00'}</strong>
              <span>{stat.label || 'Descripción breve'}</span>
            </div>
            <div className="admin-stat-editor__fields">
              <Field label="Valor principal"><input required maxLength={20} inputMode="decimal" value={stat.value} onChange={(event) => update(index, 'value', event.target.value)} /></Field>
              <Field label="Descripción breve"><input required maxLength={100} value={stat.label} onChange={(event) => update(index, 'label', event.target.value)} /></Field>
            </div>
          </article>
        ))}
      </div>
    </EditorCard>
  );
}

function AboutEditor({ content, busy, update, upload }: { content: SiteContent; busy: boolean; update: EditorActions['updateAbout']; upload: EditorActions['uploadAbout'] }) {
  return (
    <EditorCard label="07 · Nosotros">
      <div className="admin-fields admin-fields--two">
        <Field label="Antetítulo"><input required maxLength={100} value={content.about.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} /></Field>
        <Field label="Título"><input required maxLength={140} value={content.about.title} onChange={(event) => update('title', event.target.value)} /></Field>
        <Field label="Descripción" full><textarea required maxLength={600} value={content.about.description} onChange={(event) => update('description', event.target.value)} rows={4} /></Field>
        <Field label="Imagen · URL" full help="Acepta una URL https:// o una ruta /uploads.">
          <input required maxLength={1000} inputMode="url" value={content.about.image} onChange={(event) => update('image', event.target.value)} />
        </Field>
        <Field label="Texto alternativo" full><input required maxLength={160} value={content.about.imageAlt} onChange={(event) => update('imageAlt', event.target.value)} /></Field>
        <Field label="Cita destacada" full><textarea required maxLength={300} value={content.about.quote} onChange={(event) => update('quote', event.target.value)} rows={3} /></Field>
        <UploadButton label={busy ? 'Subiendo…' : 'Subir imagen'} disabled={busy} onUpload={upload} />
      </div>
    </EditorCard>
  );
}

function LocationEditor({ content, update }: { content: SiteContent; update: EditorActions['updateLocation'] }) {
  return (
    <EditorCard label="08 · Ubicación y mapa">
      <div className="admin-fields admin-fields--two">
        <Field label="Título"><input required maxLength={120} value={content.location.title} onChange={(event) => update('title', event.target.value)} /></Field>
        <Field label="Dirección para mostrar"><input value={content.business.address} readOnly aria-describedby="location-address-help" /></Field>
        <Field label="Descripción" full><textarea required maxLength={500} value={content.location.description} onChange={(event) => update('description', event.target.value)} rows={3} /></Field>
        <Field label="Dirección de búsqueda en Maps" full help="Escribe el lugar que Google Maps debe ubicar.">
          <input required maxLength={180} value={content.location.mapQuery} onChange={(event) => update('mapQuery', event.target.value)} />
        </Field>
        <Field label="URL del mapa embebido" full help="Pega la URL de inserción de Google Maps, no la URL normal de compartir.">
          <input type="url" required maxLength={1000} value={content.location.mapUrl} onChange={(event) => update('mapUrl', event.target.value)} />
        </Field>
      </div>
      <p className="admin-helper location-editor__note" id="location-address-help">El pin rojo del sitio se coloca sobre el centro de la búsqueda. Para cambiar la dirección visible, edítala en “Contacto y marca”.</p>
    </EditorCard>
  );
}

function DetailsEditor({ content, updateSocial, updateSeo, updateNotice }: { content: SiteContent; updateSocial: EditorActions['updateSocial']; updateSeo: EditorActions['updateSeo']; updateNotice: EditorActions['updateNotice'] }) {
  return (
    <EditorCard label="09 · Redes, SEO y aviso">
      <div className="admin-fields admin-fields--two">
        <Field label="Facebook"><input type="url" required maxLength={500} placeholder="https://facebook.com/tu-cuenta" value={content.social.facebook} onChange={(event) => updateSocial('facebook', event.target.value)} /></Field>
        <Field label="Instagram"><input type="url" required maxLength={500} placeholder="https://instagram.com/tu-cuenta" value={content.social.instagram} onChange={(event) => updateSocial('instagram', event.target.value)} /></Field>
        <Field label="TikTok"><input type="url" required maxLength={500} placeholder="https://tiktok.com/@tu-cuenta" value={content.social.tiktok} onChange={(event) => updateSocial('tiktok', event.target.value)} /></Field>
        <Field label="Título SEO" full><input required maxLength={160} value={content.seo.title} onChange={(event) => updateSeo('title', event.target.value)} /></Field>
        <Field label="Descripción SEO" full><textarea required maxLength={320} value={content.seo.description} onChange={(event) => updateSeo('description', event.target.value)} rows={3} /></Field>
        <Field label="Aviso superior del sitio" full><input required maxLength={180} value={content.demoNotice} onChange={(event) => updateNotice(event.target.value)} /></Field>
      </div>
    </EditorCard>
  );
}

export type EditorActions = {
  updateBusiness: (field: keyof SiteContent['business'], value: string) => void;
  updateHero: (field: EditableHeroField, value: string) => void;
  updateHeroSlide: (index: number, field: keyof HeroSlide, value: string) => void;
  updateProperty: (index: number, field: keyof Property, value: string) => void;
  updateGallery: (index: number, field: keyof GalleryItem, value: string) => void;
  updateService: (index: number, field: keyof Service, value: string) => void;
  updateStat: (index: number, field: keyof Stat, value: string) => void;
  updateAbout: (field: keyof SiteContent['about'], value: string) => void;
  updateLocation: (field: keyof SiteContent['location'], value: string) => void;
  updateSocial: (field: keyof SiteContent['social'], value: string) => void;
  updateSeo: (field: keyof SiteContent['seo'], value: string) => void;
  updateNotice: (value: string) => void;
  addProperty: () => void;
  removeProperty: (index: number) => void;
  addGallery: () => void;
  removeGallery: (index: number) => void;
  addService: () => void;
  removeService: (index: number) => void;
  uploadHero: (index: number, file: File) => void;
  uploadProperty: (index: number, file: File) => void;
  uploadGallery: (index: number, file: File) => void;
  uploadAbout: (file: File) => void;
};

export function ActiveEditor({ section, content, busy, actions }: { section: EditorSectionId; content: SiteContent; busy: boolean; actions: EditorActions }) {
  switch (section) {
    case 'contact': return <ContactEditor content={content} update={actions.updateBusiness} />;
    case 'hero': return <HeroEditor content={content} busy={busy} update={actions.updateHero} updateSlide={actions.updateHeroSlide} upload={actions.uploadHero} />;
    case 'properties': return <PropertyEditor content={content} busy={busy} update={actions.updateProperty} add={actions.addProperty} remove={actions.removeProperty} upload={actions.uploadProperty} />;
    case 'gallery': return <GalleryEditor content={content} busy={busy} update={actions.updateGallery} add={actions.addGallery} remove={actions.removeGallery} upload={actions.uploadGallery} />;
    case 'services': return <ServicesEditor content={content} update={actions.updateService} add={actions.addService} remove={actions.removeService} />;
    case 'stats': return <StatsEditor content={content} update={actions.updateStat} />;
    case 'about': return <AboutEditor content={content} busy={busy} update={actions.updateAbout} upload={actions.uploadAbout} />;
    case 'location': return <LocationEditor content={content} update={actions.updateLocation} />;
    case 'details': return <DetailsEditor content={content} updateSocial={actions.updateSocial} updateSeo={actions.updateSeo} updateNotice={actions.updateNotice} />;
  }
}
