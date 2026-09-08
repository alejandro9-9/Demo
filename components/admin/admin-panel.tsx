'use client';
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import { FormEvent, ReactNode, useState } from 'react';
import { siteContent } from '@/lib/content';
import type { HeroSlide, Property, Service, SiteContent, Stat } from '@/lib/content';

type Notice = { tone: 'success' | 'error' | 'info'; text: string } | null;
type GalleryItem = SiteContent['gallery'][number];
type EditableHeroField = Exclude<keyof SiteContent['hero'], 'slides'>;

function copyContent() {
  return JSON.parse(JSON.stringify(siteContent)) as SiteContent;
}

function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) {
  return <label className={full ? 'admin-field--full' : undefined}>{label}{children}</label>;
}

function EditorCard({ label, action, children }: { label: string; action?: ReactNode; children: ReactNode }) {
  return <section className="admin-card"><div className="admin-card__heading"><p className="admin-card__label">{label}</p>{action}</div>{children}</section>;
}

function MediaPreview({ src, alt }: { src: string; alt: string }) {
  return <div className="admin-media-preview">{src ? <img src={src} alt={alt} /> : <span>Sin imagen</span>}</div>;
}

function UploadButton({ label, onUpload, disabled = false }: { label: string; onUpload: (file: File) => void; disabled?: boolean }) {
  return <label className={`admin-upload-button${disabled ? ' admin-upload-button--disabled' : ''}`}><span>{label}</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={disabled} onChange={(event) => { const file = event.target.files?.[0]; if (file) onUpload(file); event.currentTarget.value = ''; }} /></label>;
}

function LoginPanel({ busy, notice, onLogin }: { busy: boolean; notice: Notice; onLogin: (event: FormEvent<HTMLFormElement>) => void }) {
  return <main className="admin-shell admin-shell--login"><div className="admin-login"><a className="brand" href="/"><span className="brand__mark">CN</span><span className="brand__name">Cumbre Norte</span></a><p className="eyebrow">Área privada</p><h1>Editar la página</h1><p className="admin-lead">Administra fotos, propiedades, servicios, textos y datos de contacto desde un solo lugar.</p><form onSubmit={onLogin} className="admin-form"><Field label="Usuario"><input name="username" autoComplete="username" required /></Field><Field label="Contraseña"><input name="password" type="password" autoComplete="current-password" required /></Field><button className="button button--dark" type="submit" disabled={busy}>{busy ? 'Validando…' : 'Iniciar sesión'} <span>↗</span></button></form>{notice ? <p className={`admin-notice admin-notice--${notice.tone}`}>{notice.text}</p> : null}<a className="admin-back" href="/">← Volver a la web pública</a></div></main>;
}

function ContactEditor({ content, update }: { content: SiteContent; update: (field: keyof SiteContent['business'], value: string) => void }) {
  return <EditorCard label="01 · Contacto y marca"><div className="admin-fields admin-fields--two"><Field label="Nombre de la empresa"><input value={content.business.name} onChange={(event) => update('name', event.target.value)} /></Field><Field label="Texto corto"><input value={content.business.eyebrow} onChange={(event) => update('eyebrow', event.target.value)} /></Field><Field label="Descripción de la empresa" full><textarea value={content.business.description} onChange={(event) => update('description', event.target.value)} rows={3} /></Field><Field label="Teléfono"><input value={content.business.phone} onChange={(event) => update('phone', event.target.value)} /></Field><Field label="WhatsApp sin espacios"><input value={content.business.whatsapp} onChange={(event) => update('whatsapp', event.target.value)} /></Field><Field label="Mensaje inicial de WhatsApp"><input value={content.business.whatsappMessage} onChange={(event) => update('whatsappMessage', event.target.value)} /></Field><Field label="Email"><input type="email" value={content.business.email} onChange={(event) => update('email', event.target.value)} /></Field><Field label="Dirección visible"><input value={content.business.address} onChange={(event) => update('address', event.target.value)} /></Field><Field label="Horario"><input value={content.business.hours} onChange={(event) => update('hours', event.target.value)} /></Field></div></EditorCard>;
}

function HeroEditor({ content, busy, update, updateSlide, upload }: { content: SiteContent; busy: boolean; update: (field: EditableHeroField, value: string) => void; updateSlide: (index: number, field: keyof HeroSlide, value: string) => void; upload: (index: number, file: File) => void }) {
  const slides = content.hero.slides?.length ? content.hero.slides : [{ image: content.hero.image, imageAlt: content.hero.imageAlt, label: 'Una mirada más humana' }];
  return <EditorCard label="02 · Portada y carrusel"><div className="admin-fields admin-fields--two"><Field label="Titular" full><textarea value={content.hero.title} onChange={(event) => update('title', event.target.value)} rows={2} /></Field><Field label="Subtítulo" full><textarea value={content.hero.subtitle} onChange={(event) => update('subtitle', event.target.value)} rows={3} /></Field><Field label="Texto del botón principal"><input value={content.hero.primaryCta} onChange={(event) => update('primaryCta', event.target.value)} /></Field><Field label="Texto del botón secundario"><input value={content.hero.secondaryCta} onChange={(event) => update('secondaryCta', event.target.value)} /></Field></div><div className="admin-subsection"><div className="admin-card__heading"><p className="admin-card__label">Imágenes rotativas · {slides.length} configuradas</p><span className="admin-helper">Cambian cada 3.5 segundos</span></div><div className="admin-media-list">{slides.map((slide, index) => <div className="admin-media-item" key={`${slide.image}-${index}`}><MediaPreview src={slide.image} alt={slide.imageAlt} /><div className="admin-fields"><Field label={`Imagen ${String(index + 1).padStart(2, '0')} · URL`}><input value={slide.image} onChange={(event) => updateSlide(index, 'image', event.target.value)} /></Field><Field label="Etiqueta"><input value={slide.label} onChange={(event) => updateSlide(index, 'label', event.target.value)} /></Field><Field label="Texto alternativo"><input value={slide.imageAlt} onChange={(event) => updateSlide(index, 'imageAlt', event.target.value)} /></Field><UploadButton label={busy ? 'Subiendo…' : 'Subir reemplazo'} disabled={busy} onUpload={(file) => upload(index, file)} /></div></div>)}</div></div></EditorCard>;
}

function PropertyEditor({ content, busy, update, add, remove, upload }: { content: SiteContent; busy: boolean; update: (index: number, field: keyof Property, value: string) => void; add: () => void; remove: (index: number) => void; upload: (index: number, file: File) => void }) {
  return <EditorCard label="03 · Catálogo de propiedades" action={<button className="admin-small-button" type="button" onClick={add}>+ Agregar propiedad</button>}><div className="admin-property-list">{content.featuredProperties.map((property, index) => <div className="admin-property" key={property.id}><div className="admin-property__top"><strong>{String(index + 1).padStart(2, '0')}</strong><button className="admin-remove-button" type="button" onClick={() => remove(index)}>Eliminar</button></div><div className="admin-property-editor"><MediaPreview src={property.image} alt={property.imageAlt} /><div className="admin-fields admin-fields--two"><Field label="Título"><input value={property.title} onChange={(event) => update(index, 'title', event.target.value)} /></Field><Field label="Etiqueta"><input value={property.tag} onChange={(event) => update(index, 'tag', event.target.value)} /></Field><Field label="Ubicación"><input value={property.location} onChange={(event) => update(index, 'location', event.target.value)} /></Field><Field label="Precio"><input value={property.price} onChange={(event) => update(index, 'price', event.target.value)} /></Field><Field label="Detalles"><input value={property.details} onChange={(event) => update(index, 'details', event.target.value)} /></Field><Field label="Imagen URL"><input value={property.image} onChange={(event) => update(index, 'image', event.target.value)} /></Field><Field label="Descripción" full><textarea value={property.description} onChange={(event) => update(index, 'description', event.target.value)} rows={3} /></Field><Field label="Texto alternativo" full><input value={property.imageAlt} onChange={(event) => update(index, 'imageAlt', event.target.value)} /></Field><UploadButton label={busy ? 'Subiendo…' : 'Subir foto'} disabled={busy} onUpload={(file) => upload(index, file)} /></div></div></div>)}</div></EditorCard>;
}

function GalleryEditor({ content, busy, update, add, remove, upload }: { content: SiteContent; busy: boolean; update: (index: number, field: keyof GalleryItem, value: string) => void; add: () => void; remove: (index: number) => void; upload: (index: number, file: File) => void }) {
  return <EditorCard label="04 · Catálogo fotográfico" action={<button className="admin-small-button" type="button" onClick={add}>+ Agregar foto</button>}><p className="admin-helper admin-helper--lead">Estas imágenes se muestran en la sección “Espacios para mirar despacio”. Puedes reemplazarlas por archivos propios o pegar URLs.</p><div className="admin-gallery-list">{content.gallery.map((item, index) => <div className="admin-gallery-item" key={`${item.image}-${index}`}><div className="admin-property__top"><strong>Foto {String(index + 1).padStart(2, '0')}</strong><button className="admin-remove-button" type="button" onClick={() => remove(index)}>Eliminar</button></div><div className="admin-property-editor"><MediaPreview src={item.image} alt={item.alt} /><div className="admin-fields"><Field label="URL de la imagen"><input value={item.image} onChange={(event) => update(index, 'image', event.target.value)} /></Field><Field label="Texto alternativo"><input value={item.alt} onChange={(event) => update(index, 'alt', event.target.value)} /></Field><UploadButton label={busy ? 'Subiendo…' : 'Subir foto'} disabled={busy} onUpload={(file) => upload(index, file)} /></div></div></div>)}</div></EditorCard>;
}

function ServicesEditor({ content, update, add, remove }: { content: SiteContent; update: (index: number, field: keyof Service, value: string) => void; add: () => void; remove: (index: number) => void }) {
  return <EditorCard label="05 · Servicios" action={<button className="admin-small-button" type="button" onClick={add}>+ Agregar servicio</button>}><div className="admin-property-list">{content.services.map((service, index) => <div className="admin-property" key={`${service.number}-${index}`}><div className="admin-property__top"><strong>{service.number}</strong><button className="admin-remove-button" type="button" onClick={() => remove(index)}>Eliminar</button></div><div className="admin-fields admin-fields--two"><Field label="Número"><input value={service.number} onChange={(event) => update(index, 'number', event.target.value)} /></Field><Field label="Título"><input value={service.title} onChange={(event) => update(index, 'title', event.target.value)} /></Field><Field label="Descripción" full><textarea value={service.description} onChange={(event) => update(index, 'description', event.target.value)} rows={2} /></Field></div></div>)}</div></EditorCard>;
}

function StatsEditor({ content, update }: { content: SiteContent; update: (index: number, field: keyof Stat, value: string) => void }) {
  return <EditorCard label="06 · Cifras destacadas"><div className="admin-stats-grid">{content.stats.map((stat, index) => <div className="admin-stat-editor" key={`${stat.label}-${index}`}><Field label="Cifra"><input value={stat.value} onChange={(event) => update(index, 'value', event.target.value)} /></Field><Field label="Texto"><input value={stat.label} onChange={(event) => update(index, 'label', event.target.value)} /></Field></div>)}</div></EditorCard>;
}

function LocationEditor({ content, update }: { content: SiteContent; update: (field: keyof SiteContent['location'], value: string) => void }) {
  return <EditorCard label="07 · Ubicación y mapa"><div className="admin-fields admin-fields--two"><Field label="Título"><input value={content.location.title} onChange={(event) => update('title', event.target.value)} /></Field><Field label="Dirección para mostrar"><input value={content.business.address} readOnly /></Field><Field label="Descripción" full><textarea value={content.location.description} onChange={(event) => update('description', event.target.value)} rows={3} /></Field><Field label="Dirección de búsqueda en Maps" full><input value={content.location.mapQuery} onChange={(event) => update('mapQuery', event.target.value)} /></Field><Field label="URL del mapa embebido" full><input value={content.location.mapUrl} onChange={(event) => update('mapUrl', event.target.value)} /></Field></div><p className="admin-helper admin-helper--lead">El pin rojo del sitio se coloca sobre el centro de esta búsqueda. Para cambiar el texto visible, edita la dirección en “Contacto y marca”.</p></EditorCard>;
}

function DetailsEditor({ content, updateSocial, updateSeo, updateNotice }: { content: SiteContent; updateSocial: (field: keyof SiteContent['social'], value: string) => void; updateSeo: (field: keyof SiteContent['seo'], value: string) => void; updateNotice: (value: string) => void }) {
  return <EditorCard label="08 · Redes, SEO y aviso"><div className="admin-fields admin-fields--two"><Field label="Facebook"><input value={content.social.facebook} onChange={(event) => updateSocial('facebook', event.target.value)} /></Field><Field label="Instagram"><input value={content.social.instagram} onChange={(event) => updateSocial('instagram', event.target.value)} /></Field><Field label="TikTok"><input value={content.social.tiktok} onChange={(event) => updateSocial('tiktok', event.target.value)} /></Field><Field label="Título SEO" full><input value={content.seo.title} onChange={(event) => updateSeo('title', event.target.value)} /></Field><Field label="Descripción SEO" full><textarea value={content.seo.description} onChange={(event) => updateSeo('description', event.target.value)} rows={3} /></Field><Field label="Aviso superior del sitio" full><input value={content.demoNotice} onChange={(event) => updateNotice(event.target.value)} /></Field></div></EditorCard>;
}

const editorSections = [
  { id: 'contact', number: '01', label: 'Contacto y marca', description: 'Datos comerciales, WhatsApp y descripción.' },
  { id: 'hero', number: '02', label: 'Portada y carrusel', description: 'Titular, botones e imágenes principales.' },
  { id: 'properties', number: '03', label: 'Propiedades', description: 'Catálogo, precios y fichas detalladas.' },
  { id: 'gallery', number: '04', label: 'Catálogo fotográfico', description: 'Galería de imágenes del sitio.' },
  { id: 'services', number: '05', label: 'Servicios', description: 'Cómo ayudas a tus clientes.' },
  { id: 'stats', number: '06', label: 'Cifras destacadas', description: 'Datos breves de confianza.' },
  { id: 'location', number: '07', label: 'Ubicación y mapa', description: 'Dirección, Maps y descripción.' },
  { id: 'details', number: '08', label: 'Redes, SEO y aviso', description: 'Visibilidad y comunicación del sitio.' },
] as const;

type EditorSectionId = typeof editorSections[number]['id'];

export function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busy, setBusy] = useState(false);
  const [activeSection, setActiveSection] = useState<EditorSectionId>('contact');

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true); setNotice(null);
    try {
      const response = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: form.get('username'), password: form.get('password') }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) { setNotice({ tone: 'error', text: result.error || 'No se pudo iniciar sesión.' }); return; }
      setLoggedIn(true); setContent(copyContent()); setNotice({ tone: 'success', text: 'Sesión iniciada. Ya puedes editar todo el contenido.' });
    } catch { setNotice({ tone: 'error', text: 'No se pudo conectar con el servidor local.' }); } finally { setBusy(false); }
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setLoggedIn(false); setContent(null); setNotice(null);
  }

  function updateBusiness(field: keyof SiteContent['business'], value: string) { setContent((current) => current ? { ...current, business: { ...current.business, [field]: value } } : current); }
  function updateHero(field: EditableHeroField, value: string) { setContent((current) => current ? { ...current, hero: { ...current.hero, [field]: value } } : current); }
  function updateHeroSlide(index: number, field: keyof HeroSlide, value: string) { setContent((current) => { if (!current) return current; const slides = current.hero.slides?.length ? [...current.hero.slides] : [{ image: current.hero.image, imageAlt: current.hero.imageAlt, label: 'Una mirada más humana' }]; slides[index] = { ...slides[index], [field]: value }; return { ...current, hero: { ...current.hero, image: index === 0 && field === 'image' ? value : current.hero.image, imageAlt: index === 0 && field === 'imageAlt' ? value : current.hero.imageAlt, slides } }; }); }
  function updateProperty(index: number, field: keyof Property, value: string) { setContent((current) => current ? { ...current, featuredProperties: current.featuredProperties.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : current); }
  function updateGallery(index: number, field: keyof GalleryItem, value: string) { setContent((current) => current ? { ...current, gallery: current.gallery.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : current); }
  function updateService(index: number, field: keyof Service, value: string) { setContent((current) => current ? { ...current, services: current.services.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : current); }
  function updateStat(index: number, field: keyof Stat, value: string) { setContent((current) => current ? { ...current, stats: current.stats.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : current); }
  function updateLocation(field: keyof SiteContent['location'], value: string) { setContent((current) => current ? { ...current, location: { ...current.location, [field]: value } } : current); }
  function updateSocial(field: keyof SiteContent['social'], value: string) { setContent((current) => current ? { ...current, social: { ...current.social, [field]: value } } : current); }
  function updateSeo(field: keyof SiteContent['seo'], value: string) { setContent((current) => current ? { ...current, seo: { ...current.seo, [field]: value } } : current); }

  function addProperty() { setContent((current) => current ? { ...current, featuredProperties: [...current.featuredProperties, { id: `propiedad-${Date.now()}`, tag: 'Propiedad · Venta', title: 'Nueva propiedad', location: 'Lima, Perú', price: 'US$ 0', details: 'Completa los detalles', description: 'Describe aquí la propiedad para tus visitantes.', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=86', imageAlt: 'Imagen de la nueva propiedad' }] } : current); }
  function removeProperty(index: number) { setContent((current) => current ? { ...current, featuredProperties: current.featuredProperties.filter((_, itemIndex) => itemIndex !== index) } : current); }
  function addGallery() { setContent((current) => current ? { ...current, gallery: [...current.gallery, { image: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=86', alt: 'Nuevo espacio de la propiedad' }] } : current); }
  function removeGallery(index: number) { setContent((current) => current ? { ...current, gallery: current.gallery.filter((_, itemIndex) => itemIndex !== index) } : current); }
  function addService() { setContent((current) => current ? { ...current, services: [...current.services, { number: String(current.services.length + 1).padStart(2, '0'), title: 'Nuevo servicio', description: 'Describe este servicio para tus visitantes.' }] } : current); }
  function removeService(index: number) { setContent((current) => current ? { ...current, services: current.services.filter((_, itemIndex) => itemIndex !== index) } : current); }

  async function uploadImage(file: File, onUploaded: (url: string) => void) {
    setBusy(true); setNotice({ tone: 'info', text: 'Subiendo imagen…' });
    try {
      const form = new FormData(); form.append('file', file);
      const response = await fetch('/api/admin/upload', { method: 'POST', body: form });
      const result = await response.json() as { error?: string; url?: string };
      if (!response.ok || !result.url) { setNotice({ tone: 'error', text: result.error || 'No se pudo subir la imagen.' }); return; }
      onUploaded(result.url); setNotice({ tone: 'success', text: 'Imagen cargada. Guarda para publicar el cambio.' });
    } catch { setNotice({ tone: 'error', text: 'No se pudo conectar con el servidor de imágenes.' }); } finally { setBusy(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!content) return;
    setBusy(true); setNotice(null);
    try {
      const response = await fetch('/api/admin/content', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) });
      const result = await response.json() as { error?: string; message?: string };
      setNotice(response.ok ? { tone: 'success', text: result.message || 'Cambios guardados.' } : { tone: 'error', text: result.error || 'No se pudo guardar.' });
    } catch { setNotice({ tone: 'error', text: 'No se pudo conectar con el servidor.' }); } finally { setBusy(false); }
  }

  const currentSection = editorSections.find((section) => section.id === activeSection) || editorSections[0];

  function renderActiveEditor() {
    if (!content) return null;
    switch (activeSection) {
      case 'contact': return <ContactEditor content={content} update={updateBusiness} />;
      case 'hero': return <HeroEditor content={content} busy={busy} update={updateHero} updateSlide={updateHeroSlide} upload={(index, file) => void uploadImage(file, (url) => updateHeroSlide(index, 'image', url))} />;
      case 'properties': return <PropertyEditor content={content} busy={busy} update={updateProperty} add={addProperty} remove={removeProperty} upload={(index, file) => void uploadImage(file, (url) => updateProperty(index, 'image', url))} />;
      case 'gallery': return <GalleryEditor content={content} busy={busy} update={updateGallery} add={addGallery} remove={removeGallery} upload={(index, file) => void uploadImage(file, (url) => updateGallery(index, 'image', url))} />;
      case 'services': return <ServicesEditor content={content} update={updateService} add={addService} remove={removeService} />;
      case 'stats': return <StatsEditor content={content} update={updateStat} />;
      case 'location': return <LocationEditor content={content} update={updateLocation} />;
      case 'details': return <DetailsEditor content={content} updateSocial={updateSocial} updateSeo={updateSeo} updateNotice={(value) => setContent((current) => current ? { ...current, demoNotice: value } : current)} />;
    }
  }

  if (!loggedIn || !content) return <LoginPanel busy={busy} notice={notice} onLogin={login} />;

  return <main className="admin-shell"><header className="admin-header"><a className="brand" href="/"><span className="brand__mark">CN</span><span className="brand__name">Cumbre Norte</span></a><div className="admin-header__actions"><a href="/" target="_blank" rel="noreferrer">Ver página ↗</a><button type="button" onClick={logout}>Cerrar sesión</button></div></header><div className="admin-layout"><aside className="admin-sidebar"><p className="eyebrow">Panel privado</p><h1>Contenido web</h1><p>Edita cada parte del sitio desde su propia sección.</p><nav className="admin-section-nav" aria-label="Secciones del editor">{editorSections.map((section) => <button className={`admin-section-nav__item${section.id === activeSection ? ' admin-section-nav__item--active' : ''}`} type="button" key={section.id} aria-current={section.id === activeSection ? 'page' : undefined} onClick={() => setActiveSection(section.id)}><span className="admin-section-nav__number">{section.number}</span><span className="admin-section-nav__copy"><strong>{section.label}</strong><small>{section.description}</small></span><span className="admin-section-nav__arrow" aria-hidden="true">→</span></button>)}</nav><span className="admin-sidebar__status"><i /> Sesión segura</span></aside><form className="admin-editor" onSubmit={save}><div className="admin-editor__intro"><div><p className="eyebrow">{currentSection.number} · Editor de contenido</p><h2>{currentSection.label}</h2><p className="admin-editor__description">{currentSection.description}</p></div><button className="button button--dark" type="submit" disabled={busy}>{busy ? 'Guardando…' : 'Guardar cambios'} <span>↓</span></button></div>{notice ? <p className={`admin-notice admin-notice--${notice.tone}`}>{notice.text}</p> : null}<div className="admin-section-stage">{renderActiveEditor()}</div><div className="admin-editor__bottom"><p>Los cambios de esta sección se guardan junto con el contenido completo.</p></div></form></div></main>;
}
